// src/pages/Landing.tsx
import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckSquare,
  ChevronRight,
  Copy,
  FileText,
  Folder,
  FolderOpen,
  Moon,
  Sun,
  Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth";
import { hasSessionHint } from "@/lib/cookies";

type Theme = "light" | "dark";

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

function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // SSR-safe: if you ever SSR later, this avoids crashing.
    if (typeof window === "undefined") return "dark";
    return getInitialTheme();
  });

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    // Keep in sync if user changes OS theme and they haven't explicitly set one
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(media.matches ? "dark" : "light");
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

/**
 * Auth-aware buttons for header. Isolated to prevent full page rerenders.
 * Uses cookie hint for instant first paint, then syncs with actual session.
 */
function AuthButtons() {
  // Capture cookie state once on mount to avoid flicker.
  const initialHint = React.useRef(hasSessionHint());
  const { data: session, isPending } = authClient.useSession();

  // While loading, trust the cookie hint. Once loaded, trust the API.
  const isLoggedIn = isPending ? initialHint.current : !!session?.user;

  return (
    <>
      {!isLoggedIn && (
        <Button variant="outline" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      )}
      <Button asChild>
        <Link to="/dash">{isLoggedIn ? "Launch app" : "Get started"}</Link>
      </Button>
    </>
  );
}

type FeatureCardProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function FeatureCard({ eyebrow, title, description }: FeatureCardProps) {
  return (
    <Card className="border-border bg-card/30 backdrop-blur">
      <CardHeader className="space-y-2">
        <div className="text-xs text-muted-foreground">{eyebrow}</div>
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function DashboardPreview() {
  return (
    <Card className="relative overflow-hidden border-border bg-card/40 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="h-5 w-px bg-border" />
            <div className="text-xs text-muted-foreground">
              georules dashboard
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Mini file tree mockup */}
        <div className="rounded-lg border border-border bg-background/50 p-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span>my-rules</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox checked className="h-3.5 w-3.5" />
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">typescript-conventions</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked className="h-3.5 w-3.5" />
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">react-best-practices</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox className="h-3.5 w-3.5" />
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">python-style</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Folder className="h-4 w-4" />
              <span>team-shared</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span>2 rules selected</span>
          </div>
          <Button size="sm" className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy CLI command
          </Button>
        </div>

        {/* Result */}
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <Terminal className="h-4 w-4 text-primary" />
          <code className="text-xs text-foreground">
            georules apply f7k2m --cursor
          </code>
          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="outline" className="border-border text-foreground">
            Cursor
          </Badge>
          <Badge variant="outline" className="border-border text-foreground">
            Windsurf
          </Badge>
          <Badge variant="outline" className="border-border text-foreground">
            Claude Code
          </Badge>
          <Badge variant="outline" className="border-border text-foreground">
            + more
          </Badge>
        </div>
      </CardContent>

      {/* Pink gradient overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(500px_250px_at_30%_20%,hsl(340_79%_58%_/_0.2),transparent_60%),radial-gradient(500px_250px_at_70%_60%,hsl(340_79%_58%_/_0.15),transparent_60%)] opacity-60" />
      </div>
    </Card>
  );
}

function InstallCLI() {
  const [copied, setCopied] = React.useState(false);
  const [pm, setPm] = React.useState<"npm" | "pnpm" | "yarn" | "bun">("npm");

  const commands = {
    npm: "npm install -g @georules/cli",
    pnpm: "pnpm add -g @georules/cli",
    yarn: "yarn global add @georules/cli",
    bun: "bun add -g @georules/cli",
  };

  const cmd = commands[pm];

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {/* Package manager tabs */}
      <div className="flex gap-1">
        {(["npm", "pnpm", "yarn", "bun"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPm(p)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              pm === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Command box */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-1 pl-4">
        <code className="flex-1 font-mono text-sm text-foreground">{cmd}</code>
        <Button
          size="sm"
          variant="secondary"
          onClick={onCopy}
          className="gap-1.5"
        >
          {copied
            ? (
              <>
                <CheckSquare className="h-3.5 w-3.5" />
                Copied
              </>
            )
            : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
        </Button>
      </div>

      {/* Secondary actions */}
      {
        /* <div className="flex gap-2">
        <Button asChild>
          <Link to="/app">Get started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Docs</Link>
        </Button>
      </div> */
      }
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      {/* Background: grid lines + pink gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] opacity-[0.44] [background-size:72px_72px]" />
        {/* Top glow - pink */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_50%_-5%,hsl(340_79%_58%_/_0.15),transparent_60%)]" />
        {/* Side accents - pink variations */}
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_10%_20%,hsl(340_79%_58%_/_0.1),transparent_50%),radial-gradient(700px_400px_at_90%_30%,hsl(340_60%_50%_/_0.08),transparent_50%)]" />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          <div className="flex items-center gap-3 justify-self-start">
            <img
              src="https://play-lh.googleusercontent.com/htK3QI5pOC5_WQUcl8JTDLiq8fAXMnPtuAaPky_CVjXyyMb1Yh1aEVFAzmKBbJTkbCg"
              alt="georules logo"
              className="h-10 w-10 rounded-md border border-border bg-card object-cover"
            />
            <div className="text-md translate-y-[-0.125rem] font-medium leading-none tracking-tight">
              georules
            </div>
          </div>

          <nav className="hidden items-center gap-6 justify-self-center text-sm text-muted-foreground sm:flex">
            <Link to="/" className="transition-colors hover:text-foreground">
              home
            </Link>
            {
              /* <Link to="/" className="transition-colors hover:text-foreground">
              docs
            </Link> */
            }
            <a
              href="https://github.com/geouno/georules"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              github
            </a>
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <ThemeToggle />
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-14 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  Agent rules, unified
                </Badge>
                <span className="text-xs text-muted-foreground">
                  For Cursor, Claude Code, Windsurf & more
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[3rem] tracking-tight sm:text-5xl sm:leading-[3.50rem]">
                Store your agent rules.{" "}
                <span className="text-muted-foreground">
                  Apply them anywhere.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Keep all your AI assistant prompts and behavior rules in one
                dashboard. Select what you need, copy the CLI command, paste it
                in your project. No more scattered files or texting yourself
                templates.
              </p>

              <InstallCLI />

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Step 1</div>
                  <div className="mt-1 text-sm text-foreground">
                    Store & organize rules
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Step 2</div>
                  <div className="mt-1 text-sm text-foreground">
                    Select & copy command
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
                  <div className="text-xs text-muted-foreground">Step 3</div>
                  <div className="mt-1 text-sm text-foreground">
                    Paste in terminal, done
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:pt-2">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mt-16 sm:mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Core workflow</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Built for developers who use AI assistants daily
              </h2>
            </div>
            <div className="hidden sm:block">
              <Button variant="outline" asChild>
                <Link to="/dash">Open dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard
              eyebrow="01 / Library"
              title="Store and organize"
              description="Keep your prompts and rules in folders. No more digging
              through project directories or syncing dotfiles between machines."
            />
            <FeatureCard
              eyebrow="02 / CLI"
              title="Apply in seconds"
              description="Select rules from the dashboard, copy the generated command,
              paste it in your terminal. The CLI writes files formatted for your IDE."
            />
            <FeatureCard
              eyebrow="03 / Sharing"
              title="Share with one link"
              description="Generate a shareable link for teammates. They can view your
              rules, clone them to their account, or apply them directly."
            />
          </div>
        </section>

        {/* Secondary grid section */}
        <section className="mt-16 sm:mt-20">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card/30 backdrop-blur md:col-span-2">
              <CardHeader>
                <div className="text-xs text-muted-foreground">
                  Compatibility
                </div>
                <CardTitle className="text-xl">
                  Works with your agentic IDE
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Store rules once in a canonical format. The CLI handles
                  conversion to whatever format your editor expects — MDC
                  frontmatter for Cursor, CLAUDE.md for Claude Code, and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-border">
                    Cursor
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    Windsurf
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    Claude Code
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    More coming
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur">
              <CardHeader>
                <div className="text-xs text-muted-foreground">Scope</div>
                <CardTitle className="text-xl">Project or global</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Apply rules to a single repo or set them globally for all your
                  projects.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 rounded-lg border border-border bg-background/50 p-3 font-mono text-xs text-foreground">
                  <div>georules apply f7k2m --cursor</div>
                  <div className="text-muted-foreground">
                    georules apply f7k2m --cursor --global
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use cases */}
        <section className="mt-16 pb-20 sm:mt-20">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Use cases</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              For solo devs and teams alike
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Whether you're managing personal coding conventions or
              standardizing AI behavior across a team, georules keeps everything
              in sync.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card/30 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-sm text-foreground">
                  "I stopped copy-pasting the same prompt into every new
                  project."
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Solo developer
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-sm text-foreground">
                  "New hires get our team's Cursor rules on day one with a
                  single command."
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Engineering lead
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/30 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-sm text-foreground">
                  "Switched from Cursor to Claude Code — just changed the flag,
                  same rules."
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Freelancer
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12">
            <Card className="relative overflow-hidden border-border bg-card/30 backdrop-blur">
              <CardContent className="py-10 sm:py-12">
                <div className="mx-auto max-w-3xl text-center">
                  <div className="text-xs text-muted-foreground">
                    Ready to organize your AI rules?
                  </div>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                    Store once. Apply anywhere. Share instantly.
                  </h3>

                  <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                    <Button asChild>
                      <Link to="/dash">Get started</Link>
                    </Button>
                    {
                      /* <Button variant="outline" asChild>
                      <Link to="/">Read the docs</Link>
                    </Button> */
                    }
                  </div>
                </div>
              </CardContent>

              {/* Pink gradient */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_50%_0%,hsl(340_79%_58%_/_0.12),transparent_60%),radial-gradient(600px_300px_at_70%_80%,hsl(340_79%_58%_/_0.08),transparent_60%)]"
              />
            </Card>

            <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border py-8 text-sm text-muted-foreground sm:flex-row">
              <div>© {new Date().getFullYear()} georules</div>
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="transition-colors hover:text-foreground"
                >
                  Privacy
                </Link>
                <Link
                  to="/"
                  className="transition-colors hover:text-foreground"
                >
                  Terms
                </Link>
                <a
                  href="https://github.com/geouno/georules"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
