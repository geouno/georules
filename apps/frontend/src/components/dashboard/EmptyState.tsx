import * as React from "react";
import { FileText, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExampleRule = {
  title: string;
  slug: string;
  preview: string;
  content: string;
};

const EXAMPLE_RULES: ExampleRule[] = [
  {
    title: "Prevent Terminal Session Stall",
    slug: "prevent-terminal-stall",
    preview:
      "Avoid commands that pause for user input or require manual scrolling.",
    content: `## Principles

1. Continuous Flow: Unless the command is intended for user interaction, avoid any command that pauses for user input or requires manual scrolling/quitting.
2. Non-interactive Output: Ensure all shell tools that should not stall the flow treat the session as a raw stream rather than an interactive TTY.

## Application

- For \`git\`, use the \`--no-pager\` flag (e.g., \`git --no-pager diff\`).
- For other CLI tools, pipe the output to \`cat\` or prefix with \`PAGER=cat\` to bypass default pagers.
- Avoid commands that default to interactive views (e.g., \`less\`, \`more\`, or log followers without an exit condition).`,
  },
  {
    title: "TypeScript Best Practices",
    slug: "typescript-best-practices",
    preview: "Enforce strict typing and modern TypeScript conventions.",
    content: `## Principles

1. Strict Mode: Always enable \`strict: true\` in tsconfig.json.
2. Explicit Types: Prefer explicit return types for public functions.
3. No Any: Avoid \`any\` type; use \`unknown\` when type is truly unknown.

## Application

- Use type inference for local variables when type is obvious.
- Prefer interfaces over type aliases for object shapes.
- Use \`const assertions\` for literal types.
- Leverage discriminated unions for state management.`,
  },
  {
    title: "Code Review Guidelines",
    slug: "code-review-guidelines",
    preview: "Standards for reviewing pull requests and providing feedback.",
    content: `## Principles

1. Be Constructive: Focus on the code, not the author.
2. Be Specific: Point to exact lines and suggest alternatives.
3. Be Thorough: Check for logic errors, edge cases, and test coverage.

## Application

- Verify tests cover the changed behavior.
- Look for performance implications.
- Ensure documentation is updated if needed.
- Approve if changes meet requirements, even if not "perfect".`,
  },
  {
    title: "Compound Component Patterns",
    slug: "compound-component-patterns",
    preview: "Use the Provider pattern for complex, reusable UI components.",
    content: `## Compound Components (Provider Pattern) – PREFERRED

For complex, reusable components, use the **compound component pattern** with a Provider to avoid prop drilling and conditional logic hell. This allows the consumer to compose the UI explicitly rather than passing dozens of configuration props to a single "black box" component.

\`\`\`tsx
// ✅ GOOD — Compound component pattern
<Table.Provider data={traces}>
  <Table.Header>
    <Table.Column id="time" sortable>Time</Table.Column>
    <Table.Column id="model">Model</Table.Column>
  </Table.Header>
  <Table.Body>
    {(item) => <Table.Row key={item.id}>{/* ... */}</Table.Row>}
  </Table.Body>
</Table.Provider>

// ❌ BAD — Prop drilling and conditional logic hell
<Table
  data={traces}
  columns={columns}
  sortable={true}
  showHeader={true}
  renderRow={(item) => <div />}
/>
\`\`\`

## When to Use

- Components with multiple interdependent subcomponents.
- UI elements that require flexible composition (tables, accordions, tabs).
- Situations where prop count exceeds 5-7 configuration options.`,
  },
];

type EmptyStateProps = {
  onCreateRule: (example?: ExampleRule) => void;
  hasRules?: boolean;
};

/**
 * Displays a welcome message when no rule is selected.
 */
export function EmptyState(
  { onCreateRule, hasRules = false }: EmptyStateProps,
) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground">
          No rule selected
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a rule from the sidebar to view its content, or create a new
          one.
        </p>

        {/* Create button */}
        <Button onClick={() => onCreateRule()} className="mt-4 gap-1.5">
          <Plus className="h-4 w-4" />
          {hasRules ? "Create an agent rule" : "Create your first agent rule"}
        </Button>
      </div>

      {/* Example rules */}
      <div className="mt-8 w-full max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Example Rules to Get Started
          </span>
        </div>

        <div className="space-y-2">
          {EXAMPLE_RULES.map((example) => (
            <button
              key={example.slug}
              onClick={() => onCreateRule(example)}
              className="w-full text-left rounded-md border border-border bg-card/50 p-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {example.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {example.preview}
                  </div>
                </div>
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { EXAMPLE_RULES };
export type { ExampleRule };
