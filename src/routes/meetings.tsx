import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { meetings } from "@/data/sample";
import { addTasks, useTasks, type Task } from "@/lib/task-store";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/meetings")({
  component: MeetingsPage,
  head: () => ({
    meta: [
      { title: "Smart Meeting & Action Tracker | SD Assist" },
      {
        name: "description",
        content:
          "Turn meeting notes into AI summaries, decisions and reviewable action items, then send approved actions to the Task Planner.",
      },
      { property: "og:title", content: "Smart Meeting and Action Tracker" },
      {
        property: "og:description",
        content: "Meeting notes to summary to action items to task planner — with human review.",
      },
    ],
  }),
});

const SYSTEM = `You process meeting notes for a South African government department.
Return output in EXACTLY this structure and nothing else:

SUMMARY
- (3-6 concise bullet points)

DECISIONS
- (each decision on its own line; write "- None recorded" if none)

ACTIONS
- Action | Responsible person | Deadline | Priority
(one per line; use "Unassigned" or "To be confirmed" where the notes do not say; Priority must be High, Medium or Low)

Never invent people, dates or decisions that are not in the notes.`;

type Draft = {
  action: string;
  owner: string;
  deadline: string;
  priority: Task["priority"];
};

function parseSections(text: string) {
  const grab = (name: string) => {
    const re = new RegExp(`${name}\\s*\\n([\\s\\S]*?)(?=\\n(?:SUMMARY|DECISIONS|ACTIONS)\\b|$)`, "i");
    const m = text.match(re);
    return m?.[1]?.trim() ?? "";
  };
  const lines = (block: string) =>
    block
      .split("\n")
      .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean);

  const actions: Draft[] = lines(grab("ACTIONS"))
    .filter((l) => l.includes("|"))
    .map((l) => {
      const parts = l.split("|").map((s) => s.trim());
      const priority = parts[3];
      return {
        action: parts[0] ?? "",
        owner: parts[1] || "Unassigned",
        deadline: parts[2] || "To be confirmed",
        priority: (priority === "High" || priority === "Low" ? priority : "Medium") as Task["priority"],
      };
    })
    .filter((a) => a.action.length > 0);

  return {
    summary: lines(grab("SUMMARY")),
    decisions: lines(grab("DECISIONS")),
    actions,
  };
}

function MeetingsPage() {
  const { run, loading, error } = useAI();
  const tasks = useTasks();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [raw, setRaw] = useState<string | null>(null);
  const [summary, setSummary] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [added, setAdded] = useState(false);

  const process = async () => {
    if (!notes.trim()) {
      toast.error("Please enter or paste your meeting notes first.");
      return;
    }
    setAdded(false);
    const res = await run(SYSTEM, [
      {
        role: "user",
        content: `Meeting: ${title || "Untitled meeting"}\nDate: ${date || "Not stated"}\n\nNotes:\n${notes}`,
      },
    ]);
    if (!res) {
      toast.error("The AI service could not process these notes. Please try again.");
      return;
    }
    setRaw(res);
    const parsed = parseSections(res);
    setSummary(parsed.summary);
    setDecisions(parsed.decisions);
    setDrafts(parsed.actions);
    toast.success("Meeting processed. Review and edit before adding to the Task Planner.");
  };

  const updateDraft = (i: number, patch: Partial<Draft>) =>
    setDrafts((d) => d.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));

  const addDraft = () =>
    setDrafts((d) => [
      ...d,
      { action: "", owner: "Unassigned", deadline: "To be confirmed", priority: "Medium" },
    ]);

  const approve = () => {
    const valid = drafts.filter((d) => d.action.trim());
    if (!valid.length) {
      toast.error("There are no action items to add. Generate or add one first.");
      return;
    }
    addTasks(
      valid.map((d) => ({
        action: d.action.trim(),
        owner: d.owner.trim() || "Unassigned",
        deadline: d.deadline.trim() || "To be confirmed",
        status: "Not started" as const,
        priority: d.priority,
        source: `Meeting: ${title || "Untitled meeting"}`,
      })),
    );
    setAdded(true);
    toast.success(`${valid.length} action item(s) added to the Task Planner.`);
  };

  const meetingTasks = tasks.filter((t) => t.source.startsWith("Meeting:"));

  return (
    <AppLayout>
      <PageHeader
        title="Smart Meeting & Action Tracker"
        description="Meeting Notes → AI Summary → Decisions & Action Items → Your review → Task Planner → Deadline tracking."
        actions={
          <Button variant="outline" asChild>
            <Link to="/follow-ups">
              <CalendarClock className="size-4" /> Open Task Planner
            </Link>
          </Button>
        }
      />
      <PrivacyNotice />

      <div className="grid gap-4 sm:grid-cols-3">
        {meetings.map((m) => (
          <div key={m.id} className="card-elevated p-4">
            <p className="text-sm font-medium">{m.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.date} · {m.actions} action items
            </p>
            <Badge variant="outline" className="mt-3 border-accent/50 bg-accent/15 text-accent-foreground">
              {m.status}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated space-y-4 p-5">
          <h2 className="text-sm font-semibold">1. Meeting notes</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Meeting title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. District Coordination Meeting"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 26 August 2026"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={12}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste or type your meeting notes here…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={process} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Processing notes…" : "Generate summary & actions"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setNotes("");
                setRaw(null);
                setSummary([]);
                setDecisions([]);
                setDrafts([]);
                setAdded(false);
              }}
            >
              Clear
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <AIOutput
          content={raw}
          loading={loading}
          error={error}
          placeholder="The AI summary, decisions and action items will appear here after you submit your notes."
          note="Review all extracted content. Nothing is added to the Task Planner until you approve it."
        />
      </div>

      {(summary.length > 0 || decisions.length > 0) && (
        <div className="grid gap-6 pop-in lg:grid-cols-2">
          <div className="card-elevated p-5">
            <h2 className="text-sm font-semibold">2. AI summary</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {summary.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-elevated p-5">
            <h2 className="text-sm font-semibold">Key decisions</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {decisions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="card-elevated pop-in overflow-x-auto">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">3. Review & edit action items</h2>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={addDraft}>
                <Plus className="size-3.5" /> Add item
              </Button>
              <Button size="sm" onClick={approve}>
                <ArrowRight className="size-3.5" /> Add approved actions to Task Planner
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-64">Action</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      value={d.action}
                      onChange={(e) => updateDraft(i, { action: e.target.value })}
                      placeholder="Action"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-40"
                      value={d.owner}
                      onChange={(e) => updateDraft(i, { owner: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-40"
                      value={d.deadline}
                      onChange={(e) => updateDraft(i, { deadline: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={d.priority}
                      onValueChange={(v) => updateDraft(i, { priority: v as Task["priority"] })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove action item"
                      onClick={() => setDrafts((ds) => ds.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {added && (
            <p className="flex items-center gap-2 border-t border-border bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="size-4" /> Approved actions were added to the Task Planner.
            </p>
          )}
        </div>
      )}

      <div className="card-elevated overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">4. Tracked meeting actions & deadlines</h2>
          <p className="text-xs text-muted-foreground">
            Actions approved from meetings, with live status from the Task Planner.
          </p>
        </div>
        {meetingTasks.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetingTasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.action}</TableCell>
                  <TableCell>{t.owner}</TableCell>
                  <TableCell>{t.deadline}</TableCell>
                  <TableCell>{t.priority}</TableCell>
                  <TableCell>{t.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No meeting actions tracked yet. Approved action items will appear here and in the Task
            Planner.
          </p>
        )}
      </div>
    </AppLayout>
  );
}
