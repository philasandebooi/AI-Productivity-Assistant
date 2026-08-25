import { useState, type ReactNode } from "react";
import { Copy, Check, Loader2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AIOutput({
  content,
  loading,
  error,
  placeholder = "AI output will appear here. Review and verify before official use.",
  note,
  actions,
  className,
}: {
  content: string | null;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  note?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("card-elevated flex min-h-64 flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="size-4 text-primary" />
        <span className="text-sm font-medium">AI Output</span>
        <div className="ml-auto flex items-center gap-2">
          {actions}
          <Button variant="outline" size="sm" onClick={copy} disabled={!content}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy
          </Button>
        </div>
      </div>
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Generating — this may take a few seconds…
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : content ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {content}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        )}
      </div>
      {note && (
        <div className="flex items-start gap-2 border-t border-border bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}
