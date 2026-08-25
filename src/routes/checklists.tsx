import { createFileRoute } from "@tanstack/react-router";
import { AIModule } from "@/components/ai-module";

export const Route = createFileRoute("/checklists")({
  component: ChecklistsPage,
  head: () => ({
    meta: [
      { title: "Document Checklist Generator | SD Assist" },
      {
        name: "description",
        content:
          "Generate structured preparation and document checklists for meetings, reporting, monitoring visits and events.",
      },
      { property: "og:title", content: "Document Checklist Generator" },
      {
        property: "og:description",
        content: "Structured checklists with tasks, documents, owners and deadlines.",
      },
    ],
  }),
});

const SYSTEM = `You generate practical workplace checklists for the Department of Social Development.
Always output a table-style list where each line uses the format:
- Task or document | Type (Preparation task / Required document) | Responsible person | Deadline | Status
Group items under clear headings. Use "[To be confirmed]" where the user has not supplied information.`;

function ChecklistsPage() {
  return (
    <AIModule
      title="Document Checklist Generator"
      description="Produce structured checklists covering preparation tasks, required documents, responsible people, deadlines and completion status."
      system={SYSTEM}
      fields={[
        { name: "workflow", label: "Workflow", type: "select", options: ["Stakeholder meeting", "Monthly reporting", "Programme monitoring visit", "Project planning", "Community engagement event", "Internal meeting"] },
        { name: "context", label: "Context and details", type: "textarea", rows: 6, placeholder: "Programme, date, venue, participants, known requirements…" },
        { name: "team", label: "Team members available", type: "text", placeholder: "e.g. P. Booi, N. Dlamini, T. Mokoena" },
        { name: "date", label: "Target date", type: "text", placeholder: "e.g. 05 September 2026" },
      ]}
      actions={[
        {
          label: "Generate checklist",
          primary: true,
          build: (v) =>
            `Generate a checklist for: ${v.workflow}.\nTarget date: ${v.date}\nTeam: ${v.team}\nContext: ${v.context}`,
        },
        {
          label: "Documents only",
          build: (v) => `List only the required documents for: ${v.workflow}. Context: ${v.context}`,
        },
        {
          label: "Preparation timeline",
          build: (v) =>
            `Create a preparation timeline working backwards from ${v.date} for: ${v.workflow}. Context: ${v.context}`,
        },
      ]}
    />
  );
}
