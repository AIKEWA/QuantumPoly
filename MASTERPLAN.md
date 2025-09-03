# 📖 MASTERPLAN.md
**Project:** QuantumPoly website
**Owner:** Aykut Aydin (A.I.K)
**Advisor:** Prof. Dr. Esta Willy Armstrong (EWA)
---
## 🌌 Vision
The QuantumPoly website is more than just a landing page: it is a **showcase for technological excellence** and a **testing ground for AI-supported development**.
Our mission: **Clean code, clear architecture, i18n-ready, accessible, SEO-optimized, secure and transparent.**
---
## 🛠 Project Phases & Prompt Blocks
### **Prompt Block 1: Codebase & Hygiene Check**
🎯 Goal: Inventory, standardize structure, remove duplicates, set up basic configurations.
* Inventory: `src/` tree structure, router (app/pages), i18n folder, CSS strategy, Lint/Prettier.
* Identify and clean up duplicate files (e.g., `globals.css`).
* Standardized structure: `src/components`, `src/styles`, `src/locales`.
* Baseline configurations: `eslint.config.mjs`, `.prettierrc.json`, `tailwind.config.js`.
* README extension: "Codebase Hygiene & Conventions".
* Scripts: `lint`, `format`, `format:write`, `dev`.
---
### **Prompt Block 2: Modularization of the Main Components**
🎯 Goal: Extract main areas into **reusable components**.
* Components: `Hero`, `About`, `Vision`, `NewsletterForm`, `Footer`.
* Props strictly typed, i18n-capable, accessible, Tailwind light/dark.
* Tests (Jest + RTL) + Storybook Stories.
* Accessibility first: semantics, ARIA, focus control.
* Extensible (slots/props for media, social links, etc.).
---
### **Prompt Block 3: Internationalization & Content Architecture**
🎯 Goal: Full i18n architecture with `next-intl`.
* Locale routing: `/[locale]` → `en`, `de`, `tr`.
* JSON files with namespaces (`hero`, `about`, `vision`, `newsletter`, `footer`, `language`).
* `LanguageSwitcher`: A11y, routing, focus handling.
* Middleware for default locale.
* Typing & CI check for consistent keys.
* README documentation: "Add a new language/string".
---
### **Prompt Block 4: Newsletter Backend & API Routing**
🎯 Goal: Complete newsletter flow.
* API: `app/api/newsletter/route.ts` (App Router).
* Validation with **Zod**, status codes: `201`, `400`, `409`, `429`, `500`.
* In-memory storage + adapter for Supabase.
* `NewsletterForm`: consumes API, displays success/error via i18n.
* Tests: unit + integration (MSW/Supertest).
* README: how to extend locale keys and storage.
---
### **Prompt Block 5: Ethics, Transparency, GEP & Privacy Pages**
🎯 Goal: Compliance-oriented pages, clear & accessible.
* Static pages: `/ethics`, `/gep`, `/privacy`, `/imprint`.
* Content: Markdown/JSON in `/content/policies/`.
* Front matter: `title`, `summary`, `status`, `owner`, `lastReviewed`, `nextReviewDue`, `version`.
* Components: `PolicyLayout`, `FAQ`, `LastUpdatedFooter`.
* SEO: `noindex` if `status !== published`.
* Footer/navigation links.
* Tests: Schema validation + A11y.
---
### **Prompt Block 6: SEO, Meta, Accessibility, Performance**
🎯 Goal: SEO/A11y/performance optimization for launch.
* Dynamic metadata (`generateMetadata`) with i18n.
* Sitemap + robots.txt with hreflang.
* Accessibility: `eslint-plugin-jsx-a11y`, jest-axe tests.
* Performance: `next/image`, code splitting, Lighthouse >90.
* README: "SEO/A11y/Perf" section.
---
### **Prompt Block 7: CI/CD, Testing & Deployment**
🎯 Goal: Robust pipeline (GitHub + Vercel).
* `.github/workflows/ci.yml`: PRs, Lint, Typecheck, Tests, Build, Preview Deploy.
* `.github/workflows/release.yml`: main → Staging, Tag → Production (with approval).
* Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
* DNS documentation (`docs/DNS.md`).
* README: Pipeline overview, "Why this design".
---
### **Prompt Block 8: Review, Launch & Next Steps**
🎯 Goal: Finalization & handover.
* Review with Lighthouse, Axe, Jest.
* Check: Policy pages are correct; language is cautious.
* Next steps:
* Community/blog module
* AI agent demo (showcase)
* Case studies/showreel
* Onboarding README for new team members.
---
## 📌 Definition of Done
* Clean structure, consistent configurations, no duplicates.
* Modular, tested, i18n-capable components.
* Newsletter flow (frontend + backend) working.
* Compliance pages available, accessible.
* SEO/A11y/Perf ≥ 90 in Lighthouse.
* CI/CD running (preview + staging + prod).
* Documentation: hygiene, i18n, policies, SEO/Perf, CI/CD.
---
## 📅 Workflow recommendation
1. Only implement **one prompt block per sprint**.
2. After each block: **commit + push**.
3. Only move on when tests and build pass ✅.
4. Never skip documentation (README/DOCS).
---
## 👥 Roles
* **A.I.K (Aykut Aydin):** Visionary, project manager, developer.
* **EWA (Prof. Dr. Esta Willy Armstrong):** Architect, mentor, quality assurance.
* **Copilot / Cursor / Grok:** Tools that implement tactical tasks.