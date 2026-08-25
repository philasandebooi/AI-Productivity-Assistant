import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Upload, Sparkles, Loader2, Eraser } from "lucide-react";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
  head: () => ({
    meta: [
      { title: "Policy & Document Assistant | SD Assist" },
      {
        name: "description",
        content:
          "Ask questions, summarise requirements and build checklists based only on approved internal documents you provide.",
      },
      { property: "og:title", content: "Policy & Document Assistant" },
      {
        property: "og:description",
        content: "Document-grounded answers for departmental policies and guidelines.",
      },
    ],
  }),
});

const DISCLAIMER =
  "This response is based on the document provided and should be verified against the original document.";

const SYSTEM = `You answer strictly and only from the document text supplied by the user.
If the document does not contain the answer, say: "The provided document does not contain this information."
Never add outside knowledge, legislation, policy or interpretation. You do not replace official policy interpretation.
End every response with exactly this line: "${DISCLAIMER}"`;

export function DocumentWorkspace({
  title,
  description,
  system,
  actions,
  note,
  askLabel = "Your question",
}: {
  title: string;
  description: string;
  system: string;
  actions: { label: string; instruction: string; primary?: boolean }[];
  note: string;
  askLabel?: string;
}) {
  const [doc, setDoc] = useState("");
  const [docB, setDocB] = useState("");
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { run, loading, error, setError } = useAI();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>, target: "a" | "b") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (target === "a") setDoc(text);
    else setDocB(text);
  };

  const execute = async (label: string, instruction: string) => {
    if (!doc.trim()) {
      setError("Please paste or upload a document first.");
      return;
    }
    setActive(label);
    const compare = docB.trim() ? `\n\nSECOND DOCUMENT:\n${docB}` : "";
    const res = await run(system, [
      {
        role: "user",
        content: `${instruction}\n${question.trim() ? `User question: ${question}\n` : ""}\nDOCUMENT:\n${doc}${compare}`,
      },
    ]);
    if (res) setOutput(res);
    setActive(null);
  };

  return (
    <AppLayout>
      <PageHeader title={title} description={description} />
      <PrivacyNotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="doc">Approved document text</Label>
            <Textarea
              id="doc"
              rows={12}
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder="Paste the approved policy, guideline or report text here…"
            />
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.json"
              className="hidden"
              onChange={(e) => onFile(e, "a")}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5" /> Upload Document (.txt, .md, .csv)
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="docB">Second document (optional, for comparison)</Label>
            <Textarea
              id="docB"
              rows={4}
              value={docB}
              onChange={(e) => setDocB(e.target.value)}
              placeholder="Paste a second document to compare…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q">{askLabel}</Label>
            <Input
              id="q"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What must employees do before a monitoring visit?"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((a) => (
              <Button
                key={a.label}
                size="sm"
                variant={a.primary ? "default" : "outline"}
                disabled={loading}
                onClick={() => execute(a.label, a.instruction)}
              >
                {loading && active === a.label ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {a.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDoc("");
                setDocB("");
                setQuestion("");
                setOutput(null);
                setError(null);
              }}
            >
              <Eraser className="size-3.5" /> Clear
            </Button>
          </div>
        </div>

        <AIOutput content={output} loading={loading} error={error} note={note} />
      </div>
    </AppLayout>
  );
}

function DocumentsPage() {
  return (
    <DocumentWorkspace
      title="Policy & Document Assistant"
      description="Upload or paste approved internal documents, policies, guidelines and reports, then ask questions grounded strictly in that document."
      system={SYSTEM}
      note={DISCLAIMER}
      actions={[
        { label: "Ask AI", primary: true, instruction: "Answer the user's question using only the document." },
        { label: "Summarise requirements", instruction: "Summarise the requirements set out in the document." },
        { label: "Identify employee actions", instruction: "List the actions employees are required to take according to the document." },
        { label: "Create checklist", instruction: "Create a compliance checklist based only on the document, with responsible person and deadline columns marked [To be confirmed] where not stated." },
      ]}
    />
  );
}
