import * as React from "react";
import { Check, Copy, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RuleResponse } from "@georules/core/api-contracts";

type RuleViewerProps = {
  rule: RuleResponse;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * View content of a selected rule and provide action buttons.
 */
export function RuleViewer({ rule, onEdit, onDelete }: RuleViewerProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rule.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // TODO: Clipboard API fallback.
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Rule viewer header with title and actions. */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-foreground truncate">
            {rule.title}
          </h2>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {rule.slug}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="relative h-8 px-2 gap-1.5 after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current"
          >
            {copied
              ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-xs">Copied</span>
                </>
              )
              : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs">Copy</span>
                </>
              )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="relative h-8 px-2 gap-1.5 after:content-[''] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-px after:bg-current"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="text-xs">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 px-2 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      </div>

      {/* Rule content within a scrollable area. */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-mono leading-relaxed">
            {rule.content}
          </pre>
        </div>
      </ScrollArea>

      {/* Footer information (e.g., creation date). */}
      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        Created {rule.createdAt
          ? new Date(rule.createdAt).toLocaleDateString()
          : "Unknown"}
      </div>
    </div>
  );
}
