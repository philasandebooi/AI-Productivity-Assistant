import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldAlert,
  Lock,
  Eye,
  AlertTriangle,
  Scale,
  UserCheck,
  Ban,
  FileWarning,
} from "lucide-react";
import { AppLayout, PageHeader } from "@/components/app-layout";

export const Route = createFileRoute("/guidelines")({
  component: GuidelinesPage,
  head: () => ({
    meta: [
      { title: "AI Use Guidelines | SD Assist" },
      {
        name: "description",
        content:
          "Responsible AI and privacy guidance for Department of Social Development employees using SD Assist.",
      },
      { property: "og:title", content: "AI Use Guidelines | SD Assist" },
      {
        property: "og:description",
        content: "How to use SD Assist responsibly, protect privacy and verify AI-generated content.",
      },
    ],
  }),
});

const principles = [
  {
    icon: Lock,
    title: "Protect privacy and confidential information",
    body: "Handle all departmental and beneficiary information in line with POPIA and departmental data protection requirements.",
  },
  {
    icon: Ban,
    title: "Avoid unnecessary personal or sensitive information",
    body: "Do not enter beneficiary identifiers, health, financial or case-sensitive details unless you are authorised and it is strictly necessary.",
  },
  {
    icon: Eye,
    title: "Verify AI-generated content",
    body: "Check every summary, report, checklist and message against the original source and departmental records before it is used.",
  },
  {
    icon: AlertTriangle,
    title: "AI outputs may contain errors",
    body: "SD Assist can generate inaccurate, outdated or incomplete information, including plausible-sounding content that is wrong.",
  },
  {
    icon: Scale,
    title: "Not official policy or legal advice",
    body: "Never treat AI-generated information as departmental policy, legal advice or an official interpretation of legislation.",
  },
  {
    icon: UserCheck,
    title: "Human review before decisions",
    body: "A responsible employee must review and approve any content that affects beneficiaries, communities, partners or official reporting.",
  },
  {
    icon: FileWarning,
    title: "No beneficiary or eligibility decisions",
    body: "SD Assist does not and may not make final beneficiary, eligibility, funding or disciplinary decisions.",
  },
];

function GuidelinesPage() {
  return (
    <AppLayout>
      <PageHeader
        title="AI Use Guidelines"
        description="Responsible AI and privacy guidance for every employee using SD Assist."
      />

      <div className="card-elevated pop-in border-l-4 border-l-destructive p-5">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <h2 className="text-sm font-semibold text-destructive">Important AI warning</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Do not enter personal, confidential, or sensitive beneficiary information into the AI
              assistant unless you are authorized to do so and appropriate data protection measures
              are in place. Always review AI-generated content before using or sharing it.
            </p>
          </div>
        </div>
      </div>

      <div className="card-elevated p-5">
        <h2 className="text-sm font-semibold">Before you use SD Assist</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          SD Assist may generate inaccurate or incomplete information. Do not enter unnecessary
          personal, confidential, or sensitive information. Always review and verify AI-generated
          content before using it for official communication, reporting, or decisions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {principles.map((p) => (
          <div key={p.title} className="card-elevated lift-hover p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <p.icon className="size-4" />
              </span>
              <h3 className="text-sm font-semibold">{p.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated p-5">
        <h2 className="text-sm font-semibold">How SD Assist behaves</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {[
            "It protects privacy and does not request unnecessary sensitive information.",
            "It avoids unnecessary storage of sensitive data.",
            "It never makes final beneficiary or eligibility decisions.",
            "It never presents its output as official government policy or legal advice.",
            "It clearly indicates when human verification is required.",
            "It remains professional, objective, practical and workplace-focused.",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
