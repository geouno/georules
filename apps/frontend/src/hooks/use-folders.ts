import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FolderCreateBody,
  FolderUpdateBody,
} from "@georules/core/api-contracts";
import { georulesClient } from "@/lib/georules";

/**
 * Query key factory for folders.
 */
export const folderKeys = {
  all: ["folders"] as const,
  single: (id: string) => ["folders", id] as const,
};

/**
 * Hook to fetch all folders for the current user.
 */
export function useFolders() {
  return useQuery({
    queryKey: folderKeys.all,
    queryFn: () => georulesClient.getFolders(),
  });
}

/**
 * Hook to fetch a single folder by ID.
 */
export function useFolder(id: string | null) {
  return useQuery({
    queryKey: folderKeys.single(id!),
    queryFn: () => georulesClient.getFolder(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new folder.
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FolderCreateBody) => georulesClient.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
    },
  });
}

/**
 * Hook to update an existing folder.
 */
export function useUpdateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FolderUpdateBody }) =>
      georulesClient.updateFolder(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      queryClient.setQueryData(folderKeys.single(updated.id), updated);
    },
  });
}

/**
 * Hook to delete a folder.
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => georulesClient.deleteFolder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      queryClient.removeQueries({ queryKey: folderKeys.single(id) });
    },
  });
}
