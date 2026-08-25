import { createFileRoute } from "@tanstack/react-router";
import { DocumentWorkspace } from "./documents";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
  head: () => ({
    meta: [
      { title: "AI Research Assistant | SD Assist" },
      {
        name: "description",
        content:
          "Summarise, extract findings, identify trends and generate recommendations from approved research and reports.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Analyse approved social development research and reports with AI support.",
      },
    ],
  }),
});

const SYSTEM = `You are a research assistant for social development practitioners.
Strict rules:
- Never invent statistics, findings, sources, legislation, policies or facts.
- Clearly state when information comes from the user-provided document(s).
- Clearly label your own suggestions under a heading "AI Recommendations (not from the source)".
- State explicitly when information is missing or cannot be determined from the source.
- End every response with: "Verify this information against the original source before official use."`;

function ResearchPage() {
  return (
    <DocumentWorkspace
      title="AI Research Assistant"
      description="Work with research articles, government reports, needs assessments, policy documents and stakeholder information you are approved to use."
      system={SYSTEM}
      askLabel="Ask a question about the source"
      note="Verify all findings against the original source before official use. AI recommendations are clearly separated from source information."
      actions={[
        { label: "Ask AI", primary: true, instruction: "Answer the question using only the provided source(s)." },
        { label: "Summarize", instruction: "Summarise the source in clear, plain language for a busy public servant." },
        { label: "Extract Key Findings", instruction: "Extract the key findings as a bulleted list, quoting figures only if they appear in the source." },
        { label: "Identify Issues & Trends", instruction: "Identify issues, patterns and trends evident in the source." },
        { label: "Generate Recommendations", instruction: "Generate practical recommendations, clearly separated from source information." },
        { label: "Simplify Information", instruction: "Rewrite the key content in simplified language suitable for community-level communication." },
        { label: "Compare Documents", instruction: "Compare the first and second documents, highlighting agreements, differences and gaps. If a second document is missing, say so." },
      ]}
    />
  );
}
