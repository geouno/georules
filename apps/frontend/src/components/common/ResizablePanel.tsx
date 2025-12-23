import * as React from "react";
import { cn } from "@/lib/utils";

const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 180;
const MAX_WIDTH = 480;

type ResizablePanelProps = {
  children: React.ReactNode;
  className?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** If provided, width persists to localStorage under this key. */
  storageKey?: string;
};

/**
 * Panel with a draggable right edge for resizing.
 * Optionally persist width to localStorage on mouse release if a storageKey is provided.
 */
export function ResizablePanel({
  children,
  className,
  defaultWidth = DEFAULT_WIDTH,
  minWidth = MIN_WIDTH,
  maxWidth = MAX_WIDTH,
  storageKey,
}: ResizablePanelProps) {
  const [width, setWidth] = React.useState(() => {
    if (typeof window === "undefined" || !storageKey) return defaultWidth;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        return parsed;
      }
    }
    return defaultWidth;
  });

  const isDragging = React.useRef(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();
      const newWidth = e.clientX - panelRect.left;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        // Persist width on release if a storageKey is provided.
        if (storageKey) {
          localStorage.setItem(storageKey, String(width));
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minWidth, maxWidth, storageKey, width]);

  return (
    <div
      ref={panelRef}
      className={cn("relative shrink-0", className)}
      style={{ width }}
    >
      {children}

      {/* Resize handle. */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize",
          "hover:bg-primary/30 active:bg-primary/50",
          "transition-colors duration-100",
        )}
      />
    </div>
  );
}
