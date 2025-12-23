import { create } from "zustand";
import type { RuleResponse } from "@georules/core/api-contracts";

/**
 * UI state for the file tree component.
 * Handle selection, checked items for sharing features, and folder expansion.
 *
 * Server data (folders, rules) is managed via TanStack Query, while this store holds client-only UI state.
 */
type FileTreeUIState = {
  /** Currently viewed rule in the detail panel. */
  selectedRule: RuleResponse | null;
  /** Set of checked rule IDs for bulk actions. */
  checkedRuleIds: Set<string>;
  /** Set of expanded folder IDs. */
  expandedFolderIds: Set<string>;
  /** Folder ID for creating a new rule via a modal trigger. */
  createRuleInFolderId: string | null;
};

type FileTreeActions = {
  /** Select a rule to view in the detail panel. */
  selectRule: (rule: RuleResponse | null) => void;
  /** Toggle the checked state of a rule. */
  toggleChecked: (ruleId: string) => void;
  /** Check multiple rules simultaneously. */
  setChecked: (ruleIds: string[]) => void;
  /** Clear all checked rules. */
  clearChecked: () => void;
  /** Toggle the expanded state of a folder. */
  toggleExpanded: (folderId: string) => void;
  /** Expand a set of specific folders. */
  expandFolders: (folderIds: string[]) => void;
  /** Collapse all folders. */
  collapseAll: () => void;
  /** Remove a specific rule from the checked set. */
  removeFromChecked: (ruleId: string) => void;
  /** Clear the selected rule if it matches a specific ID. */
  clearSelectedIfMatch: (ruleId: string) => void;
  /** Trigger rule creation within a specific folder. */
  startCreateRuleInFolder: (folderId: string) => void;
  /** Clear the state for rule creation in a folder. */
  clearCreateRuleInFolder: () => void;
};

type FileTreeStore = FileTreeUIState & FileTreeActions;

export const useFileTreeStore = create<FileTreeStore>((set) => ({
  // Initial UI state.
  selectedRule: null,
  checkedRuleIds: new Set(),
  expandedFolderIds: new Set(),
  createRuleInFolderId: null,

  // Store actions.
  selectRule: (rule) => set({ selectedRule: rule }),

  toggleChecked: (ruleId) =>
    set((state) => {
      const next = new Set(state.checkedRuleIds);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return { checkedRuleIds: next };
    }),

  setChecked: (ruleIds) => set({ checkedRuleIds: new Set(ruleIds) }),

  clearChecked: () => set({ checkedRuleIds: new Set() }),

  toggleExpanded: (folderId) =>
    set((state) => {
      const next = new Set(state.expandedFolderIds);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return { expandedFolderIds: next };
    }),

  expandFolders: (folderIds) => set({ expandedFolderIds: new Set(folderIds) }),

  collapseAll: () => set({ expandedFolderIds: new Set() }),

  removeFromChecked: (ruleId) =>
    set((state) => {
      const next = new Set(state.checkedRuleIds);
      next.delete(ruleId);
      return { checkedRuleIds: next };
    }),

  clearSelectedIfMatch: (ruleId) =>
    set((state) => {
      if (state.selectedRule?.id === ruleId) {
        return { selectedRule: null };
      }
      return {};
    }),

  startCreateRuleInFolder: (folderId) =>
    set({ createRuleInFolderId: folderId }),

  clearCreateRuleInFolder: () => set({ createRuleInFolderId: null }),
}));

/**
 * Selector hooks for optimized re-renders.
 * Components subscribe only to the specific state slices they require.
 */
export const useSelectedRule = () => useFileTreeStore((s) => s.selectedRule);

export const useCheckedRuleIds = () =>
  useFileTreeStore((s) => s.checkedRuleIds);

export const useCheckedCount = () =>
  useFileTreeStore((s) => s.checkedRuleIds.size);

export const useIsRuleChecked = (ruleId: string) =>
  useFileTreeStore((s) => s.checkedRuleIds.has(ruleId));

export const useIsFolderExpanded = (folderId: string) =>
  useFileTreeStore((s) => s.expandedFolderIds.has(folderId));

export const useIsRuleSelected = (ruleId: string) =>
  useFileTreeStore((s) => s.selectedRule?.id === ruleId);

export const useCreateRuleInFolderId = () =>
  useFileTreeStore((s) => s.createRuleInFolderId);
