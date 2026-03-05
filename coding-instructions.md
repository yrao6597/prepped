# CLAUDE.md — Coding Practices & Architecture Guidelines

This file defines the coding standards and architectural principles Claude Code must follow for this project. Read and apply all of these before writing any code.

---

## General Principles

- Prefer clarity over cleverness — code is read more than it is written
- Every function, component, and module should do one thing well
- If you have to add a comment to explain what code does, consider rewriting the code instead
- Delete dead code; don't comment it out
- Fail loudly in development, gracefully in production

---

## TypeScript

- Always use strict TypeScript — no implicit `any`, ever
- Define types and interfaces in `types.ts` or co-located `*.types.ts` files
- Use `type` for unions and aliases, `interface` for object shapes
- Avoid type assertions (`as SomeType`) unless absolutely necessary — prefer type guards
- Export types explicitly; don't rely on inference leaking across module boundaries
- Use enums sparingly; prefer union types (`type Status = "loading" | "success" | "error"`)

---

## React

- Use functional components with hooks only — no class components
- Keep components small and focused; if a component exceeds ~150 lines, split it
- Co-locate state as close to where it's used as possible
- Lift state only when genuinely shared between siblings
- Never put business logic inside JSX — extract to handlers or custom hooks
- Custom hooks (`useXxx`) for any logic reused across 2+ components
- Use `useCallback` and `useMemo` only when there's a measurable perf reason — not by default
- Never use index as a key in lists that can reorder or change
- Avoid prop drilling beyond 2 levels — use context or co-location instead

---

## Component Structure

Each component file should follow this order:

1. Imports (external libs, then internal modules, then types)
2. Constants local to the component
3. Sub-components (if small and only used here)
4. Main component function
5. Exported default at the bottom

Example:
  import { useState } from "react"
  import { saveReflection } from "../lib/storage"
  import type { Reflection } from "../types"

  const MAX_NOTES_LENGTH = 5000

  export default function ReflectionForm() { ... }

---

## File & Folder Structure

- One component per file, filename matches component name (PascalCase)
- Utility/helper files in `lib/` — named by domain (e.g. `storage.ts`, `claude.ts`)
- Shared types in `types.ts` at `src/` root
- No barrel files (`index.ts` re-exports) unless the folder has 4+ exports — they obscure traceability
- Keep folder nesting shallow — max 2 levels deep under `src/`

---

## Naming Conventions

- Components: PascalCase (`ReflectionCard`)
- Functions and variables: camelCase (`generatePrepGuide`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- Types and interfaces: PascalCase (`PrepGuide`, `ReflectionEntry`)
- localStorage keys: prefixed with app namespace (`jsa_reflections`, `jsa_resume`)
- Boolean variables: prefix with `is`, `has`, `should` (`isLoading`, `hasError`)
- Event handlers: prefix with `handle` (`handleSubmit`, `handleToggle`)

---

## State Management

- Local UI state: `useState`
- Derived values: compute inline or with `useMemo` — don't store in state what you can derive
- Side effects: `useEffect` with explicit dependency arrays — never leave deps empty unless you mean "run once on mount" and that's intentional
- Persisted state: always go through `lib/storage.ts` — never call `localStorage` directly in components
- Async state shape: always track `{ data, isLoading, error }` as a unit

---

## API Calls (Claude API)

- All API calls go through `lib/claude.ts` — components never call `fetch` directly
- `claude.ts` exports typed functions, not raw fetch wrappers
- Always handle: loading state, error state, empty/null response
- API errors should throw typed errors, not raw strings
- Never log API keys or full request bodies to the console

lib/claude.ts should look like:

  export async function generatePrepGuide(input: PrepGuideInput): Promise<string> { ... }
  export async function generateReflection(input: ReflectionInput): Promise<string> { ... }

---

## Storage (`lib/storage.ts`)

- All localStorage read/write goes through typed helpers here
- Wrap reads in try/catch — localStorage can throw in private browsing
- Always parse and validate on read — don't trust stored data blindly
- Use a versioning constant (STORAGE_VERSION) so you can handle schema migrations later

Example shape:

  export function getReflections(): Reflection[] { ... }
  export function saveReflection(entry: Reflection): void { ... }
  export function getResume(): string { ... }
  export function saveResume(text: string): void { ... }

---

## Error Handling

- Use a consistent error boundary at the app root
- Async functions should return `{ data, error }` tuples OR throw — pick one pattern and stick to it
- Never silently swallow errors — at minimum log them
- User-facing errors should be human-readable, not raw exception messages
- Loading and error states must always be represented in UI — no silent failures

---

## CSS / Tailwind

- Use Tailwind utility classes only — no custom CSS files unless absolutely necessary
- Extract repeated class combinations into a component, not a custom class
- Responsive: mobile-aware but desktop-first for this app is fine
- No inline `style={{}}` except for truly dynamic values (e.g. computed widths)
- Keep class lists readable — break long className strings across lines

---

## Code Hygiene

- No unused imports, variables, or functions — ever
- No `console.log` left in committed code (use a `debug` flag or remove)
- Prefer early returns to deeply nested if/else
- Avoid magic numbers — name your constants
- Functions should be pure where possible — minimize side effects
- Keep functions short: if a function exceeds ~40 lines, consider splitting

---

## Git / Commit Hygiene (if committing)

- Commits are atomic — one logical change per commit
- Commit messages: imperative present tense ("Add reflection card component", not "Added" or "Adding")
- No committing broken code to main

---

## What Claude Code Should NOT Do

- Do not use any UI component library (MUI, Chakra, Ant Design, etc.) — Tailwind only
- Do not add dependencies that aren't necessary — keep package.json lean
- Do not generate placeholder/lorem ipsum content in components
- Do not use `any` as a shortcut when you're unsure of a type — model it properly
- Do not create abstractions preemptively — only abstract when there's actual repetition