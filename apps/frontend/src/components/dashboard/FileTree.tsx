import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  useFileTreeStore,
  useIsFolderExpanded,
  useIsRuleChecked,
  useIsRuleSelected,
} from "@/stores/fileTreeStore";
import type {
  FolderResponse,
  RuleResponse,
} from "@georules/core/api-contracts";

// Types for the tree structure.

type TreeNode = {
  type: "folder" | "rule";
  id: string;
  name: string;
  children?: TreeNode[];
  data: FolderResponse | RuleResponse;
};

type FileTreeProps = {
  folders: FolderResponse[];
  rules: RuleResponse[];
};

// Hierarhical tree builder.

/**
 * Build a hierarchical tree structure from flat folders and rules.
 */
function buildTree(
  folders: FolderResponse[],
  rules: RuleResponse[],
): TreeNode[] {
  const folderMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  for (const f of folders) {
    folderMap.set(f.id, {
      type: "folder",
      id: f.id,
      name: f.name,
      children: [],
      data: f,
    });
  }

  for (const f of folders) {
    const node = folderMap.get(f.id)!;
    if (f.parentId && folderMap.has(f.parentId)) {
      folderMap.get(f.parentId)!.children!.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  for (const r of rules) {
    const ruleNode: TreeNode = {
      type: "rule",
      id: r.id,
      name: r.title,
      data: r,
    };
    if (r.folderId && folderMap.has(r.folderId)) {
      folderMap.get(r.folderId)!.children!.push(ruleNode);
    } else {
      rootNodes.push(ruleNode);
    }
  }

  return rootNodes;
}

// Indentation constants.

const INDENT_PX = 12;

// Indentation with vertical lines.

/**
 * Renders indent spacers with vertical lines aligned to arrow center (8px).
 */
function TreeIndent({ depth }: { depth: number }) {
  if (depth === 0) return null;

  return (
    <div className="tree-indent flex self-stretch shrink-0">
      {Array.from({ length: depth }).map((_, i) => (
        <div
          key={i}
          className="relative self-stretch"
          style={{ width: INDENT_PX }}
        >
          {/* Vertical line at 8px (arrow center), shifted back by half of the line width. */}
          <div
            className="tree-line absolute top-0 bottom-0 w-px -translate-x-1/2 bg-muted-foreground/30"
            style={{ left: 8 }}
          />
        </div>
      ))}
    </div>
  );
}

// Tree item components.

/**
 * Folder item that is expandable but not checkable.
 * Instead, it has a plus button to add rules inside the folder.
 */
function FolderItem({ node, depth }: { node: TreeNode; depth: number }) {
  const isExpanded = useIsFolderExpanded(node.id);
  const toggleExpanded = useFileTreeStore((s) => s.toggleExpanded);
  const startCreateRuleInFolder = useFileTreeStore((s) =>
    s.startCreateRuleInFolder
  );

  return (
    <div>
      <div
        className={cn(
          "tree-item group flex items-center h-7 px-2 cursor-pointer rounded-sm",
          "hover:bg-sidebar-accent",
        )}
        onClick={() => toggleExpanded(node.id)}
      >
        {/* Indent spacers with vertical lines. */}
        <TreeIndent depth={depth} />

        {/* Expand/collapse arrow icon. */}
        <span className="shrink-0 text-sidebar-muted">
          {isExpanded
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />}
        </span>

        {/* Appropriate folder icon based on expansion state. */}
        {isExpanded
          ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-primary ml-0.5 mr-1.5" />
          )
          : (
            <Folder className="h-4 w-4 shrink-0 text-sidebar-muted ml-0.5 mr-1.5" />
          )}

        {/* Folder name. */}
        <span className="truncate text-sm text-sidebar-foreground flex-1">
          {node.name}
        </span>

        {/* Add rule button, visible on hover. */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            startCreateRuleInFolder(node.id);
          }}
          className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent text-sidebar-muted hover:text-foreground transition-opacity"
          title="Add rule to this folder"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Folder's children rendered recursively. */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeItemInternal key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Rule item that is selectable and checkable.
 * Includes a selection checkbox on the right side.
 */
function RuleItem({ node, depth }: { node: TreeNode; depth: number }) {
  const isSelected = useIsRuleSelected(node.id);
  const isChecked = useIsRuleChecked(node.id);
  const selectRule = useFileTreeStore((s) => s.selectRule);
  const toggleChecked = useFileTreeStore((s) => s.toggleChecked);

  return (
    <div
      className={cn(
        "tree-item group flex items-center h-7 px-2 cursor-pointer rounded-sm",
        "hover:bg-sidebar-accent",
        isSelected && "bg-primary/15 hover:bg-primary/20",
      )}
      onClick={() => selectRule(node.data as RuleResponse)}
    >
      {/* Indent spacers with vertical lines. */}
      <TreeIndent depth={depth} />

      {/* Spacer to align rule icons with folder arrows. */}
      <span className="w-4 shrink-0" />

      {/* File icon for rules. */}
      <FileText className="h-4 w-4 shrink-0 text-sidebar-muted ml-0.5 mr-1.5" />

      {/* Rule name. */}
      <span
        className={cn(
          "truncate text-sm flex-1",
          isSelected
            ? "text-foreground font-medium"
            : "text-sidebar-foreground",
        )}
      >
        {node.name}
      </span>

      {/* Selection checkbox on the right side with a full-height click area. */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleChecked(node.id);
        }}
        className="shrink-0 self-stretch flex items-center justify-center pl-2 pr-0.5 cursor-pointer"
      >
        <Checkbox
          checked={isChecked}
          className="h-3.5 w-3.5 border-sidebar-muted data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
        />
      </div>
    </div>
  );
}

/**
 * Dispatch tree items based on their type.
 */
function TreeItemInternal({ node, depth }: { node: TreeNode; depth: number }) {
  if (node.type === "folder") {
    return <FolderItem node={node} depth={depth} />;
  }
  return <RuleItem node={node} depth={depth} />;
}

// Main FileTree export.

/**
 * File tree component for displaying folders and rules.
 * Checkboxes are placed at the far right for rules, and vertical lines are rendered at each indent level.
 */
export function FileTree({ folders, rules }: FileTreeProps) {
  const tree = React.useMemo(
    () => buildTree(folders, rules),
    [folders, rules],
  );

  if (tree.length === 0) {
    return null;
  }

  return (
    <div className="px-2 py-1">
      {tree.map((node) => (
        <TreeItemInternal key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
