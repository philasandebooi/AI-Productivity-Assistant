import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { programmes } from "@/data/sample";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/programmes")({
  component: ProgrammesPage,
  head: () => ({
    meta: [
      { title: "Programme & Project Tracker | SD Assist" },
      {
        name: "description",
        content:
          "Track programme objectives, deadlines, progress, challenges and AI alerts across departmental projects.",
      },
      { property: "og:title", content: "Programme & Project Progress Tracker" },
      {
        property: "og:description",
        content: "Weekly summaries, delay alerts and management-ready programme reports.",
      },
    ],
  }),
});

const SYSTEM = `You support programme and project administration in a South African government department.
Work only from the programme data supplied. Never invent progress figures, dates or outcomes.
Be concise, structured and management-ready.`;

function tone(status: string) {
  if (status === "On track") return "bg-success/15 text-success border-success/30";
  if (status === "At risk") return "bg-warning/20 text-warning-foreground border-warning/40";
  if (status === "Delayed") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

const context = programmes
  .map(
    (p) =>
      `${p.name}: objective "${p.objective}"; lead ${p.lead}; deadline ${p.deadline}; progress ${p.progress}%; status ${p.status}; alert "${p.alert}"; challenges "${p.challenges}"; next steps "${p.nextSteps}"`,
  )
  .join("\n");

function ProgrammesPage() {
  const { run, loading, error } = useAI();
  const [output, setOutput] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const go = async (label: string, instruction: string) => {
    setActive(label);
    const res = await run(SYSTEM, [{ role: "user", content: `${instruction}\n\nProgramme data:\n${context}` }]);
    if (res) setOutput(res);
    setActive(null);
  };

  const actions = [
    { label: "Weekly summary", instruction: "Write a weekly programme summary for management.", primary: true },
    { label: "Outstanding tasks", instruction: "List all outstanding tasks per programme." },
    { label: "Delayed activity alerts", instruction: "List delayed and at-risk activities with the reason and urgency." },
    { label: "Risks & challenges", instruction: "Summarise risks and challenges, with mitigation suggestions clearly marked as suggestions." },
    { label: "Suggested follow-ups", instruction: "Suggest follow-up actions with responsible person and suggested date." },
    { label: "Management report", instruction: "Produce a management-ready programme progress report with headings." },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Programme & Project Progress Tracker"
        description="Monitor objectives, responsible employees, deadlines, progress and challenges — with AI summaries and alerts."
      />
      <PrivacyNotice />

      <div className="card-elevated overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programme</TableHead>
              <TableHead>Objective</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI alert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programmes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="max-w-64 text-sm text-muted-foreground">{p.objective}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{p.lead}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{p.deadline}</TableCell>
                <TableCell className="min-w-32">
                  <Progress value={p.progress} className="h-1.5" />
                  <span className="text-xs text-muted-foreground">{p.progress}%</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={tone(p.status)}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-56 text-sm text-muted-foreground">{p.alert}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated space-y-3 p-5">
          <h2 className="text-sm font-semibold">AI programme support</h2>
          <p className="text-sm text-muted-foreground">
            Generate summaries and alerts from the tracked programme data above.
          </p>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <Button
                key={a.label}
                size="sm"
                variant={a.primary ? "default" : "outline"}
                disabled={loading}
                onClick={() => go(a.label, a.instruction)}
              >
                {loading && active === a.label ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {a.label}
              </Button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {programmes.map((p) => (
              <div key={p.id} className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Challenges:</span> {p.challenges}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Next steps:</span> {p.nextSteps}
                </p>
              </div>
            ))}
          </div>
        </div>

        <AIOutput content={output} loading={loading} error={error} />
      </div>
    </AppLayout>
  );
}
