# Legacy Onboarding (Archived 2025-10-25)
# QuantumPoly Onboarding Guide

**Welcome to QuantumPoly!**

This guide will help you get up to speed with our project, whether you're a developer, content contributor, accessibility reviewer, or governance team member.

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Estimated Onboarding Time:** 2-4 hours (depending on role)

---

## Table of Contents

1. [Welcome & Project Philosophy](#welcome--project-philosophy)
2. [System Overview](#system-overview)
3. [Local Development Setup](#local-development-setup)
4. [Essential Commands](#essential-commands)
5. [Codebase Navigation](#codebase-navigation)
6. [Internationalization (i18n)](#internationalization-i18n)
7. [Governance & Ethics](#governance--ethics)
8. [Contributing Guidelines](#contributing-guidelines)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Testing Strategy](#testing-strategy)
11. [Performance Standards](#performance-standards)
12. [Ethical Decision-Making Framework](#ethical-decision-making-framework)
13. [Resources & Further Reading](#resources--further-reading)

---

## Welcome & Project Philosophy

### Mission Statement

QuantumPoly exists to demonstrate that **technological excellence and ethical responsibility are not competing interests**—they are complementary imperatives. We build AI systems that are:

- **Accessible** — Usable by everyone, regardless of ability
- **Transparent** — Open about capabilities, limitations, and decision-making
- **Performant** — Fast, efficient, and respectful of users' time and resources
- **Ethical** — Designed with human dignity, fairness, and societal benefit at the core

### Core Values

1. **Accessibility as a Right:** WCAG 2.2 AA compliance is our baseline, not our goal. We strive for excellence beyond minimum standards.

2. **Transparent Limitations:** We are honest about what our systems can and cannot do. Overstatement erodes trust; humility builds it.

3. **Evidence-Based Claims:** Every claim we make is backed by implementation, testing, or documented research. No marketing hyperbole.

4. **Continuous Learning:** We treat mistakes as learning opportunities and document our journey openly.

5. **Inclusive Collaboration:** We welcome diverse perspectives and prioritize respectful, constructive discourse.

### Why This Project Matters

QuantumPoly serves as a **living example** of ethical AI development. Our public governance ledger, accessibility-first design, and transparent documentation demonstrate that responsible innovation is achievable at scale. We aim to inspire others to adopt similar practices.

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│  (Next.js 14+ App Router, React 18+, Tailwind CSS 3.x)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐      ┌────────▼────────┐
        │  Static Pages  │      │   API Routes    │
        │  (SSG/ISR)     │      │  (Server-Side)  │
        └───────┬────────┘      └────────┬────────┘
                │                        │
        ┌───────▼────────────────────────▼────────┐
        │      Internationalization (next-intl)    │
        │      6 Locales: en, de, tr, es, fr, it  │
        └─────────────────┬───────────────────────┘
                          │
        ┌─────────────────▼───────────────────────┐
        │  Content Layer (Markdown + JSON)        │
        │  - Policy pages                         │
        │  - Blog posts (future)                  │
        │  - Case studies (future)                │
        └─────────────────┬───────────────────────┘
                          │
        ┌─────────────────▼───────────────────────┐
        │  Governance Layer                       │
        │  - Transparency ledger (JSONL)          │
        │  - Ethics validation                    │
        │  - EII calculation                      │
        └─────────────────────────────────────────┘
```

### Technology Stack Rationale

| Technology      | Version | Rationale                                                      |
|-----------------|---------|----------------------------------------------------------------|
| **Next.js**     | 14.x    | App Router for modern routing, SSG for performance, SEO-friendly |
| **React**       | 18.x    | Industry standard, excellent ecosystem, accessibility support  |
| **TypeScript**  | 5.x     | Type safety prevents bugs, improves maintainability            |
| **Tailwind CSS**| 3.x     | Utility-first, responsive, dark mode support, accessible colors |
| **next-intl**   | 4.x     | First-class i18n for Next.js, server-side translation support  |
| **Zod**         | 3.x     | Runtime validation for API inputs, type-safe schemas           |
| **Jest**        | 29.x    | Unit testing with great TypeScript support                     |
| **Playwright**  | 1.x     | E2E testing with built-in accessibility tools                  |
| **Axe**         | 4.x     | Industry-standard accessibility testing                        |

### Key Design Decisions

**1. Accessibility-First Architecture**

All components are designed with accessibility from the start, not retrofitted:
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes

**2. Performance Budgets**

Strict limits enforce fast, efficient code:
- JavaScript bundle: <250 KB per route
- Lighthouse Performance: ≥90
- Core Web Vitals: LCP ≤2.5s, TBT <300ms, CLS <0.1

**3. Governance Integration**

Every major decision is documented and tracked:
- Transparency ledger for public accountability
- Ethical Integrity Index (EII) as measurable outcome
- CI/CD enforcement of ethical standards

---

## Local Development Setup

### Prerequisites

**Required Software:**

- **Node.js:** 20.x LTS (⚠️ Not 18.x or 22.x)
  ```bash
  node --version
  # Expected: v20.x.x
  ```

- **npm:** 10.x or higher
  ```bash
  npm --version
  # Expected: 10.x.x+
  ```

- **Git:** 2.x or higher
  ```bash
  git --version
  # Expected: git version 2.x.x
  ```

**Recommended IDE:**

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

### Clone and Install

```bash
# 1. Clone the repository
git clone https://github.com/AIKEWA/QuantumPoly.git
cd QuantumPoly

# 2. Install dependencies
npm ci
# Note: Use 'npm ci' (not 'npm install') for reproducible builds

# 3. Verify installation
npm run typecheck
# Expected: No errors

npm run lint
# Expected: No errors or minimal warnings
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy template (if it exists)
cp .env.example .env.local

# Or create manually:
cat > .env.local <<EOF
# Site configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Feature flags (optional)
NEXT_PUBLIC_ENABLE_DASHBOARD=true

# API keys (if needed for development)
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_key
EOF
```

**Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### Running Development Server

```bash
# Start development server
npm run dev

# Server runs at http://localhost:3000
# - Hot reloading enabled
# - TypeScript compilation on save
# - ESLint warnings in terminal
```

**Verify Setup:**

1. Open http://localhost:3000/en in your browser
2. You should see the QuantumPoly homepage
3. Check browser console for errors (should be clean)
4. Try switching languages in the footer

### Common Troubleshooting

**Issue: ESLint errors about missing config**

```bash
# Check for legacy .eslintrc files in parent directories
find .. -name ".eslintrc*"

# If found, rename or remove them
# Our project uses modern eslint.config.mjs
```

**Issue: Build fails with TypeScript errors**

```bash
# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm ci
```

**Issue: "Module not found" errors**

```bash
# Verify you're using Node 20.x
node --version

# Reinstall with legacy peer deps (if issues with peer dependencies)
npm install --legacy-peer-deps
```

**Issue: Port 3000 already in use**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (Mac/Linux)
kill -9 <PID>

# Or run on different port
PORT=3001 npm run dev
```

---

## Essential Commands

### Development

```bash
npm run dev              # Start development server (hot reload)
npm run build            # Build for production
npm run start            # Start production server (after build)
```

### Code Quality

```bash
npm run lint             # Run ESLint (find issues)
npm run lint:strict      # ESLint + Tailwind color check (zero warnings)
npm run format           # Check code formatting with Prettier
npm run format:write     # Auto-fix formatting issues
npm run typecheck        # TypeScript type checking (no build)
```

### Testing

```bash
# Unit tests (Jest)
npm run test             # Run all tests
npm run test:watch       # Watch mode (re-run on changes)
npm run test:coverage    # Generate coverage report

# Accessibility tests
npm run test:a11y        # Jest-axe unit tests
npm run test:e2e:a11y    # Playwright E2E a11y tests

# E2E tests (Playwright)
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Run with UI (debugging)

# i18n tests
npm run test:e2e:i18n    # Test language switching
```

### Performance & SEO

```bash
npm run budget           # Check bundle size budget
npm run lh:perf          # Lighthouse performance audit
npm run lh:a11y          # Lighthouse accessibility audit
npm run seo:validate     # Validate sitemap.xml and robots.txt
```

### Governance & Ethics

```bash
npm run ethics:verify-ledger   # Verify ledger integrity
npm run ethics:aggregate       # Update dashboard data
npm run ethics:validate        # Validate ethics data structure
```

### Internationalization

```bash
npm run validate:translations  # Check translation key consistency
npm run validate:locales       # Validate locale file structure
npm run add-locale            # Add new language (interactive)
```

### Maintenance

```bash
npm run ci                # Full CI pipeline (lint, test, build)
npm run validate          # Run all validation checks
```

---

## Codebase Navigation

### File Organization

```
QuantumPoly/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── [locale]/            # Locale-based routing
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── ethics/          # Ethics page
│   │   │   ├── privacy/         # Privacy page
│   │   │   └── ...
│   │   ├── api/                 # API routes
│   │   │   └── newsletter/      # Newsletter subscription
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Dynamic robots.txt
│   ├── components/              # Reusable React components
│   │   ├── About.tsx
│   │   ├── Hero.tsx
│   │   ├── Footer.tsx
│   │   ├── NewsletterForm.tsx
│   │   └── ...
│   ├── lib/                     # Utility functions
│   │   ├── routes.ts            # Route registry
│   │   ├── seo.ts               # SEO helpers
│   │   └── newsletter/          # Newsletter logic
│   ├── locales/                 # Translation files
│   │   ├── en/
│   │   ├── de/
│   │   └── ...
│   ├── middleware.ts            # Locale routing middleware
│   └── styles/
│       └── globals.css          # Global styles
├── content/                      # Content files
│   └── policies/                # Policy pages (Markdown)
│       ├── ethics/
│       ├── privacy/
│       ├── gep/
│       └── imprint/
├── governance/                   # Governance artifacts
│   ├── ledger/
│   │   ├── ledger.jsonl        # Transparency ledger
│   │   └── releases/           # Release audit records
│   └── README.md
├── scripts/                      # Utility scripts
│   ├── aggregate-ethics.mjs
│   ├── verify-ledger.mjs
│   ├── lighthouse-a11y.mjs
│   └── ...
├── __tests__/                    # Test files
│   ├── a11y.*.test.tsx          # Accessibility tests
│   ├── components/              # Component tests
│   └── integration/             # Integration tests
├── e2e/                          # Playwright E2E tests
│   ├── a11y/
│   ├── i18n/
│   └── policies/
├── docs/                         # Documentation
│   ├── I18N_GUIDE.md
│   ├── ACCESSIBILITY_TESTING.md
│   ├── FINAL_REVIEW_CHECKLIST.md
│   └── ...
├── .github/                      # GitHub configuration
│   └── workflows/               # CI/CD workflows
├── public/                       # Static assets
│   └── images/
├── README.md                     # Quick reference
├── MASTERPLAN.md                 # Project roadmap
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind config
├── jest.config.js                # Jest config
└── playwright.config.ts          # Playwright config
```

### Component Architecture

**All components follow these principles:**

1. **Props-Driven:** No hardcoded text, fully configurable via props
2. **i18n-Ready:** Accept translated strings from parent
3. **Accessible:** Semantic HTML, ARIA labels, keyboard navigation
4. **Themeable:** Support light and dark modes via Tailwind
5. **Tested:** Unit tests with Jest + Testing Library

**Example: Hero Component**

```typescript
// src/components/Hero.tsx

interface HeroProps {
  title: string;                  // Main heading
  subtitle?: string;              // Optional subtitle
  ctaLabel?: string;              // CTA button label
  onCtaClick?: () => void;        // CTA handler
  headingLevel?: 1 | 2 | 3;      // Semantic heading level
  heroImage?: HeroImageProps;     // Optional background image
  className?: string;             // Additional styles
}

export function Hero({ title, subtitle, ... }: HeroProps) {
  // Component implementation
}
```

Usage in pages:

```typescript
// src/app/[locale]/page.tsx

import { Hero } from '@/components/Hero';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('hero');
  
  return (
    <Hero
      title={t('title')}
      subtitle={t('subtitle')}
      ctaLabel={t('ctaLabel')}
      headingLevel={1}
    />
  );
}
```

### Testing Conventions

**Unit Tests (Jest + Testing Library):**

- Location: `__tests__/[ComponentName].test.tsx`
- Focus: Component behavior, accessibility, user interactions
- No snapshots (brittle, hard to maintain)
- Use semantic queries (`getByRole`, `getByLabelText`)

**E2E Tests (Playwright):**

- Location: `e2e/[feature]/[test-name].spec.ts`
- Focus: User workflows, cross-page navigation, real browser behavior
- Automated accessibility scans with `@axe-core/playwright`

**Accessibility Tests:**

- Location: `__tests__/a11y.*.test.tsx` (unit) and `e2e/a11y/*.spec.ts` (E2E)
- Zero tolerance for critical/serious violations

---

## Internationalization (i18n)

### Supported Locales

| Locale | Language  | Status    | Completion |
|--------|-----------|-----------|------------|
| `en`   | English   | ✅ Complete | 100%       |
| `de`   | Deutsch   | ✅ Complete | 100%       |
| `tr`   | Türkçe    | ✅ Complete | 100%       |
| `es`   | Español   | ✅ Complete | 100%       |
| `fr`   | Français  | ✅ Complete | 100%       |
| `it`   | Italiano  | ✅ Complete | 100%       |

### File Structure

```
src/locales/
├── en/
│   ├── hero.json         # Hero section
│   ├── about.json        # About section
│   ├── vision.json       # Vision section
│   ├── newsletter.json   # Newsletter form
│   ├── footer.json       # Footer
│   ├── common.json       # Shared content
│   └── seo.json          # SEO metadata
├── de/
│   └── ... (same structure)
└── ...
```

### Adding Translation Keys

1. **Add key to English file:**

```json
// src/locales/en/hero.json
{
  "title": "Welcome to QuantumPoly",
  "subtitle": "Building ethical AI systems",
  "newKey": "This is a new translation"
}
```

2. **Add to all other locales:**

```bash
# Manually add to each locale, or use validation to find missing keys
npm run validate:translations

# Output will show which keys are missing in which locales
```

3. **Use in component:**

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('hero');
  
  return <p>{t('newKey')}</p>;
}
```

### Adding New Languages

```bash
# Interactive script
npm run add-locale

# Follow prompts:
# - Enter locale code (e.g., 'ja' for Japanese)
# - Enter language name in English (e.g., 'Japanese')
# - Enter language name in native script (e.g., '日本語')
```

Manual steps if script not available:

1. Create `src/locales/[locale]/` directory
2. Copy all JSON files from `en/` as templates
3. Add locale to `src/i18n.ts`:

```typescript
export const locales = ['en', 'de', 'tr', 'es', 'fr', 'it', 'ja'] as const;
```

4. Add language to `src/locales/en/common.json`:

```json
{
  "languages": {
    ...
    "ja": "日本語"
  }
}
```

5. Translate all JSON files
6. Test: `npm run test:e2e:i18n`

### Best Practices

- **Keep keys semantic:** `hero.title`, not `hero.text1`
- **No HTML in translations:** Use React components for formatting
- **Pluralization:** Use ICU message format when needed
- **Date/Number formatting:** Leverage `next-intl` formatting utilities
- **Context:** Add comments in JSON for complex translations

---

## Governance & Ethics

### Ethical Integrity Index (EII)

**Definition:** A composite score measuring ethical maturity across four dimensions.

**Formula:**

```
EII = 0.30 × Accessibility
    + 0.30 × Performance
    + 0.20 × SEO
    + 0.20 × Bundle Efficiency
```

**Current Score:** 85/100 (Target: ≥90)

**Breakdown:**

| Component      | Weight | Current | Target |
|----------------|--------|---------|--------|
| Accessibility  | 30%    | 92      | 95     |
| Performance    | 30%    | 90      | 95     |
| SEO            | 20%    | 95      | 98     |
| Bundle         | 20%    | 88      | 90     |

### Transparency Ledger

**Location:** `governance/ledger/ledger.jsonl`

**Purpose:** Chronological record of all major decisions, deployments, and ethical reviews.

**Structure:**

```jsonl
{"id":"2025-10-25-baseline","timestamp":"2025-10-25T12:00:00Z","event":"ledger-initialization","eii":85,"data":{...}}
{"id":"2025-10-26-v0.1.0","timestamp":"2025-10-26T14:30:00Z","event":"release","version":"v0.1.0","eii":86,"data":{...}}
```

**Verification:**

```bash
npm run ethics:verify-ledger

# Expected output:
# ✅ Ledger Integrity Verified
# 📊 Total Entries: N
# 📈 Average EII: 85.0
```

### Policy Pages Review Process

**Location:** `content/policies/`

**Front Matter Fields:**

```yaml
---
title: 'Ethics & Transparency'
summary: 'Brief description'
status: 'in-progress' | 'published'
owner: 'Team <email@quantumpoly.ai>'
lastReviewed: '2025-10-25'
nextReviewDue: '2026-01-25'
version: 'v0.2.0'
---
```

**Review Cycle:** Every 3 months or on major changes

**Review Checklist:**

- [ ] Claims are evidence-based
- [ ] Language is cautiously framed
- [ ] No overstatement of capabilities
- [ ] Accessibility maintained (heading hierarchy, link text)
- [ ] References to governance ledger where applicable
- [ ] Version number incremented
- [ ] `lastReviewed` updated

### Accessibility as Ethical Verification

**Philosophy:** Accessibility is not a feature—it's a fundamental right and ethical imperative.

**WCAG 2.2 Level AA Compliance:**

- All pages must meet WCAG 2.2 AA standards
- Zero critical or serious violations tolerated
- Automated testing in CI/CD (blocks merge if failing)
- Manual keyboard navigation and screen reader testing

**Testing Layers:**

1. **Linting:** `eslint-plugin-jsx-a11y` (development-time)
2. **Unit Tests:** `jest-axe` (component-level)
3. **E2E Tests:** `@axe-core/playwright` (browser-level)
4. **Lighthouse:** Automated audits (≥95 accessibility score)

---

## Contributing Guidelines

### Branch Naming Conventions

```
feat/feature-name       # New features
fix/bug-description     # Bug fixes
docs/doc-updates        # Documentation only
refactor/code-cleanup   # Code refactoring (no behavior change)
test/test-improvements  # Test additions or fixes
chore/maintenance       # Maintenance tasks (deps, configs)
```

**Examples:**

- `feat/blog-module`
- `fix/newsletter-validation`
- `docs/update-onboarding`
- `refactor/extract-footer-logic`

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Test additions or fixes
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(i18n): add Japanese locale support

- Added ja locale JSON files
- Updated i18n.ts configuration
- Added Japanese to language switcher

Closes #123
```

```bash
fix(a11y): improve focus indicator contrast

Focus indicators were not meeting WCAG 2.2 contrast requirements
in dark mode. Increased border width and opacity.

Related to #456
```

### Pull Request Checklist

Before submitting a PR:

- [ ] Code follows project style (run `npm run lint` and `npm run format:write`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] All tests pass (`npm run test`)
- [ ] Accessibility tests pass (`npm run test:a11y`)
- [ ] No new accessibility violations introduced
- [ ] Documentation updated (README, relevant docs)
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains changes clearly
- [ ] Screenshots/videos included for UI changes

### Code Review Expectations

**For Reviewers:**

- **Accessibility Review:** Verify WCAG compliance, keyboard navigation, ARIA usage
- **Ethical Considerations:** Check for overstated claims, transparent language
- **Performance:** Ensure no bundle bloat, unnecessary re-renders
- **Security:** Look for potential vulnerabilities (XSS, injection, secrets exposure)
- **Testing:** Verify adequate test coverage
- **Documentation:** Ensure changes are documented

**For Contributors:**

- **Be Responsive:** Address review comments promptly
- **Be Open:** Accept constructive feedback gracefully
- **Be Thorough:** Don't rush; quality over speed
- **Be Collaborative:** Discuss tradeoffs and alternatives

---

## CI/CD Pipeline

### GitHub Actions Workflows

**1. `ci.yml` — Unified Quality Gates**

Runs on every push and PR to `main`:

- Linting and type checking
- Unit tests with coverage
- Accessibility tests (Jest-axe, Playwright)
- Performance tests (bundle budget, Lighthouse)
- Governance validation
- Build verification

**2. `preview.yml` — Preview Deployments**

Runs on PRs:

- Deploys to Vercel preview environment
- Comments preview URL on PR
- Runs Lighthouse CI audit on preview

**3. `release.yml` — Staging & Production**

Triggered by:

- **Push to `main`:** Automatic staging deployment
- **Tag `v*.*.*` + GitHub Release:** Production deployment (requires approval)

### Deployment Environments

| Environment  | Trigger          | URL                          | Approval Required |
|--------------|------------------|------------------------------|-------------------|
| **Preview**  | Pull Request     | `quantumpoly-pr-N-*.vercel.app` | No                |
| **Staging**  | Merge to `main`  | Dynamic Vercel URL           | No                |
| **Production** | Tag + Release  | `https://www.quantumpoly.ai` | Yes               |

### Quality Gates (All Must Pass)

- ✅ Linting: Zero errors, minimal warnings
- ✅ Type checking: Zero TypeScript errors
- ✅ Tests: All passing, coverage ≥85%
- ✅ Accessibility: Zero critical/serious violations, Lighthouse ≥95
- ✅ Performance: Bundle <250 KB, Lighthouse ≥90
- ✅ Governance: Ledger integrity verified
- ✅ Build: Successful production build

**Merge Blocked If:** Any quality gate fails

---

## Testing Strategy

### Unit Tests (Jest + Testing Library)

**Philosophy:** Test behavior, not implementation details.

**Best Practices:**

- Use semantic queries (`getByRole`, `getByLabelText`)
- Test user interactions, not internal state
- Cover edge cases and error handling
- Aim for 85%+ coverage on core components

**Example:**

```typescript
// __tests__/Hero.test.tsx

import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/Hero';

describe('Hero', () => {
  it('renders title and subtitle', () => {
    render(<Hero title="Welcome" subtitle="To QuantumPoly" />);
    
    expect(screen.getByRole('heading', { level: 2, name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByText('To QuantumPoly')).toBeInTheDocument();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = render(<Hero title="Welcome" />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### E2E Tests (Playwright)

**Philosophy:** Validate complete user workflows in real browsers.

**Scope:**

- Multi-page navigation
- Language switching
- Form submissions
- Accessibility in real browsers

**Example:**

```typescript
// e2e/i18n/language-switching.spec.ts

import { test, expect } from '@playwright/test';

test('user can switch languages', async ({ page }) => {
  await page.goto('/en');
  
  // Verify English content
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome');
  
  // Switch to German
  await page.getByRole('combobox', { name: /language/i }).selectOption('de');
  await page.waitForURL('/de');
  
  // Verify German content
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Willkommen');
});
```

### Accessibility Testing

**Three-Layer Approach:**

1. **ESLint (Development Time):**
   ```bash
   npm run lint
   # Catches common a11y mistakes while coding
   ```

2. **jest-axe (Component Level):**
   ```bash
   npm run test:a11y
   # Validates rendered component accessibility
   ```

3. **Playwright Axe (Browser Level):**
   ```bash
   npm run test:e2e:a11y
   # Full-page accessibility in real browser
   ```

**Expected Standard:** Zero critical or serious violations.

### Storybook (Component Documentation)

**Purpose:** Visual documentation and manual testing.

**Location:** `stories/[ComponentName].stories.tsx`

**Run Storybook:**

```bash
npm run storybook
# Opens at http://localhost:6006
```

**Use Cases:**

- Visual regression testing (future)
- Component showcase for designers
- Accessibility addon for manual checks

---

## Performance Standards

### Bundle Budget

**Target:** <250 KB JavaScript per route

**Verification:**

```bash
npm run build
npm run budget

# Expected output:
# ✅ All routes within budget
```

**If Exceeded:**

- Review dynamic imports (are heavy components loaded eagerly?)
- Check for duplicate dependencies (`npm ls [package-name]`)
- Use bundle analyzer: `ANALYZE=true npm run build`

### Lighthouse Thresholds

| Metric              | Minimum | Target | Notes                          |
|---------------------|---------|--------|--------------------------------|
| Performance         | 90      | 95     | Desktop profile                |
| Accessibility       | 95      | 100    | WCAG 2.2 AA baseline           |
| Best Practices      | 95      | 100    | Security, HTTPS, console errors |
| SEO                 | 95      | 100    | Metadata, sitemap, robots.txt  |

**Run Audits:**

```bash
# Start production build
npm run build
npm run start

# In another terminal:
npm run lh:perf     # Performance
npm run lh:a11y     # Accessibility
```

### Core Web Vitals

| Metric                        | Target    | Measurement                    |
|-------------------------------|-----------|--------------------------------|
| Largest Contentful Paint (LCP) | ≤2.5s     | Time to largest element visible |
| First Contentful Paint (FCP)   | ≤1.8s     | Time to first content visible  |
| Total Blocking Time (TBT)      | <300ms    | Main thread blocking time      |
| Cumulative Layout Shift (CLS)  | <0.1      | Visual stability               |

### Optimization Techniques

- **Image Optimization:** Use `next/image` with WebP/AVIF
- **Code Splitting:** Dynamic imports for below-the-fold components
- **Font Loading:** `next/font` with `display: 'swap'`
- **Script Loading:** Defer non-critical scripts with `next/script`

---

## Ethical Decision-Making Framework

### When to Escalate

Escalate to governance team if:

- **Privacy Impact:** New data collection or processing
- **Accessibility Trade-off:** Feature conflicts with a11y standards
- **Performance vs. Functionality:** Trade-off affects user experience
- **Overstated Claims:** Marketing language may misrepresent capabilities
- **Bias Risk:** Feature may have discriminatory outcomes

**Contact:** trust@quantumpoly.ai

### Trade-offs Between Features and Standards

**Guiding Question:** "Can we achieve the goal without compromising accessibility or performance?"

**Process:**

1. **Explore Alternatives:** Is there a way to meet both needs?
2. **Document Trade-off:** Why is the trade-off necessary?
3. **Measure Impact:** How many users affected? How severely?
4. **Seek Approval:** Get governance team sign-off
5. **Communicate Transparently:** Document limitation publicly

**Example:**

**Scenario:** Adding a complex interactive visualization that requires heavy JavaScript.

**Resolution:**
- Provide text-based alternative (accessible, lightweight)
- Load visualization only if user opts in
- Document limitation and alternative in UI

### Privacy-by-Design Principles

**Minimize Data Collection:**

- Only collect what's absolutely necessary
- Aggregate and anonymize when possible
- Clear purpose specification

**User Control:**

- Obtain explicit consent
- Provide opt-out mechanisms
- Enable data deletion

**Transparency:**

- Explain data use in plain language
- Link to privacy policy
- Notify of changes

### Transparent Communication About Limitations

**Good Example:**

> "This demo illustrates AI capabilities for educational purposes. It may generate plausible but incorrect information and reflects biases present in training data. It is not intended for production use."

**Bad Example:**

> "Our revolutionary AI system delivers perfect results every time."

**Guidelines:**

- Be specific about what can and cannot be done
- Acknowledge uncertainty where it exists
- Frame capabilities realistically
- Provide context for limitations

---

## Resources & Further Reading

### Project Documentation

- **[README.md](./README.md)** — Quick technical reference
- **[MASTERPLAN.md](./MASTERPLAN.md)** — Project roadmap and phases
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Detailed contribution workflow
- **[docs/I18N_GUIDE.md](./docs/I18N_GUIDE.md)** — Comprehensive i18n guide
- **[docs/ACCESSIBILITY_TESTING.md](./docs/ACCESSIBILITY_TESTING.md)** — A11y testing deep dive
- **[docs/FINAL_REVIEW_CHECKLIST.md](./docs/FINAL_REVIEW_CHECKLIST.md)** — Pre-launch audit procedures
- **[docs/STRATEGIC_ROADMAP.md](./docs/STRATEGIC_ROADMAP.md)** — Future feature planning

### Block Implementation Summaries

Historical context for major phases:

- `IMPLEMENTATION_SUMMARY_BLOCK2_FINAL.md` — Modularization
- `IMPLEMENTATION_SUMMARY_BLOCK3_FINAL.md` — i18n architecture
- `IMPLEMENTATION_SUMMARY_BLOCK4_FINAL.md` — Newsletter backend
- `BLOCK5_FINAL_DELIVERY_REPORT.md` — Ethics & transparency pages
- `BLOCK6.1_SEO_IMPLEMENTATION_SUMMARY.md` — SEO optimization
- `BLOCK7_CICD_IMPLEMENTATION_SUMMARY.md` — CI/CD pipeline
- `BLOCK8_READINESS_REPORT.md` — Governance readiness

### Governance Documentation

- **[ETHICAL_GOVERNANCE_IMPLEMENTATION.md](./ETHICAL_GOVERNANCE_IMPLEMENTATION.md)** — Governance framework
- **[TRUST_POLICIES_IMPLEMENTATION_SUMMARY.md](./TRUST_POLICIES_IMPLEMENTATION_SUMMARY.md)** — Trust policies
- **[governance/README.md](./governance/README.md)** — Ledger system overview

### External Resources

**Accessibility:**

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WebAIM Articles](https://webaim.org/articles/)

**Next.js:**

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

**Testing:**

- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

**Performance:**

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Core Web Vitals](https://web.dev/vitals/)

---

## Next Steps After Onboarding

### For Developers

1. **Pick a First Issue:**
   - Look for `good-first-issue` label in GitHub issues
   - Start with documentation improvements or test additions

2. **Make Your First PR:**
   - Follow branch naming and commit conventions
   - Ensure all quality gates pass
   - Engage with code review feedback

3. **Explore Specialized Areas:**
   - Accessibility improvements
   - Performance optimizations
   - i18n expansions
   - Governance enhancements

### For Content Contributors

1. **Review Existing Content:**
   - Read policy pages in `content/policies/`
   - Understand tone and style

2. **Propose Improvements:**
   - Open GitHub issue with suggestions
   - Focus on clarity, accuracy, accessibility

3. **Future Content:**
   - Blog posts (once module is built)
   - Case studies (once clients consent)

### For Accessibility Reviewers

1. **Run Accessibility Audits:**
   - `npm run test:a11y` and `npm run test:e2e:a11y`
   - Review Lighthouse reports

2. **Manual Testing:**
   - Keyboard navigation
   - Screen reader testing (VoiceOver, NVDA, JAWS)

3. **Document Findings:**
   - Open GitHub issues with specific violations
   - Suggest remediation strategies

### For Governance Reviewers

1. **Review Policy Pages:**
   - Check for accuracy and evidence-based claims
   - Verify responsible language framing

2. **Verify Ledger Integrity:**
   - `npm run ethics:verify-ledger`
   - Review governance reports

3. **Participate in Ethical Reviews:**
   - Review new features for ethical implications
   - Provide feedback on governance processes

---

## Contact & Support

### Team Contacts

- **General Inquiries:** contact@quantumpoly.ai
- **Technical Questions:** engineering@quantumpoly.ai
- **Ethics & Governance:** trust@quantumpoly.ai
- **Privacy Concerns:** privacy@quantumpoly.ai

### Community Channels

- **GitHub Issues:** For bug reports and feature requests
- **GitHub Discussions:** For questions and community dialogue
- **Pull Requests:** For code contributions

### Response Times

- GitHub issues: Typically within 2-3 business days
- Email inquiries: Within 1 week
- Security issues: Within 24 hours (email trust@quantumpoly.ai)

---

## Welcome Again!

We're excited to have you join the QuantumPoly community. Your contributions—whether code, content, accessibility testing, or governance review—help us build AI systems that are not just innovative, but **responsible, transparent, and accessible to all**.

**Remember:** Quality and ethics over speed. Take your time, ask questions, and let's build something meaningful together.

**Happy contributing! 🚀**

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Feedback:** Open GitHub issue with label `documentation` or `onboarding`

