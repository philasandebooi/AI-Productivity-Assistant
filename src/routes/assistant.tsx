import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Send,
  Loader2,
  Copy,
  RefreshCcw,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Sparkles,
  ArrowRightCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout, PageHeader, PrivacyNotice } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/data/sample";
import { useAI, type ChatTurn } from "@/lib/use-ai";
import { addTasks } from "@/lib/task-store";
import banner from "@/assets/sd-assist-banner.png.asset.json";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "Ask SD Assistant | SD Assist" },
      {
        name: "description",
        content:
          "Central AI workplace assistant for drafting, summarising, planning and prioritising departmental work.",
      },
      { property: "og:title", content: "Ask SD Assistant" },
      { property: "og:description", content: "Your central AI workplace assistant in SD Assist." },
    ],
  }),
});

const quickPrompts = [
  "Draft an Email",
  "Summarize a Document",
  "Plan My Day",
  "What Are My Priorities?",
  "Create a Report",
  "Prepare Meeting Agenda",
  "Show My Outstanding Tasks",
  "Help Me Follow Up",
  "Research a Topic",
];

const SYSTEM = `You are "Ask SD Assistant", the central workplace assistant inside SD Assist.
You help with drafting emails, summarising meetings and documents, creating action items, planning and prioritising tasks, generating reports, stakeholder communication, meeting agendas, follow-ups, programme and project administration, research and questions about approved documents.
Keep replies concise and structured. When you produce action items, list them as "- Action | Responsible | Deadline | Priority".
Remind the user that AI output must be reviewed before official use when the content will be shared externally.`;

type Msg = ChatTurn & { time: string };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function AssistantPage() {
  const { run, loading } = useAI();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const [hello, setHello] = useState("Hello");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHello(greeting()), []);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  const send = async (text: string, history?: Msg[]) => {
    const base = history ?? messages;
    const next: Msg[] = [
      ...base,
      { role: "user", content: text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ];
    setMessages(next);
    setInput("");
    const res = await run(
      SYSTEM,
      next.map(({ role, content }) => ({ role, content })),
    );
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: res ?? "I could not complete that request. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const trimmed = messages.slice(0, messages.findLastIndex((m) => m.role === "user"));
    await send(lastUser.content, trimmed as Msg[]);
  };

  const sendToPlanner = (content: string) => {
    const lines = content
      .split("\n")
      .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
      .filter((l) => l.includes("|"));
    if (!lines.length) {
      toast.error("No action items found. Ask the assistant to list actions first.");
      return;
    }
    addTasks(
      lines.map((l) => {
        const [action, owner, deadline, priority] = l.split("|").map((s) => s.trim());
        return {
          action,
          owner: owner || "Unassigned",
          deadline: deadline || "To be confirmed",
          status: "Not started" as const,
          priority: (priority === "High" || priority === "Low" ? priority : "Medium") as
            | "High"
            | "Medium"
            | "Low",
          source: "Ask SD Assistant",
        };
      }),
    );
    toast.success(`${lines.length} action item(s) sent to the Task Planner for review.`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Ask SD Assistant"
        description="Your central AI workplace assistant. It connects with the other SD Assist modules — approved actions can be sent straight to the Task Planner."
        actions={
          <Button variant="outline" onClick={() => setMessages([])} disabled={!messages.length}>
            <Trash2 className="size-4" /> Clear chat
          </Button>
        }
      />

      <PrivacyNotice />

      <div className="card-elevated flex h-[62vh] flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <img src={banner.url} alt="" className="h-8 w-auto rounded bg-white p-0.5" loading="lazy" />
          <div>
            <p className="text-sm font-semibold">SD Assist</p>
            <p className="text-xs text-muted-foreground">AI-Powered Productivity Assistant</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {!messages.length && (
            <div className="rounded-lg bg-muted/60 p-4">
              <p className="text-sm font-medium">
                {hello}, {currentUser.name}. How can I assist you today?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick a quick prompt below or type your own request.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div className="max-w-[85%] space-y-1">
                <div
                  className={
                    m.role === "user"
                      ? "rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm"
                  }
                >
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">{m.content}</pre>
                </div>
                <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                  <span>{m.time}</span>
                  {m.role === "assistant" && (
                    <>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.content);
                          toast.success("Response copied");
                        }}
                        className="hover:text-primary"
                        aria-label="Copy response"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button onClick={regenerate} className="hover:text-primary" aria-label="Regenerate">
                        <RefreshCcw className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setFeedback((f) => ({ ...f, [i]: "up" }))}
                        className={feedback[i] === "up" ? "text-success" : "hover:text-primary"}
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setFeedback((f) => ({ ...f, [i]: "down" }))}
                        className={feedback[i] === "down" ? "text-destructive" : "hover:text-primary"}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="size-3.5" />
                      </button>
                      <button
                        onClick={() => sendToPlanner(m.content)}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ArrowRightCircle className="size-3.5" /> Send actions to Task Planner
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" /> SD Assist is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) send(input.trim());
                }
              }}
              placeholder="Ask SD Assist to draft, summarise, plan or prioritise…"
              className="min-h-12 resize-none"
              rows={2}
            />
            <Button onClick={() => input.trim() && send(input.trim())} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" />
            SD Assist may generate inaccurate or incomplete information. Review all output before
            official use.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
