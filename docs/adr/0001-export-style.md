# ADR 0001: Export Style (Named Exports Only)

**Status:** Accepted
**Date:** 2025-09-10

## Context

Historically, the codebase mixed `export default` and named exports, leading to inconsistent import styles and weaker tree-shaking.
Next.js App Router requires `export default` for certain files (`app/page.tsx`, `app/layout.tsx`, etc.).

## Decision

- All components, hooks, and utilities use **named exports only**.
- Only App Router special files (`page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`) may use `export default`.
- ESLint rule `import/no-default-export` enforces this, with exceptions configured for App Router files.

## Consequences

- Improved discoverability (imports are explicit).
- Tree-shaking and IDE autocompletion become more reliable.
- New contributors must follow rules; lint errors will block merges if violated.
