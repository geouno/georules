import * as React from "react";
import { ChevronDown, FileText, FolderOpen } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FolderResponse,
  RuleCreateBody,
} from "@georules/core/api-contracts";

type CreateRuleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderResponse[];
  onSubmit: (data: RuleCreateBody) => void;
  isLoading?: boolean;
  initialData?: {
    title?: string;
    slug?: string;
    content?: string;
  };
  /** Pre-select a folder when opening the modal */
  initialFolderId?: string | null;
};

/**
 * Converts a title to a URL-friendly slug.
 */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

/**
 * Modal for creating a new rule with folder selection.
 */
export function CreateRuleModal({
  open,
  onOpenChange,
  folders,
  onSubmit,
  isLoading,
  initialData,
  initialFolderId,
}: CreateRuleModalProps) {
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [content, setContent] = React.useState(initialData?.content || "");
  const [folderId, setFolderId] = React.useState<string | null>(
    initialFolderId ?? null,
  );
  const [autoSlug, setAutoSlug] = React.useState(true);

  // Update form when initialData changes (for examples)
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setContent(initialData.content || "");
      setAutoSlug(!initialData.slug);
    }
  }, [initialData]);

  // Set initial folder when provided
  React.useEffect(() => {
    if (initialFolderId) {
      setFolderId(initialFolderId);
    }
  }, [initialFolderId]);

  // Auto-generate slug from title
  React.useEffect(() => {
    if (autoSlug && title) {
      setSlug(toSlug(title));
    }
  }, [title, autoSlug]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setSlug("");
      setContent("");
      setFolderId(null);
      setAutoSlug(true);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      folderId: folderId,
    });
  }

  const isValid = title.trim() && slug.trim() && content.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create New Rule
          </DialogTitle>
          <DialogDescription>
            Add a new rule to your collection. You can organize it in a folder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-title">Title</Label>
            <Input
              id="rule-title"
              placeholder="e.g., TypeScript Best Practices"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-slug">Slug</Label>
            <Input
              id="rule-slug"
              placeholder="e.g., typescript-best-practices"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Used in CLI commands. Auto-generated from title.
            </p>
          </div>

          {/* Folder Selection */}
          <div className="space-y-1.5">
            <Label>Folder (optional)</Label>
            <Select
              value={folderId || "root"}
              onValueChange={(v) => setFolderId(v === "root" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    No folder (root)
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

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="rule-content">Content</Label>
            <Textarea
              id="rule-content"
              placeholder="Write your rule content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[180px] font-mono text-sm"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
