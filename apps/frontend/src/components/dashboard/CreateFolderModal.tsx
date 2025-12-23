import * as React from "react";
import { FolderOpen, FolderPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FolderCreateBody,
  FolderResponse,
} from "@georules/core/api-contracts";

type CreateFolderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderResponse[];
  onSubmit: (data: FolderCreateBody) => void;
  isLoading?: boolean;
};

/**
 * Modal for creating a new folder with optional parent selection.
 */
export function CreateFolderModal({
  open,
  onOpenChange,
  folders,
  onSubmit,
  isLoading,
}: CreateFolderModalProps) {
  const [name, setName] = React.useState("");
  const [parentId, setParentId] = React.useState<string | null>(null);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setName("");
      setParentId(null);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      parentId: parentId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Organize your rules into folders for easier management.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="e.g., Frontend Rules"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Parent Folder Selection */}
          <div className="space-y-1.5">
            <Label>Parent Folder (optional)</Label>
            <Select
              value={parentId || "root"}
              onValueChange={(v) => setParentId(v === "root" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    No parent (root level)
                  </span>
                </SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <span className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      {folder.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
