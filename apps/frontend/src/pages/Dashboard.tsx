import * as React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RuleViewer } from "@/components/dashboard/RuleViewer";
import {
  EmptyState,
  type ExampleRule,
} from "@/components/dashboard/EmptyState";
import { ActionBar } from "@/components/dashboard/ActionBar";
import { CreateRuleModal } from "@/components/dashboard/CreateRuleModal";
import { CreateFolderModal } from "@/components/dashboard/CreateFolderModal";
import { EditRuleModal } from "@/components/dashboard/EditRuleModal";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { ResizablePanel } from "@/components/common/ResizablePanel";
import {
  useCreateRule,
  useDeleteRule,
  useRules,
  useUpdateRule,
} from "@/hooks/use-rules";
import { useCreateFolder, useFolders } from "@/hooks/use-folders";
import {
  useCheckedRuleIds,
  useCreateRuleInFolderId,
  useFileTreeStore,
  useSelectedRule,
} from "@/stores/fileTreeStore";
import type {
  FolderCreateBody,
  RuleCreateBody,
  RuleUpdateBody,
} from "@georules/core/api-contracts";

/**
 * Main dashboard page for managing rules and folders.
 * UI state for selection/checked items is managed by Zustand store.
 */
export function DashboardPage() {
  // Data fetching via server state (TanStack Query).
  const { data: rules = [], isLoading: rulesLoading } = useRules();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();

  // UI state from the Zustand store.
  const selectedRule = useSelectedRule();
  const checkedRuleIds = useCheckedRuleIds();
  const createRuleInFolderId = useCreateRuleInFolderId();
  const {
    clearChecked,
    removeFromChecked,
    clearSelectedIfMatch,
    clearCreateRuleInFolder,
  } = useFileTreeStore();

  // Mutations for data updates.
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();
  const createFolder = useCreateFolder();

  // Local modal visibility state.
  const [createRuleOpen, setCreateRuleOpen] = React.useState(false);
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false);
  const [editRuleOpen, setEditRuleOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [ruleToDelete, setRuleToDelete] = React.useState<string | null>(null);
  const [initialRuleData, setInitialRuleData] = React.useState<
    { title?: string; slug?: string; content?: string } | undefined
  >();

  // Derived state values.
  const isLoading = rulesLoading || foldersLoading;
  const checkedRuleIdsArray = Array.from(checkedRuleIds);

  // Open the create rule modal when triggered from a folder's plus button.
  React.useEffect(() => {
    if (createRuleInFolderId) {
      setInitialRuleData(undefined);
      setCreateRuleOpen(true);
    }
  }, [createRuleInFolderId]);

  // Clear the folder trigger when the modal closes.
  function handleCreateRuleOpenChange(open: boolean) {
    setCreateRuleOpen(open);
    if (!open) {
      clearCreateRuleInFolder();
    }
  }

  // Event handlers.
  function handleOpenCreateRule(example?: ExampleRule) {
    if (example) {
      setInitialRuleData({
        title: example.title,
        slug: example.slug,
        content: example.content,
      });
    } else {
      setInitialRuleData(undefined);
    }
    setCreateRuleOpen(true);
  }

  async function handleCreateRule(data: RuleCreateBody) {
    await createRule.mutateAsync(data);
    handleCreateRuleOpenChange(false);
  }

  async function handleCreateFolder(data: FolderCreateBody) {
    await createFolder.mutateAsync(data);
    setCreateFolderOpen(false);
  }

  function handleEditRule() {
    if (selectedRule) {
      setEditRuleOpen(true);
    }
  }

  async function handleUpdateRule(id: string, data: RuleUpdateBody) {
    await updateRule.mutateAsync({ id, data });
    setEditRuleOpen(false);
  }

  function handleDeleteRule() {
    if (selectedRule) {
      setRuleToDelete(selectedRule.id);
      setDeleteDialogOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (ruleToDelete) {
      await deleteRule.mutateAsync(ruleToDelete);
      // Clean up Zustand state after deletion.
      clearSelectedIfMatch(ruleToDelete);
      removeFromChecked(ruleToDelete);
      setRuleToDelete(null);
      setDeleteDialogOpen(false);
    }
  }

  async function handleCopyCommand() {
    const command = `georules apply ${checkedRuleIdsArray.join(" ")} --cursor`;
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // Clipboard API fallback.
    }
  }

  async function handleDeleteSelected() {
    for (const id of checkedRuleIdsArray) {
      await deleteRule.mutateAsync(id);
      clearSelectedIfMatch(id);
    }
    clearChecked();
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Dashboard header. */}
      <DashboardHeader
        onCreateRule={() => handleOpenCreateRule()}
        onCreateFolder={() => setCreateFolderOpen(true)}
      />

      {/* Main content layout. */}
      <div className="flex flex-1 overflow-hidden">
        {/* Resizable sidebar with width persistence. */}
        <ResizablePanel
          className="border-r border-border overflow-hidden"
          storageKey="georules-sidebar-width"
        >
          <Sidebar
            folders={folders}
            rules={rules}
            isLoading={isLoading}
          />
        </ResizablePanel>

        {/* Main content area. */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top action bar. */}
          <ActionBar
            selectedCount={checkedRuleIdsArray.length}
            onClearSelection={clearChecked}
            onDeleteSelected={handleDeleteSelected}
          />

          <div className="flex-1 overflow-hidden">
            {selectedRule
              ? (
                <RuleViewer
                  rule={selectedRule}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                />
              )
              : (
                <EmptyState
                  onCreateRule={handleOpenCreateRule}
                  hasRules={rules.length > 0}
                />
              )}
          </div>
        </div>
      </div>

      {/* Management modals. */}
      <CreateRuleModal
        open={createRuleOpen}
        onOpenChange={handleCreateRuleOpenChange}
        folders={folders}
        onSubmit={handleCreateRule}
        isLoading={createRule.isPending}
        initialData={initialRuleData}
        initialFolderId={createRuleInFolderId}
      />

      <CreateFolderModal
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        folders={folders}
        onSubmit={handleCreateFolder}
        isLoading={createFolder.isPending}
      />

      <EditRuleModal
        open={editRuleOpen}
        onOpenChange={setEditRuleOpen}
        rule={selectedRule}
        folders={folders}
        onSubmit={handleUpdateRule}
        isLoading={updateRule.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Rule"
        description="Are you sure you want to delete this rule? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={deleteRule.isPending}
      />
    </div>
  );
}
