import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  CalendarClock,
  Users,
  FileText,
  FolderKanban,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
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
import { programmes, followUps, currentUser, meetings } from "@/data/sample";
import { useTasks } from "@/lib/task-store";
import { useAI } from "@/lib/use-ai";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "SD Assist Dashboard | Department of Social Development" },
      {
        name: "description",
        content:
          "Productivity dashboard for Department of Social Development employees: tasks, deadlines, programmes and AI insights.",
      },
      { property: "og:title", content: "SD Assist Dashboard" },
      {
        property: "og:description",
        content: "Track tasks, deadlines, programmes and AI productivity insights in one place.",
      },
    ],
  }),
});

function statusTone(status: string) {
  if (status === "On track") return "bg-success/15 text-success border-success/30";
  if (status === "At risk") return "bg-warning/20 text-warning-foreground border-warning/40";
  if (status === "Delayed") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function Dashboard() {
  const tasks = useTasks();
  const { run, loading, error } = useAI();
  const [insight, setInsight] = useState<string | null>(null);

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const outstanding = tasks.filter((t) => t.status !== "Completed").length;
  const overdue = followUps.filter((f) => f.urgency === "Overdue").length;
  const upcoming = followUps.filter((f) => f.urgency !== "Overdue").length;

  const stats = [
    { label: "Tasks completed this week", value: completed, icon: CheckCircle2, tone: "text-success" },
    { label: "Outstanding tasks", value: outstanding, icon: ClipboardList, tone: "text-primary" },
    { label: "Overdue items", value: overdue, icon: AlertTriangle, tone: "text-destructive" },
    { label: "Upcoming deadlines", value: upcoming, icon: CalendarClock, tone: "text-accent-foreground" },
    { label: "Meetings needing follow-up", value: meetings.length, icon: Users, tone: "text-primary" },
    { label: "Reports due", value: 3, icon: FileText, tone: "text-warning-foreground" },
    {
      label: "Active programmes",
      value: programmes.filter((p) => p.status !== "Completed").length,
      icon: FolderKanban,
      tone: "text-primary",
    },
  ];

  const generateInsight = async () => {
    const context = `Today is ${new Date().toDateString()}.
Outstanding tasks: ${tasks
      .filter((t) => t.status !== "Completed")
      .map((t) => `${t.action} (owner ${t.owner}, due ${t.deadline}, ${t.priority} priority)`)
      .join("; ")}.
Follow-ups: ${followUps.map((f) => `${f.item} (${f.urgency}, due ${f.due})`).join("; ")}.
Programmes: ${programmes.map((p) => `${p.name} - ${p.status}, ${p.progress}% complete, deadline ${p.deadline}`).join("; ")}.`;

    const res = await run(
      "You produce a short Daily Productivity Insight for a public sector employee. Give 4-6 lines of practical prioritisation advice based only on the data supplied. No invented facts.",
      [{ role: "user", content: context }],
    );
    if (res) setInsight(res);
  };

  return (
    <AppLayout>
      <PageHeader
        title={`Good morning, ${currentUser.name}`}
        description="Your workday at a glance — outstanding work, deadlines, programme progress and AI-supported prioritisation."
        actions={
          <Button asChild>
            <Link to="/assistant">
              <Sparkles className="size-4" /> Ask SD Assistant
            </Link>
          </Button>
        }
      />

      <PrivacyNotice />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-elevated p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <s.icon className={`size-4 ${s.tone}`} />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">AI Daily Productivity Insight</h2>
          <Button size="sm" className="ml-auto" onClick={generateInsight} disabled={loading}>
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            Generate insight
          </Button>
        </div>
        <div className="px-4 py-4 text-sm leading-relaxed">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : insight ? (
            <pre className="whitespace-pre-wrap font-sans">{insight}</pre>
          ) : (
            <span className="text-muted-foreground">
              Generate a prioritisation summary based on your current tasks, deadlines and programme
              status. Always review before acting.
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-elevated overflow-x-auto lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Programme & project progress</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programme</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>AI alert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programmes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="min-w-56">
                    <p className="font-medium">{p.name}</p>
                    <Progress value={p.progress} className="mt-2 h-1.5" />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusTone(p.status)}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{p.deadline}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.alert}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="card-elevated">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Priority alerts</h2>
          </div>
          <ul className="divide-y divide-border">
            {followUps.slice(0, 5).map((f) => (
              <li key={f.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">{f.item}</p>
                  <Badge
                    variant="outline"
                    className={
                      f.urgency === "Overdue"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : f.urgency === "Urgent"
                          ? "border-warning/40 bg-warning/20 text-warning-foreground"
                          : "border-border bg-muted text-muted-foreground"
                    }
                  >
                    {f.urgency}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {f.category} · due {f.due} · {f.owner}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-3">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/follow-ups">View all follow-ups</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
