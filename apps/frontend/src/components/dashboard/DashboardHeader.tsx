import * as React from "react";
import { Link } from "@tanstack/react-router";
import { FolderPlus, LogOut, Moon, Plus, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/cookies";

type Theme = "light" | "dark";

type DashboardHeaderProps = {
  onCreateRule: () => void;
  onCreateFolder: () => void;
};

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

/**
 * Dashboard header with navigation, create actions, and theme toggle.
 */
export function DashboardHeader({
  onCreateRule,
  onCreateFolder,
}: DashboardHeaderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return getInitialTheme();
  });

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  async function handleLogout() {
    await authClient.signOut();
    clearSessionCookie();
    window.location.href = "/";
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4">
      <div className="flex items-center gap-4">
        {/* Logo and link to home page. */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://play-lh.googleusercontent.com/htK3QI5pOC5_WQUcl8JTDLiq8fAXMnPtuAaPky_CVjXyyMb1Yh1aEVFAzmKBbJTkbCg"
            alt="georules"
            className="h-7 w-7 rounded border border-border"
          />
          <span className="text-sm font-semibold text-foreground">
            georules
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Buttons to create new folders and rules. */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateFolder}
          className="h-8 gap-1.5"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Folder</span>
        </Button>
        <Button size="sm" onClick={onCreateRule} className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Rule</span>
        </Button>

        {/* Vertical separator. */}
        <div className="h-5 w-px bg-border mx-1" />

        {/* Button to toggle theme. */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark"
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />}
        </Button>

        {/* Sign out button. */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
