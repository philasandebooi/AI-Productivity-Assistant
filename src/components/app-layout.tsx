import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  BellRing,
  Users,
  CalendarCheck,
  BookOpenCheck,
  ListChecks,
  Microscope,
  MessageSquareText,
  ShieldCheck,
  FileStack,
  Menu,
  X,
  ShieldAlert,
  Sun,
  Moon,
} from "lucide-react";
import banner from "@/assets/sd-assist-banner.png.asset.json";
import { currentUser } from "@/data/sample";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";


const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assistant", label: "Ask SD Assistant", icon: MessageSquareText },
  { to: "/cases", label: "Case Administration", icon: FileStack },
  { to: "/programmes", label: "Programmes & Projects", icon: FolderKanban },
  { to: "/reports", label: "Report Generator", icon: FileText },
  { to: "/follow-ups", label: "Follow-Ups & Deadlines", icon: BellRing },
  { to: "/stakeholders", label: "Stakeholder Communication", icon: Users },
  { to: "/meetings", label: "Meetings & Actions", icon: CalendarCheck },
  { to: "/documents", label: "Policy & Documents", icon: BookOpenCheck },
  { to: "/checklists", label: "Checklist Generator", icon: ListChecks },
  { to: "/research", label: "Research Assistant", icon: Microscope },
  { to: "/guidelines", label: "AI Use Guidelines", icon: ShieldCheck },
] as const;

export function PrivacyNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-accent/60 bg-accent/15 p-3 text-xs leading-relaxed text-foreground",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
      <p>
        Do not enter personal, confidential, or sensitive beneficiary information into the AI
        assistant unless you are authorized to do so and appropriate data protection measures are in
        place. Always review AI-generated content before using or sharing it.
      </p>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start gap-3 border-b border-sidebar-border px-5 py-5">
          <img
            src={logo}
            alt="Department of Social Development logo"
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full bg-white p-1"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">Department of Social Development</p>
            <p className="mt-1 text-xs leading-tight text-sidebar-primary">
              SD Assist | AI-Powered Productivity Assistant
            </p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/80">
          <p className="font-medium text-sidebar-foreground">{currentUser.fullName}</p>
          <p>{currentUser.role}</p>
          <p>{currentUser.office}</p>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <img
            src={logo}
            alt=""
            width={32}
            height={32}
            className="size-8 lg:hidden"
            loading="lazy"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">SD Assist</p>
            <p className="text-xs text-muted-foreground">
              Republic of South Africa · Department of Social Development
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Human review required on all AI output
            </span>
            <div className="flex size-9 items-center justify-center rounded-full brand-gradient text-sm font-semibold text-primary-foreground">
              PB
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
