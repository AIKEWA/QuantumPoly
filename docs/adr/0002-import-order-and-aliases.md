# ADR 0002: Import Order and Path Aliases

**Status:** Accepted
**Date:** 2025-09-10

## Context

Imports were inconsistent: mixing relative (`../`) and alias (`@/`) paths, with no enforced grouping. This led to noisy diffs and review friction.

## Decision

- Import order is strictly enforced:

1. **Builtins** (`fs`, `path`, etc.)
2. **External packages** (`react`, `next`, etc.)
3. **Internal alias imports** (`@/components`, `@/lib`, etc.)
4. **Relative imports** (`../`, `./`)

- ESLint rules:
- `import/order` with groups + newlines between groups
- `no-duplicate-imports` enabled
- Aliases:
- `@/*` maps to `/src/*` (configured in `tsconfig.json` and ESLint resolver).

## Consequences

- Clean, predictable import style across the repo.
- Reduced churn in PR diffs.
- Contributors must respect alias-first imports; CI enforces this.
