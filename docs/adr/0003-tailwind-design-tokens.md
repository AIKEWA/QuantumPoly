# ADR 0003: Tailwind Design Tokens

**Status:** Accepted
**Date:** 2025-09-10

## Context

Tailwind utility classes were sometimes written with raw hex values or inline styles (e.g., `text-[#123456]`). This creates inconsistency and undermines the design system.

## Decision

- All colors, spacing, typography, and radii must come from **Tailwind theme tokens**.
- Tailwind config (`tailwind.config.js`) is extended with project-specific tokens:
- Colors → from design palette
- Spacing → multiples of 4px
- Typography → semantic sizes (e.g., `text-heading`, `text-body`)
- ESLint rule `tailwindcss/classnames-order` enforces consistent ordering.
- **No raw hex, rgb, or hsl in classnames**.
- `@apply` usage limited to shared utilities in `/src/styles/`.

## Consequences

- Consistent design language across all components.
- Improved theming/dark-mode support.
- Tokens act as single source of truth for designers and developers.
