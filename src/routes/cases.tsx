import { createFileRoute } from "@tanstack/react-router";
import { AIModule } from "@/components/ai-module";

export const Route = createFileRoute("/cases")({
  component: CasesPage,
  head: () => ({
    meta: [
      { title: "AI Case Administration Assistant | SD Assist" },
      {
        name: "description",
        content:
          "Turn non-sensitive case notes into structured administrative summaries, checklists and update templates.",
      },
      { property: "og:title", content: "AI Case Administration Assistant" },
      {
        property: "og:description",
        content: "Structure case administration work with AI support and mandatory human review.",
      },
    ],
  }),
});

const SYSTEM = `You support administrative case work in the Department of Social Development.
You may ONLY produce administrative structure: summaries, missing information lists, follow-up checklists, next administrative actions, professional update templates and flags for incomplete records.
You must NEVER make beneficiary decisions, determine eligibility, assess merit of a case, or recommend an outcome. Always end with: "Human review and approval is required before this is used or filed."`;

function CasesPage() {
  return (
    <AIModule
      title="AI Case Administration Assistant"
      description="Convert non-sensitive case notes into structured administrative summaries. The assistant never makes beneficiary or eligibility decisions."
      system={SYSTEM}
      note="This assistant supports administration only. It does not make beneficiary decisions or determine eligibility — human review is always required."
      fields={[
        { name: "reference", label: "Case reference (non-identifying)", type: "text", placeholder: "e.g. ECD/2026/0142" },
        { name: "type", label: "Case type", type: "select", options: ["ECD registration", "NPO funding application", "Programme referral", "Service complaint", "Foster care administration", "Other administrative matter"] },
        { name: "notes", label: "Case notes (do not include personal or sensitive beneficiary details)", type: "textarea", rows: 10, placeholder: "Paste non-sensitive administrative notes here…" },
      ]}
      actions={[
        {
          label: "Structured summary",
          primary: true,
          build: (v) =>
            `Create a structured administrative summary for case ${v["reference"]} (${v["type"]}).\nNotes:\n${v["notes"]}`,
        },
        {
          label: "Missing information & documents",
          build: (v) =>
            `Identify missing information and outstanding documents for this ${v["type"]} case, based only on the notes.\nNotes:\n${v["notes"]}`,
        },
        {
          label: "Follow-up checklist",
          build: (v) => `Generate a follow-up checklist with responsible person and suggested timeframe columns.\nNotes:\n${v["notes"]}`,
        },
        {
          label: "Next administrative actions",
          build: (v) => `Suggest the next administrative actions only (no decisions).\nNotes:\n${v["notes"]}`,
        },
        {
          label: "Case update template",
          build: (v) =>
            `Draft a professional case update template for internal use regarding case ${v["reference"]} (${v["type"]}). Use placeholders where information is missing.\nNotes:\n${v["notes"]}`,
        },
        {
          label: "Flag incomplete records",
          build: (v) => `Flag any incomplete or inconsistent records evident in the notes and state clearly what cannot be determined.\nNotes:\n${v["notes"]}`,
        },
      ]}
    />
  );
}
