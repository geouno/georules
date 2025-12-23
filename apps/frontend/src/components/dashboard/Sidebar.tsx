import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTree } from "./FileTree";
import { useFileTreeStore } from "@/stores/fileTreeStore";
import type {
  FolderResponse,
  RuleResponse,
} from "@georules/core/api-contracts";

type SidebarProps = {
  folders: FolderResponse[];
  rules: RuleResponse[];
  isLoading?: boolean;
};

/**
 * Sidebar with search input and file tree.
 * Manage UI state (selection, checked, expanded) via the Zustand store.
 */
export function Sidebar({ folders, rules, isLoading }: SidebarProps) {
  const [search, setSearch] = React.useState("");
  const checkedCount = useFileTreeStore((s) => s.checkedRuleIds.size);
  const clearChecked = useFileTreeStore((s) => s.clearChecked);

  // Filter rules based on the search query.
  const filteredRules = React.useMemo(() => {
    if (!search.trim()) return rules;
    const q = search.toLowerCase();
    return rules.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q),
    );
  }, [rules, search]);

  // Filter folders that contain matching rules or match the search query themselves.
  const filteredFolders = React.useMemo(() => {
    if (!search.trim()) return folders;
    const q = search.toLowerCase();
    const folderIdsWithMatchingRules = new Set(
      filteredRules.map((r) => r.folderId).filter(Boolean),
    );
    return folders.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        folderIdsWithMatchingRules.has(f.id),
    );
  }, [folders, filteredRules, search]);

  const isEmpty = folders.length === 0 && rules.length === 0;
  const noResults = search.trim() &&
    filteredFolders.length === 0 &&
    filteredRules.length === 0;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-sidebar">
      {/* Sidebar header. */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-sidebar-muted">
          Your Agent Rules
        </span>
      </div>

      {/* Search input. */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-muted" />
          <Input
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 bg-sidebar-accent border-sidebar-border pl-8 pr-7 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* File tree or loading/empty states. */}
      <ScrollArea className="flex-1">
        {isLoading
          ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )
          : isEmpty
          ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-sidebar-muted">
                No rules yet. Create one to get started.
              </p>
            </div>
          )
          : noResults
          ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-sidebar-muted">
                No rules match "{search}"
              </p>
            </div>
          )
          : <FileTree folders={filteredFolders} rules={filteredRules} />}
      </ScrollArea>

      {/* Footer with rule and selection statistics. */}
      <div className="border-t border-sidebar-border px-3 py-2 text-xs text-sidebar-muted">
        {folders.length} folders · {rules.length} rules
        {checkedCount > 0 && (
          <>
            <span className="ml-2 text-primary">· {checkedCount} selected</span>
            <button
              onClick={clearChecked}
              className="ml-2 underline hover:text-foreground transition-colors"
            >
              deselect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
