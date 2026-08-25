import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { followUps } from "@/data/sample";
import { useTasks, updateTask, removeTask, type Task } from "@/lib/task-store";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/follow-ups")({
  component: FollowUpsPage,
  head: () => ({
    meta: [
      { title: "Follow-Ups, Deadlines & Task Planner | SD Assist" },
      {
        name: "description",
        content:
          "Prioritised alerts for emails, outstanding documents, meeting actions, deadlines and report submissions.",
      },
      { property: "og:title", content: "Smart Follow-Up and Deadline Assistant" },
      {
        property: "og:description",
        content: "Never miss an urgent or overdue item across your departmental workload.",
      },
    ],
  }),
});

const urgencyTone = (u: string) =>
  u === "Overdue"
    ? "border-destructive/30 bg-destructive/10 text-destructive"
    : u === "Urgent"
      ? "border-warning/40 bg-warning/20 text-warning-foreground"
      : "border-border bg-muted text-muted-foreground";

const priorityTone = (p: string) =>
  p === "High"
    ? "border-destructive/30 bg-destructive/10 text-destructive"
    : p === "Medium"
      ? "border-warning/40 bg-warning/20 text-warning-foreground"
      : "border-border bg-muted text-muted-foreground";

function FollowUpsPage() {
  const tasks = useTasks();
  const { run, loading, error } = useAI();
  const [output, setOutput] = useState<string | null>(null);

  const prioritise = async () => {
    const res = await run(
      "You help a public servant prioritise their outstanding work. Return a numbered priority order with a one-line reason each, then a short 'Do today' list. Use only the supplied items.",
      [
        {
          role: "user",
          content: `Follow-ups: ${followUps.map((f) => `${f.item} (${f.category}, ${f.urgency}, due ${f.due})`).join("; ")}\nTasks: ${tasks
            .filter((t) => t.status !== "Completed")
            .map((t) => `${t.action} (owner ${t.owner}, due ${t.deadline}, ${t.priority})`)
            .join("; ")}`,
        },
      ],
    );
    if (res) setOutput(res);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Smart Follow-Up & Deadline Assistant"
        description="Track emails needing responses, outstanding documents, meeting actions, programme deadlines, stakeholder follow-ups and report submissions."
        actions={
          <Button onClick={prioritise} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Prioritise my work
          </Button>
        }
      />
      <PrivacyNotice />

      <div className="grid gap-4 sm:grid-cols-3">
        {(["Overdue", "Urgent", "Upcoming"] as const).map((u) => (
          <div key={u} className="card-elevated p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{u}</p>
            <p className="mt-2 text-3xl font-semibold">
              {followUps.filter((f) => f.urgency === u).length}
            </p>
          </div>
        ))}
      </div>

      <div className="card-elevated overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Prioritised alerts</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Urgency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followUps.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.item}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.category}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{f.owner}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{f.due}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={urgencyTone(f.urgency)}>
                    {f.urgency}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="card-elevated overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Task Planner</h2>
          <p className="text-xs text-muted-foreground">
            Actions approved from meetings and the assistant land here for tracking.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {t.action}
                  <p className="text-xs font-normal text-muted-foreground">Source: {t.source}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{t.owner}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{t.deadline}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={priorityTone(t.priority)}>
                    {t.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={t.status}
                    onValueChange={(v) => updateTask(t.id, { status: v as Task["status"] })}
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not started">Not started</SelectItem>
                      <SelectItem value="In progress">In progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => removeTask(t.id)} aria-label="Remove task">
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AIOutput content={output} loading={loading} error={error} />
    </AppLayout>
  );
}
