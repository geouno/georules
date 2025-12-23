import * as React from "react";
import { Edit } from "lucide-react";
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
import { FolderOpen } from "lucide-react";
import type {
  FolderResponse,
  RuleResponse,
  RuleUpdateBody,
} from "@georules/core/api-contracts";

type EditRuleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: RuleResponse | null;
  folders: FolderResponse[];
  onSubmit: (id: string, data: RuleUpdateBody) => void;
  isLoading?: boolean;
};

/**
 * Modal for editing an existing rule.
 */
export function EditRuleModal({
  open,
  onOpenChange,
  rule,
  folders,
  onSubmit,
  isLoading,
}: EditRuleModalProps) {
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [content, setContent] = React.useState("");
  const [folderId, setFolderId] = React.useState<string | null>(null);

  // Populate form when rule changes
  React.useEffect(() => {
    if (rule) {
      setTitle(rule.title);
      setSlug(rule.slug);
      setContent(rule.content);
      setFolderId(rule.folderId || null);
    }
  }, [rule]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rule || !title.trim() || !slug.trim() || !content.trim()) return;

    onSubmit(rule.id, {
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
            <Edit className="h-5 w-5 text-primary" />
            Edit Rule
          </DialogTitle>
          <DialogDescription>
            Update the rule details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-rule-title">Title</Label>
            <Input
              id="edit-rule-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-rule-slug">Slug</Label>
            <Input
              id="edit-rule-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-1.5">
            <Label>Folder</Label>
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
            <Label htmlFor="edit-rule-content">Content</Label>
            <Textarea
              id="edit-rule-content"
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
