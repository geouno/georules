import * as React from "react";
import { CheckSquare, MoreVertical, Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActionBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  className?: string;
};

/**
 * Compact action bar for selected rules.
 * Shows the selection count, a clear selection button, a copy command button, and an additional actions menu.
 */
export function ActionBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  className,
}: ActionBarProps) {
  function handleCopyCommand() {
    toast.info("Coming soon! CLI command export feature in development.");
  }

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-start gap-3 border-b border-border bg-card/80 backdrop-blur px-3 py-2",
        className,
      )}
    >
      {/* Selection count and deselect button. */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span>
          {selectedCount} {selectedCount === 1 ? "rule" : "rules"} selected
        </span>
        <button
          onClick={onClearSelection}
          className="mr-1 text-xs underline underline-offset-2  hover:text-foreground transition-colors"
        >
          deselect
        </button>
      </div>

      {/* Button to copy the CLI command. */}
      <Button
        size="sm"
        onClick={handleCopyCommand}
        className="h-7 px-2.5 gap-1.5"
      >
        <Terminal className="h-3.5 w-3.5" />
        Copy CLI command
      </Button>

      {/* Dropdown menu for additional actions. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onDeleteSelected}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
