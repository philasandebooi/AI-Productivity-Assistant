import { createFileRoute } from "@tanstack/react-router";
import { AIModule } from "@/components/ai-module";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "AI Report Generator | SD Assist" },
      {
        name: "description",
        content:
          "Generate structured weekly, monthly, programme, meeting and stakeholder reports for departmental use.",
      },
      { property: "og:title", content: "AI Report Generator" },
      {
        property: "og:description",
        content: "Structured departmental reports built from the information you supply.",
      },
    ],
  }),
});

const SYSTEM = `You generate structured public sector reports for the Department of Social Development.
Always use these headings in order: Introduction, Purpose, Activities Undertaken, Key Achievements, Challenges, Recommendations, Next Steps.
Use only the information supplied. Where information is missing, write "Information not provided" instead of inventing content. Never invent statistics.`;

function ReportsPage() {
  return (
    <AIModule
      title="AI Report Generator"
      description="Enter your reporting information and generate a structured, management-ready report."
      system={SYSTEM}
      fields={[
        { name: "reportType", label: "Report type", type: "select", options: ["Weekly Report", "Monthly Report", "Programme Progress Report", "Meeting Report", "Stakeholder Engagement Report"] },
        { name: "period", label: "Reporting period", type: "text", placeholder: "e.g. 01 – 31 August 2026" },
        { name: "programme", label: "Programme / activity", type: "text", placeholder: "e.g. ECD Centre Registration Support" },
        { name: "activities", label: "Completed activities", type: "textarea", rows: 4 },
        { name: "achievements", label: "Key achievements", type: "textarea", rows: 3 },
        { name: "challenges", label: "Challenges", type: "textarea", rows: 3 },
        { name: "stats", label: "Statistics / results", type: "textarea", rows: 3, placeholder: "Only figures you have verified" },
        { name: "recommendations", label: "Recommendations", type: "textarea", rows: 3 },
      ]}
      actions={[
        {
          label: "Generate report",
          primary: true,
          build: (v) =>
            `Generate a ${v["reportType"]}.\nReporting period: ${v["period"]}\nProgramme/activity: ${v["programme"]}\nCompleted activities: ${v["activities"]}\nAchievements: ${v["achievements"]}\nChallenges: ${v["challenges"]}\nStatistics/results: ${v["stats"]}\nRecommendations: ${v["recommendations"]}`,
        },
        {
          label: "Executive summary",
          build: (v) =>
            `Write a one-page executive summary for management based on this ${v["reportType"]} information.\nPeriod: ${v["period"]}\nProgramme: ${v["programme"]}\nActivities: ${v["activities"]}\nAchievements: ${v["achievements"]}\nChallenges: ${v["challenges"]}\nStatistics: ${v["stats"]}\nRecommendations: ${v["recommendations"]}`,
        },
      ]}
    />
  );
}
