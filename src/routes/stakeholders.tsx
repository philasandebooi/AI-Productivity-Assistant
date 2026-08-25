import { createFileRoute } from "@tanstack/react-router";
import { AIModule } from "@/components/ai-module";

export const Route = createFileRoute("/stakeholders")({
  component: StakeholdersPage,
  head: () => ({
    meta: [
      { title: "Stakeholder Communication Assistant | SD Assist" },
      {
        name: "description",
        content:
          "Draft professional communication for communities, NPOs, municipalities, partners and internal management.",
      },
      { property: "og:title", content: "Stakeholder Communication Assistant" },
      {
        property: "og:description",
        content: "Professional, tone-appropriate stakeholder communication drafts.",
      },
    ],
  }),
});

const SYSTEM = `You draft professional South African public sector communication for the Department of Social Development.
Match the tone and formality to the stakeholder type: plain, respectful language for community members; formal official register for government departments and municipalities; clear contractual tone for service providers.
Use placeholders in square brackets for details not supplied. Never invent commitments, dates, figures or policy positions.`;

function StakeholdersPage() {
  return (
    <AIModule
      title="Stakeholder Communication Assistant"
      description="Select the stakeholder and purpose, add your key points, and generate a professional draft."
      system={SYSTEM}
      fields={[
        { name: "stakeholder", label: "Stakeholder type", type: "select", options: ["Community Member", "NGO / NPO", "Government Department", "Municipality", "Service Provider", "Internal Management", "Programme Partner"] },
        { name: "purpose", label: "Purpose", type: "select", options: ["Request Information", "Schedule Meeting", "Follow-Up", "Provide Update", "Send Invitation", "Request Documentation"] },
        { name: "channel", label: "Channel", type: "select", options: ["Email", "Official letter", "SMS / short message", "Meeting invitation"] },
        { name: "points", label: "Key points to include", type: "textarea", rows: 7, placeholder: "Background, what you need, deadline, contact details…" },
      ]}
      actions={[
        {
          label: "Generate communication",
          primary: true,
          build: (v) =>
            `Draft a ${v.channel} to a ${v.stakeholder}. Purpose: ${v.purpose}.\nKey points:\n${v.points}\nInclude a subject line where relevant and a professional departmental sign-off.`,
        },
        {
          label: "Shorter version",
          build: (v) =>
            `Draft a concise ${v.channel} (maximum 120 words) to a ${v.stakeholder} for the purpose of ${v.purpose}.\nKey points:\n${v.points}`,
        },
        {
          label: "Follow-up reminder",
          build: (v) =>
            `Draft a polite follow-up reminder ${v.channel} to a ${v.stakeholder} regarding: ${v.purpose}.\nKey points:\n${v.points}`,
        },
      ]}
    />
  );
}
