import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  system: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

const BASE_RULES = `You are SD Assist, an AI productivity assistant for employees of the Department of Social Development, South Africa.
Rules you must always follow:
- Never invent statistics, findings, sources, legislation, policies, or facts.
- Never make beneficiary or eligibility decisions; state that human review and approval is required.
- Never present output as official government policy or legal advice.
- State clearly when information is missing or when verification is required.
- Distinguish your own recommendations from information supplied by the user.
- Be professional, objective, practical and workplace-focused. Use South African public sector tone and British/SA English.
- Format answers in clean markdown-free plain text with clear headings and bullet points using "-".`;

export const askAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "AI is not configured for this workspace." };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${BASE_RULES}\n\n${data.system ?? ""}` },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "The AI assistant could not complete this request.";
      if (res.status === 429) message = "Too many requests right now. Please wait a moment and try again.";
      else if (res.status === 402) message = "AI credits are exhausted for this workspace. Please add credits.";
      else if (res.status === 403) message = "AI access is blocked by workspace policy.";
      else if (text) message = `${message} (${res.status})`;
      return { ok: false as const, error: message };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) return { ok: false as const, error: "The AI returned an empty response." };
    return { ok: true as const, content };
  });
