# Developer Quick Start Guide

**Get from Zero to First Contribution in 15 Minutes**

This guide provides a fast-track onboarding path for experienced developers familiar with Next.js, React, and TypeScript. For comprehensive documentation, see [ONBOARDING.md](../../ONBOARDING.md).

**Target Audience:** Developers with experience in modern web development  
**Estimated Time:** 15-20 minutes  
**Version:** 1.0.0

---

## Prerequisites Check (2 min)

```bash
# Verify Node.js 20.x
node --version
# Expected: v20.x.x

# Verify npm 10.x+
npm --version
# Expected: 10.x.x+

# Verify Git
git --version
# Expected: 2.x.x+
```

If any prerequisite fails, see [detailed setup](../../ONBOARDING.md#prerequisites).

---

## Setup (5 min)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/AIKEWA/QuantumPoly.git
cd QuantumPoly

# Install dependencies (use ci, not install)
npm ci

# Verify installation
npm run lint && npm run typecheck && npm run test
```

**Expected:** All commands pass without errors.

### 2. Start Development Server

```bash
# Start dev server
npm run dev

# Open http://localhost:3000/en
```

**Verify:** Homepage loads, language switcher works, no console errors.

---

## Key Tech Stack (2 min)

| Technology  | Version | Purpose                          |
|-------------|---------|----------------------------------|
| Next.js     | 14.x    | App Router, SSG, API routes      |
| React       | 18.x    | UI framework                     |
| TypeScript  | 5.x     | Type safety                      |
| Tailwind    | 3.x     | Styling (utility-first)          |
| next-intl   | 4.x     | Internationalization             |
| Jest        | 29.x    | Unit testing                     |
| Playwright  | 1.x     | E2E testing                      |

**Key Patterns:**

- **Server Components:** Default in App Router
- **Client Components:** Mark with `'use client'`
- **i18n:** All pages under `app/[locale]/`
- **Styling:** Tailwind utilities (no inline styles)

---

## Project Structure (2 min)

```
src/
├── app/
│   ├── [locale]/         # Locale-based routing
│   │   ├── page.tsx      # Home page
│   │   ├── ethics/       # Policy pages
│   │   └── ...
│   └── api/
│       └── newsletter/   # Newsletter API endpoint
├── components/           # Reusable components
│   ├── Hero.tsx
│   ├── Footer.tsx
│   └── ...
├── lib/                  # Utilities
│   ├── routes.ts         # Route registry
│   └── seo.ts            # SEO helpers
└── locales/             # Translation files
    ├── en/
    ├── de/
    └── ...
```

**Critical Files:**

- `src/i18n.ts` — i18n configuration
- `src/middleware.ts` — Locale routing
- `tailwind.config.js` — Tailwind customization

---

## Common Development Workflows (3 min)

### Adding a New Component

```bash
# 1. Create component file
touch src/components/MyComponent.tsx

# 2. Write component (TypeScript + props interface)
```

```typescript
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </section>
  );
}
```

```bash
# 3. Create test file
touch __tests__/MyComponent.test.tsx

# 4. Write test
```

```typescript
// __tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

```bash
# 5. Run tests
npm run test -- MyComponent.test.tsx
```

### Fixing a Bug

```bash
# 1. Create fix branch
git checkout -b fix/bug-description

# 2. Make changes

# 3. Run checks
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run test         # Jest
npm run test:a11y    # Accessibility

# 4. Commit with conventional commit message
git commit -m "fix(component): brief description

Detailed explanation of fix and why it was needed."

# 5. Push and create PR
git push origin fix/bug-description
```

### Adding a Translation Key

```bash
# 1. Add to English locale
# Edit src/locales/en/[namespace].json
{
  "existingKey": "Existing translation",
  "newKey": "New translation"
}

# 2. Add to all other locales (de, tr, es, fr, it)

# 3. Use in component
```

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');
  return <p>{t('newKey')}</p>;
}
```

```bash
# 4. Validate translations
npm run validate:translations
```

---

## Essential Commands (1 min)

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Quality Checks
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run format:write     # Auto-format with Prettier

# Testing
npm run test             # All tests
npm run test:watch       # Watch mode
npm run test:a11y        # Accessibility tests
npm run test:e2e         # E2E tests (Playwright)

# Performance
npm run budget           # Bundle size check
npm run lh:perf          # Lighthouse performance audit

# Governance
npm run ethics:verify-ledger  # Verify transparency ledger
```

---

## Debugging Tips (2 min)

### TypeScript Errors

```bash
# Clear cache and rebuild
rm tsconfig.tsbuildinfo
npm run typecheck
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Test Failures

```bash
# Run specific test file
npm run test -- MyComponent.test.tsx

# Run in watch mode with verbose output
npm run test:watch -- --verbose
```

### Dependency Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm ci
```

---

## Quality Standards (1 min)

**Before Opening PR:**

- ✅ `npm run lint` passes
- ✅ `npm run typecheck` passes
- ✅ `npm run test` passes (all tests)
- ✅ `npm run test:a11y` passes (zero violations)
- ✅ Code formatted (`npm run format:write`)
- ✅ Commit messages follow Conventional Commits
- ✅ Documentation updated (if applicable)

**Accessibility Requirements:**

- WCAG 2.2 AA compliance (non-negotiable)
- Zero critical or serious axe violations
- Keyboard navigation functional
- Screen reader compatible

**Performance Requirements:**

- Bundle budget: <250 KB per route
- Lighthouse Performance: ≥90
- No unnecessary re-renders

---

## First Contribution Ideas

**Good First Issues:**

1. **Documentation:** Fix typos, improve clarity, add examples
2. **Tests:** Add test coverage for under-tested components
3. **Accessibility:** Improve ARIA labels, keyboard navigation
4. **i18n:** Add translation for new locale or improve existing
5. **Refactoring:** Extract duplicate code, improve type safety

**Labels to Look For:**

- `good-first-issue` — Beginner-friendly
- `help-wanted` — Community contributions welcome
- `documentation` — Doc improvements
- `enhancement` — New features
- `bug` — Bug fixes

---

## Next Steps

### Option 1: Dive Deeper

- Read [ONBOARDING.md](../../ONBOARDING.md) for comprehensive overview
- Review [I18N_GUIDE.md](../I18N_GUIDE.md) for i18n details
- Study [ACCESSIBILITY_TESTING.md](../ACCESSIBILITY_TESTING.md) for a11y

### Option 2: Start Contributing

1. Browse [GitHub Issues](https://github.com/AIKEWA/QuantumPoly/issues)
2. Pick a `good-first-issue`
3. Comment that you're working on it
4. Fork, branch, code, test, PR!

### Option 3: Explore the Codebase

- Study `src/components/Hero.tsx` — Well-documented component
- Review `__tests__/a11y.home.test.tsx` — Accessibility testing example
- Read `src/lib/routes.ts` — Route management pattern

---

## Resources

**Project Documentation:**

- [README.md](../../README.md) — Technical quick reference
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Contribution workflow
- [MASTERPLAN.md](../../MASTERPLAN.md) — Project roadmap

**External Resources:**

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [next-intl](https://next-intl-docs.vercel.app/)

---

## Contact

**Questions?**

- GitHub Issues: [Open an issue](https://github.com/AIKEWA/QuantumPoly/issues)
- Email: engineering@quantumpoly.ai

**Found a Bug?**

- Report via [GitHub Issues](https://github.com/AIKEWA/QuantumPoly/issues/new)

---

**You're now ready to contribute! 🚀**

**Remember:** Quality and accessibility over speed. Take your time, write tests, and ask questions.

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Feedback:** Open GitHub issue with label `documentation` or `onboarding`

