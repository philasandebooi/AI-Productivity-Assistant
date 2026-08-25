import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAI } from "./ai.functions";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export function useAI() {
  const call = useServerFn(askAI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (system: string, messages: ChatTurn[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await call({ data: { system, messages } });
        if (!res.ok) {
          setError(res.error);
          return null;
        }
        return res.content;
      } catch {
        setError("Could not reach the AI assistant. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [call],
  );

  return { run, loading, error, setError };
}

export function prompt(system: string, text: string) {
  return { system, messages: [{ role: "user" as const, content: text }] };
}
