import { useState } from "react";
import { Loader2, Sparkles, Eraser } from "lucide-react";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAI } from "@/lib/use-ai";

export type Field =
  | { name: string; label: string; type: "text"; placeholder?: string }
  | { name: string; label: string; type: "textarea"; placeholder?: string; rows?: number }
  | { name: string; label: string; type: "select"; options: string[] };

export type ModuleAction = {
  label: string;
  build: (v: Record<string, string>) => string;
  primary?: boolean;
};

export function AIModule({
  title,
  description,
  system,
  fields,
  actions,
  note,
  extra,
}: {
  title: string;
  description: string;
  system: string;
  fields: Field[];
  actions: ModuleAction[];
  note?: string;
  extra?: React.ReactNode;
}) {
  const initial: Record<string, string> = Object.fromEntries(
    fields.map((f) => [f.name, f.type === "select" ? (f.options[0] ?? "") : ""]),
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [output, setOutput] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const { run, loading, error, setError } = useAI();

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));

  const execute = async (action: ModuleAction) => {
    setActive(action.label);
    const res = await run(system, [{ role: "user", content: action.build(values) }]);
    if (res) setOutput(res);
    setActive(null);
  };

  const clear = () => {
    setValues(initial);
    setOutput(null);
    setError(null);
  };

  return (
    <AppLayout>
      <PageHeader title={title} description={description} />
      <PrivacyNotice />
      {extra}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated space-y-4 p-5">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === "text" && (
                <Input
                  id={f.name}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.type === "textarea" && (
                <Textarea
                  id={f.name}
                  rows={f.rows ?? 5}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.type === "select" && (
                <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={f.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-2">
            {actions.map((a) => (
              <Button
                key={a.label}
                variant={a.primary ? "default" : "outline"}
                size="sm"
                disabled={loading}
                onClick={() => execute(a)}
              >
                {loading && active === a.label ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {a.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={clear}>
              <Eraser className="size-3.5" /> Clear
            </Button>
          </div>
        </div>

        <AIOutput
          content={output}
          loading={loading}
          error={error}
          note={note ?? "AI-generated content requires human review and verification before official use."}
        />
      </div>
    </AppLayout>
  );
}
