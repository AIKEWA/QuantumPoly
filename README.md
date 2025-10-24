# QuantumPoly - Futuristic Landing Page

A modern, cyberpunk-elegant landing page for QuantumPoly, built with Next.js 14+ and Tailwind CSS.

## Features

- 🌟 Cyberpunk-inspired design with elegant aesthetics
- 🚀 Built with Next.js 14+ using the App Router
- 🎨 Styled with Tailwind CSS for responsive design
- 🧩 Modular component architecture
- 📱 Fully responsive on all devices
- 🔍 SEO optimized

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/AIKEWA/QuantumPoly.git
cd quantumpoly
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Available scripts:

```bash
npm run lint         # Run ESLint for code quality
npm run format       # Format code with Prettier
npm run build        # Build the project for production
npm run start        # Start the production server
npm run test         # Run unit tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run budget       # Check bundle budgets (<250 KB/route)
npm run lh:perf      # Run Lighthouse performance audit (≥90)
npm run storybook    # Start Storybook development server
npm run build-storybook # Build Storybook for production
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

## Deployment

This project is optimized for deployment on Vercel:

```bash
npm run build
# or
vercel
```

## License

[MIT](LICENSE)

## Codebase Hygiene & Conventions

### Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
│   ├── ui/          # UI components (buttons, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
└── styles/          # Global styles and Tailwind config
```

### Coding Standards

- **TypeScript**: Strictly typed components and props
- **ESLint**: Configured with Next.js rules (`eslint.config.mjs`)
- **Prettier**: Code formatting (`.prettierrc.json`)
- **Tailwind CSS**: Utility-first styling
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

### File Naming

- Components: PascalCase (e.g., `Hero.tsx`)
- Files: kebab-case (e.g., `layout.tsx`)
- Folders: kebab-case

### Commit Convention

- Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Keep commits atomic and descriptive

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `npm run lint` and `npm run format`
4. Commit with descriptive message
5. Create pull request
6. Code review and merge

## Troubleshooting

### ESLint Configuration

- This project uses the modern ESLint flat config (`eslint.config.mjs`)
- If you encounter "Failed to load config" errors, ensure no legacy `.eslintrc.json` files exist in parent directories
- The config extends `next/core-web-vitals` for optimal Next.js development

### Build Issues

- Run `npm run build` to check for TypeScript and build errors
- Ensure all dependencies are installed with `npm install`
- Check that Node.js version is 16.8.0 or later

### Development Server

- Use `npm run dev` for development with hot reloading
- Server runs on `http://localhost:3000` by default
- Clear `.next` cache if you encounter persistent issues: `rm -rf .next`

## Internationalization (i18n)

QuantumPoly supports multiple languages using [next-intl](https://next-intl-docs.vercel.app/).

### Supported Languages

- **English (en)** - Default
- **German (de)** - Deutsch
- **Turkish (tr)** - Türkçe

### Using Translations in Components

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('hero');
  return <h1>{t('title')}</h1>;
}
```

### URL Structure

All routes are prefixed with the locale:

- `/en` - English
- `/de` - German
- `/tr` - Turkish

### Locale Switching

Users can switch languages using the language selector in the footer. The selection is persisted via cookies and preserves the current page context.

### Adding New Languages

See the comprehensive [I18N Guide](./docs/I18N_GUIDE.md) for detailed instructions on adding new languages, translation keys, and testing patterns.

### Translation Files

Located in `src/locales/{locale}/`:

- `hero.json` - Hero section
- `about.json` - About section
- `vision.json` - Vision section
- `newsletter.json` - Newsletter form
- `footer.json` - Footer content
- `common.json` - Shared content (metadata, language names)

## Newsletter API Integration

QuantumPoly includes a production-ready Newsletter subscription API with modular backend integration.

### Features

- ✅ Zod-based email validation
- ✅ Dual-dimensional rate limiting (email + IP)
- ✅ i18n-ready error messages (6 locales)
- ✅ Extensible adapter pattern for any storage backend
- ✅ 98%+ test coverage with CI integration

### Quick Start

1. **In-Memory Mode (Development)**

   The API works out of the box with in-memory storage for prototyping.

2. **Supabase Integration (Production)**

   a. Set up environment variables:

   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_KEY="your_service_role_key"
   ```

   b. Create the database table:

   ```sql
   CREATE TABLE newsletter_subscribers (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     subscribed_at TIMESTAMPTZ DEFAULT now()
   );
   ```

   c. Implement the adapter (see `docs/NEWSLETTER_API.md` for full code)

### API Endpoint

- **Route**: `POST /api/newsletter`
- **Request**: `{ "email": "user@example.com" }`
- **Responses**: 201 (success), 400 (invalid), 409 (duplicate), 429 (rate limit), 500 (error)

### Documentation

For complete architecture details, adapter interface specifications, and Supabase integration guide, see:

- **[Newsletter API Documentation](./docs/NEWSLETTER_API.md)**
- **[API Testing Guide](./docs/API_TESTING_GUIDE.md)**
- **[Block 4.4 Implementation Summary](./BLOCK4.4_IMPLEMENTATION_SUMMARY.md)**

## Performance Optimization

QuantumPoly enforces strict performance budgets to ensure fast load times and excellent user experience.

### Quick Reference

**Essential Commands**:

```bash
npm run build            # Build for production
npm run budget           # Check bundle budgets (<250 KB/route)
npm run lh:perf          # Run Lighthouse performance audit (≥90)
```

**Thresholds**:

- Lighthouse Performance: **≥ 90/100** (CI enforced)
- JavaScript Bundle: **< 250 KB per route** (CI enforced)
- LCP: **≤ 2.5s** | TBT: **< 300ms** | CLS: **< 0.1**

**Reports & Artifacts**:

- `reports/lighthouse/performance.json` — Full Lighthouse audit data
- CI artifacts retained for **30 days** (`.github/workflows/perf.yml`)

**Interpreting Results**:

- Perf **< 90** → Fix before merge (check LCP, bundle size, image optimization)
- Bundle **> 250 KB/route** → Apply code-splitting, remove unused deps, defer scripts

---

### Performance Targets

| Metric                             | Target         | Enforcement      |
| ---------------------------------- | -------------- | ---------------- |
| **Lighthouse Performance**         | ≥ 90/100       | CI gate          |
| **JavaScript Bundle**              | < 250 KB/route | CI gate          |
| **Largest Contentful Paint (LCP)** | ≤ 2.5s         | Lighthouse audit |
| **Total Blocking Time (TBT)**      | < 300ms        | Lighthouse audit |
| **Cumulative Layout Shift (CLS)**  | < 0.1          | Lighthouse audit |

### Optimization Strategy

**Image Optimization**

- All images use `next/image` with automatic AVIF/WebP serving
- Only the hero/LCP image uses `priority` flag for immediate loading
- All other images lazy-load by default
- Responsive `sizes` attributes for optimal resolution selection

**Font Optimization**

- Inter font loaded via `next/font/google` with automatic preloading
- `display: 'swap'` prevents Flash of Invisible Text (FOIT)
- CSS variable pattern enables consistent theming

**Code Splitting**

- Client-only interactive components dynamically imported
- FAQ and NewsletterForm use `next/dynamic` with `ssr: false`
- Loading skeletons provide visual feedback during chunk loading
- Reduces initial JavaScript payload and improves First Contentful Paint

**Script Optimization**

- JSON-LD structured data deferred with `next/script` `afterInteractive` strategy
- No blocking third-party scripts in critical render path

### Running Performance Tests Locally

**Bundle Budget Check**

```bash
npm run build
npm run budget
```

Output shows JS size per route:

```
📦 Bundle Budget Analysis
   Budget: 250 KB per route

Route                                       Total JS         Status
─────────────────────────────────────────────────────────────────────
/[locale]                                    145.23 KB      ✅ OK
/[locale]/privacy                            132.45 KB      ✅ OK
/[locale]/ethics                             128.67 KB      ✅ OK
```

**Lighthouse Performance Audit**

```bash
# Start production server
npm run build
npm run start &

# Run Lighthouse (requires Chrome)
npm run lh:perf
```

Output includes:

- Performance score (0-100)
- Core Web Vitals (LCP, TBT, CLS, FCP, SI)
- JSON report at `reports/lighthouse/performance.json`

**Custom Configuration**

```bash
# Test different URL
LH_URL=http://localhost:3000/de npm run lh:perf

# Adjust threshold
LH_THRESHOLD=85 npm run lh:perf

# Custom bundle budget
BUDGET_KB=200 npm run budget
```

### CI Performance Gate

The Performance CI workflow (`.github/workflows/perf.yml`) runs on every push/PR and:

1. Builds the production application
2. **Enforces bundle budgets** - fails if any route exceeds 250 KB JS
3. Starts preview server on port 3000
4. **Runs Lighthouse audit** - fails if performance score < 90
5. Uploads JSON report as artifact (30-day retention)

### Optimization Decisions

**Why FAQ is dynamically imported:**

- Client-only accordion with 190+ lines of interactive logic
- Below-the-fold, not needed for initial render
- Keyboard navigation and state management add ~15 KB
- No SEO impact (content is secondary to page)

**Why NewsletterForm is dynamically imported:**

- Client-only form with validation and API integration
- Below-the-fold, interactive-only component
- Form logic and error handling add ~10 KB
- Reduces main bundle for faster FCP/LCP

**Why Hero is NOT dynamically imported:**

- Above-the-fold, contains LCP element (h1 + optional image)
- Critical for First Contentful Paint
- SSR required for SEO (page title)
- Small component (~50 lines)

### Image Setup

For optimal LCP performance, add a hero image:

```bash
# Create images directory
mkdir -p public/images

# Add your hero image (1280x720 recommended)
# See public/images/README.md for specifications
```

Then use in components:

```tsx
<Hero
  title="Your Title"
  subtitle="Your Subtitle"
  heroImage={{
    src: '/images/hero.webp',
    alt: 'Abstract quantum computing visualization',
    width: 1280,
    height: 720,
    sizes: '(max-width: 768px) 100vw, 1280px',
  }}
/>
```

### Troubleshooting Performance Issues

**Bundle exceeds 250 KB:**

- Review `.next/build-manifest.json` for duplicate dependencies
- Check for large libraries imported globally
- Consider dynamic imports for heavy components
- Use bundle analyzer: `npm install @next/bundle-analyzer`

**Lighthouse score below 90:**

- Check LCP element (should load < 2.5s)
- Verify hero image uses `priority` flag
- Review network waterfall in full Lighthouse HTML report
- Test on throttled connection (slow 3G simulation)
- Ensure all images have proper `width`, `height`, `sizes`

**Large layout shift (CLS):**

- Verify all images define `width` and `height`
- Check for dynamic content insertion above-the-fold
- Use CSS `aspect-ratio` for responsive containers

## SEO & Indexing

QuantumPoly includes production-ready SEO infrastructure with automated sitemap generation, environment-aware robots.txt, and CI validation.

### Quick Reference

**Essential Commands**:

```bash
npm run seo:validate    # Validate sitemap.xml and robots.txt
npm run sitemap:check   # Validate sitemap structure and hreflang
npm run robots:check    # Validate robots.txt policy
```

**Metadata Checklist** (all pages must define):

- `<title>` and `meta[name="description"]` — Page title and description
- `<link rel="canonical">` — Canonical URL
- `og:*` tags — OpenGraph metadata (title, description, image, url, type)
- `twitter:*` tags — Twitter Card metadata (card, title, description, image)
- `hreflang` links — Alternate language versions (sitemap provides)

**Sitemap & Robots**:

- **Sitemap**: Auto-generated at `/sitemap.xml` with hreflang alternates for all locales
- **Robots.txt**: Environment-aware (production allows, staging/dev disallows)
- **CI Validation**: `.github/workflows/seo-validation.yml` checks structure and policies

**URLs**:

- Production: `https://www.quantumpoly.com/sitemap.xml`
- Local: `http://localhost:3000/sitemap.xml`

---

### Features

- ✅ **Automatic sitemap.xml** with hreflang alternates for all 6 locales
- ✅ **Environment-aware robots.txt** (allows production, blocks non-prod)
- ✅ **x-default fallback** for international SEO best practices
- ✅ **CI validation** for sitemap structure and robots policy
- ✅ **Type-safe route registry** ensures consistency across SEO, sitemap, and app

### How It Works

**Sitemap Generation** (`src/app/sitemap.ts`)

- Automatically generates entries for all public routes × all locales
- Each entry includes `<xhtml:link rel="alternate" hreflang="...">` tags
- 30 total entries (5 routes × 6 locales)
- Uses `NEXT_PUBLIC_SITE_URL` for absolute URLs

**Robots.txt** (`src/app/robots.ts`)

- **Production**: Allows all crawlers (`Allow: /`)
- **Non-production**: Blocks all crawlers (`Disallow: /`)
- Always includes sitemap reference for crawler discovery

**Route Registry** (`src/lib/routes.ts`)

- Single source of truth for all public indexable routes
- Prevents drift between sitemap, SEO metadata, and actual pages

### Adding a New Public Route

1. Create the page in `src/app/[locale]/your-route/page.tsx`
2. Add the route to `PUBLIC_ROUTES` in `src/lib/routes.ts`:
   ```ts
   export const PUBLIC_ROUTES = [
     '/',
     '/ethics',
     '/privacy',
     '/imprint',
     '/gep',
     '/your-route',
   ] as const;
   ```
3. Update the SEO type in `src/lib/seo.ts`:
   ```ts
   export type SEORoute = '/' | '/ethics' | '/privacy' | '/imprint' | '/gep' | '/your-route';
   ```
4. Add SEO metadata to all locale files: `src/locales/{locale}/seo.json`

The sitemap will automatically include the new route for all locales on next build.

### Adding a New Locale

See the comprehensive [I18N Guide](./docs/I18N_GUIDE.md) for detailed instructions. The sitemap will automatically include new locales once they're added to `src/i18n.ts`.

### Local Testing

Test sitemap and robots.txt locally:

```bash
# Build and start production server
npm run build
NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run start

# In another terminal, validate
NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run seo:validate
```

Or check individual files:

```bash
npm run sitemap:check  # Validates sitemap.xml structure and hreflang
npm run robots:check   # Validates robots.txt policy matches environment
```

### CI Validation

The SEO validation workflow (`.github/workflows/seo-validation.yml`) automatically:

- Builds the application
- Starts a production server
- Validates sitemap.xml contains:
  - All required XML elements (`<urlset>`, `<url>`, `<loc>`)
  - All 6 locale hreflang attributes (en, de, tr, es, fr, it)
  - x-default fallback
  - Absolute URLs (no relative paths)
- Validates robots.txt contains:
  - Correct environment-specific policy
  - Sitemap directive with absolute URL
- Uploads artifacts for debugging

### Sitemap Structure

Each sitemap entry includes:

```xml
<url>
  <loc>https://www.quantumpoly.com/en/privacy</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://www.quantumpoly.com/en/privacy"/>
  <xhtml:link rel="alternate" hreflang="de" href="https://www.quantumpoly.com/de/privacy"/>
  <xhtml:link rel="alternate" hreflang="tr" href="https://www.quantumpoly.com/tr/privacy"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://www.quantumpoly.com/es/privacy"/>
  <xhtml:link rel="alternate" hreflang="fr" href="https://www.quantumpoly.com/fr/privacy"/>
  <xhtml:link rel="alternate" hreflang="it" href="https://www.quantumpoly.com/it/privacy"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.quantumpoly.com/en/privacy"/>
  <lastmod>2025-10-17T12:00:00.000Z</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### URLs

- **Production**: `https://www.quantumpoly.com/sitemap.xml`
- **Production**: `https://www.quantumpoly.com/robots.txt`
- **Local**: `http://localhost:3000/sitemap.xml`
- **Local**: `http://localhost:3000/robots.txt`

## Accessibility Testing - Ethical Enforcement

**Accessibility is not a feature—it's a human right encoded in CI.**

QuantumPoly enforces WCAG 2.2 AA compliance through automated testing at four layers:

| Layer           | Tool                     | Threshold             | Purpose                                     |
| --------------- | ------------------------ | --------------------- | ------------------------------------------- |
| **Linting**     | `eslint-plugin-jsx-a11y` | Zero violations       | Prevents anti-patterns at authoring time    |
| **Unit Tests**  | `jest-axe`               | Zero violations       | Validates components with full render trees |
| **E2E Tests**   | `@axe-core/playwright`   | Zero critical/serious | Ensures real-world browser accessibility    |
| **Performance** | Lighthouse               | A11y ≥95, Perf ≥90    | Confirms inclusive experience at scale      |

### Quick Reference

**Essential Commands**:

```bash
npm run lint             # ESLint jsx-a11y checks (0 violations required)
npm run test:a11y        # Jest-axe unit tests (0 violations required)
npm run test:e2e:a11y    # Playwright axe E2E tests (0 critical/serious)
npm run lh:a11y          # Lighthouse audit (A11y ≥95, Perf ≥90)
```

**Reports & Artifacts**:

- `reports/lighthouse/accessibility.json` — Complete audit data
- `reports/lighthouse/summary.json` — Scores and top violations
- CI artifacts retained for **90 days** (`.github/workflows/a11y.yml`)

**Interpreting Results**:

- **A11y violations > 0** → Fix before merge (use WCAG violation fixes in [Accessibility Testing Guide](./docs/ACCESSIBILITY_TESTING.md))
- **Lighthouse A11y < 95** → Check color contrast, ARIA labels, keyboard navigation
- **Lighthouse Perf < 90** → See Performance Optimization section above

**CI Enforcement** (`.github/workflows/a11y.yml`):

- Blocks merge if any check fails
- Comments PR with detailed accessibility report
- Uploads evidence artifacts for audit trail

---

### Ethical Evidence Chain

All accessibility audits generate JSON artifacts stored in `reports/lighthouse/accessibility.json` that:

- Provide auditable proof of WCAG compliance
- Feed the Public Governance Dashboard (Block 6.5)
- Create timestamped accountability trail
- Enforce ethical parity with business requirements (A11y = SEO priority)

### Running Accessibility Tests

```bash
# 1. ESLint jsx-a11y checks
npm run lint

# 2. Jest-axe unit tests (Home, PolicyLayout, Footer)
npm run test:a11y

# 3. Playwright axe E2E tests
npm run build && npm run start &
npm run test:e2e:a11y

# 4. Lighthouse audit (A11y ≥95, Perf ≥90)
npm run lh:a11y
```

### Interpreting Lighthouse Reports

After running `npm run lh:a11y`, find reports at:

- **Full JSON**: `reports/lighthouse/accessibility.json` - Complete audit data
- **Summary**: `reports/lighthouse/summary.json` - Scores and top violations

Example summary:

```json
{
  "timestamp": "2025-10-17T12:00:00.000Z",
  "url": "http://localhost:3000/en",
  "scores": {
    "accessibility": 96,
    "performance": 92
  },
  "passed": true,
  "violations": []
}
```

### CI Enforcement

The Accessibility CI workflow (`.github/workflows/a11y.yml`) runs on every push/PR and:

- Blocks merge if any check fails
- Uploads Lighthouse evidence as artifacts (90-day retention)
- Comments PR with detailed accessibility report
- Enforces dual threshold: A11y ≥95 AND Perf ≥90

### Documentation

For complete testing strategy, troubleshooting, and WCAG violation fixes:

- **[Accessibility Testing Guide](./docs/ACCESSIBILITY_TESTING.md)** - Comprehensive testing documentation
- **[Accessibility as Ethical Verification](./docs/ACCESSIBILITY_TESTING.md#accessibility-as-ethical-verification)** - Philosophy and governance

## CI/CD Pipeline - Governance-First Deployment

**QuantumPoly implements a comprehensive CI/CD pipeline with separated quality verification and deployment orchestration, ensuring ethical governance at every stage.**

### Coverage Policy

QuantumPoly enforces strict test coverage thresholds to ensure code quality and reliability.

**Global Coverage Requirements:**

- Branches: ≥ 85%
- Functions: ≥ 85%
- Lines: ≥ 85%
- Statements: ≥ 85%

**Security-Critical Endpoints:**

- Newsletter API: ≥ 90% across all metrics

**Verification:**

```bash
npm run test:coverage
# Coverage summary must show all metrics above thresholds
```

**CI Enforcement:**
The test job in `.github/workflows/ci.yml` will fail if coverage falls below thresholds, blocking merge.

---

### SBOM Policy

QuantumPoly generates Software Bill of Materials (SBOM) for supply chain transparency and security compliance.

**Standard:** CycloneDX 1.4+ (JSON format)

**Generation:** Automatic via CI pipeline on every push/PR

**Artifact Location:** GitHub Actions artifacts (30-day retention)

**Verification:**

```bash
# Generate locally
npx @cyclonedx/cyclonedx-npm --output-format json --output-file sbom.json

# Validate
npx @cyclonedx/cyclonedx-cli validate --input-file sbom.json

# Inspect
jq '.bomFormat, .specVersion, .components | length' sbom.json
```

**Compliance:** Meets NTIA/CISA SBOM minimum requirements and EWA-GOV 8.2 standards.

---

### Production Environment Configuration

Production deployments require manual approval via GitHub Environments. This ensures human-in-the-loop governance for all production releases.

**Setup Required:**

- Minimum 2 required reviewers
- Deployment branch restrictions (main, refs/tags/v\*)
- Wait timer: 0 minutes (immediate prompt)

**Complete Setup Guide:** See [docs/PRODUCTION_ENVIRONMENT_SETUP.md](./docs/PRODUCTION_ENVIRONMENT_SETUP.md)

**Verification:**

```bash
gh api repos/:owner/:repo/environments/production | jq '.protection_rules[].reviewers | length'
# Expected: ≥2
```

---

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Pull Request                                                    │
│  └─> CI Quality Gates → Preview Deployment → Review             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Merge to main                                                   │
│  └─> CI Quality Gates → Staging Deployment (automatic)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Tag v*.*.* + GitHub Release                                     │
│  └─> Validation → Production Deploy (approval) → Ledger Update  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflows

#### `.github/workflows/ci.yml` - Unified Quality Gates

**Triggers:** Every push and pull request to `main`

**Jobs:**

1. **Quality** - Lint, TypeCheck, Unit Tests (Node 20.x LTS)
2. **Accessibility** - Jest-Axe, Playwright Axe, Lighthouse ≥95
3. **Performance** - Bundle budget <250KB, Lighthouse ≥90
4. **Governance** - Ethics validation, policy reviews, ledger integrity
5. **Build** - Next.js and Storybook builds
6. **E2E** - Playwright end-to-end tests

**Artifacts:**

- Coverage reports (30-day retention)
- Lighthouse evidence (90-day retention for governance)
- Playwright reports (30-day retention)
- Governance reports (90-day retention)

**Key Features:**

- All quality gates must pass before deployment
- Consolidated workflow reduces CI redundancy
- Parallel execution where possible
- Automatic PR comments with results summary

---

#### `.github/workflows/preview.yml` - Preview Deployments

**Triggers:** Pull requests to `main`

**Features:**

- Automatic preview deployment to Vercel
- Preview URL commented on PR
- Lighthouse CI audit on preview environment
- Accessibility score must be 1.0

---

#### `.github/workflows/release.yml` - Staging & Production Deployment

**Triggers:**

- Push to `main` → Staging deployment (automatic)
- Tag `v*.*.*` + GitHub Release → Production deployment (requires approval)

**Staging Deployment:**

- Automatic on merge to `main`
- Deployed to Vercel preview environment
- No approval required

**Production Deployment:**

1. **Validate Release** - Verify tag format, GitHub Release exists
2. **Deploy Production** - Requires manual approval via GitHub Environments
3. **Update Ledger** - Commit deployment metadata to governance ledger

**Two-Key Approval:** Production requires both:

- Git tag (`v1.0.0`)
- GitHub Release (legal/governance approval)
- Manual environment approval (human-in-the-loop)

---

### Required GitHub Secrets

Configure in: Repository → Settings → Secrets and variables → Actions

| Secret              | Description                      | How to Obtain                                           |
| ------------------- | -------------------------------- | ------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel deployment token          | Vercel → Settings → Tokens                              |
| `VERCEL_ORG_ID`     | Organization/team ID             | Run `vercel link` locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Project ID                       | Run `vercel link` locally, check `.vercel/project.json` |
| `GPG_PRIVATE_KEY`   | (Optional) For ledger signatures | Generate GPG key pair                                   |
| `GPG_KEY_ID`        | (Optional) GPG key identifier    | From GPG key generation                                 |

**Obtaining Vercel Credentials:**

```bash
# 1. Link project locally
npm i -g vercel
vercel link

# 2. Extract credentials
cat .vercel/project.json

# Output:
{
  "orgId": "team_xxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxx"
}

# 3. Create token at: https://vercel.com/account/tokens
# Scope: Full Account
```

---

### Environment Configuration

#### GitHub Environments

Create in: Repository → Settings → Environments

**Production Environment:**

- Name: `production`
- Protection rules:
  - ✅ Required reviewers (1+)
  - ✅ Wait timer: 0 minutes
  - ✅ Deployment branches: Only tagged versions
- Environment URL: `https://www.quantumpoly.ai`

---

### Deployment URLs

| Environment    | Branch/Trigger         | URL                             | Approval Required |
| -------------- | ---------------------- | ------------------------------- | ----------------- |
| **Preview**    | Pull Request           | `quantumpoly-pr-N-*.vercel.app` | No                |
| **Staging**    | `main` branch          | Dynamic Vercel URL              | No                |
| **Production** | Tag `v*.*.*` + Release | `https://www.quantumpoly.ai`    | Yes               |

---

### Deployment Process

#### For Preview (Pull Request)

```bash
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feat/my-feature

# 4. CI runs automatically
# 5. Preview deployment URL commented on PR
# 6. Review and merge
```

---

#### For Staging (Merge to Main)

```bash
# 1. Merge PR to main via GitHub UI
# (or via command line)
git checkout main
git merge feat/my-feature
git push origin main

# 2. CI quality gates run
# 3. Staging deployment triggers automatically
# 4. Staging URL available in workflow logs
```

---

#### For Production (Tag + Release)

```bash
# 1. Ensure main is stable and tested on staging

# 2. Create and push tag
git tag v1.0.0
git push origin v1.0.0

# 3. Create GitHub Release
# Go to: Repository → Releases → Create new release
# - Tag: v1.0.0
# - Title: v1.0.0 - Release Name
# - Description: Release notes and governance approval
# - Publish release

# 4. Workflow triggers automatically
# 5. Approve production deployment in GitHub Actions
# 6. Production deployed to www.quantumpoly.ai
# 7. Governance ledger updated automatically
```

---

### Ledger Integration

Every production deployment automatically updates the governance ledger:

**What's Recorded:**

- Deployment tag and timestamp
- Production URL
- Commit SHA
- Approver information (from GitHub environment)
- Ethical Integrity Index (EII) score at deployment time

**Location:** `governance/ledger/`

**Verification:**

```bash
npm run ethics:verify-ledger
```

**Manual Ledger Update:**

```bash
npm run ethics:ledger-update
```

---

### Design Decisions

#### Why Consolidate Quality Gates?

**Problem:** Previously, 5+ separate workflows (`a11y.yml`, `perf.yml`, `governance.yml`, etc.) each ran `npm ci`, `npm run build`, duplicating work and consuming CI minutes.

**Solution:** Single `ci.yml` with parallel jobs sharing dependencies:

- 60% reduction in CI time
- Single source of truth for quality standards
- Unified artifact generation
- Easier to maintain and extend

---

#### Why Separate `release.yml`?

**Reason 1: Security**

- CI requires only `contents: read`
- Release requires `contents: write` for ledger updates
- Principle of least privilege

**Reason 2: Governance**

- Clear separation between verification (CI) and deployment (release)
- Independent governance review before deployment
- Supports two-key approval (tag + release + human)

**Reason 3: Auditability**

- Deployment workflows are distinct from quality checks
- Ledger updates happen only on production deployment
- Traceable approval chain

---

#### Manual Approval Rationale

**Why require human approval for production?**

1. **Ethical Review Gate** - Ensures EII ≥ 90 and governance compliance reviewed by human
2. **Human-in-the-Loop** - Governance by design, not automation alone
3. **Audit Trail** - Approver documented in ledger (JSON-L record with SHA256)
4. **Risk Mitigation** - Prevents accidental production deployments
5. **Legal Compliance** - Some jurisdictions require human oversight for production changes

**Approval Process:**

1. Tag pushed → Workflow starts
2. Production deployment job waits for approval
3. GitHub notifies designated reviewers
4. Reviewer verifies:
   - All quality gates passed
   - Staging validated
   - Governance artifacts present
5. Reviewer approves in GitHub Actions UI
6. Deployment proceeds
7. Ledger records approver and timestamp

---

#### Ledger as Deployment Audit Trail

**Purpose:** Cryptographically verifiable record of all production deployments

**Why it matters:**

- Regulatory compliance (SOC 2, ISO 27001)
- Public transparency (Block 6.5 dashboard)
- Forensic analysis (incident response)
- Ethical accountability

**What's signed:**

- Deployment metadata (tag, URL, timestamp)
- Quality gate results (CI artifacts)
- Approver identity
- Git commit SHA

**Verification:**

```bash
npm run ethics:verify-ledger

# Output: Ledger integrity verified ✅
```

---

#### Security Posture

**Principles:**

- **Least Privilege** - Minimal permissions for each workflow
- **No Secret Echoing** - Secrets never logged or displayed
- **Branch Protection** - `main` requires PR and status checks
- **Token Scoping** - Vercel tokens scoped to project only
- **Environment Isolation** - Staging and production separate

**Threat Mitigations:**

- ✅ Prevents unauthorized deployments (requires secrets + approval)
- ✅ Prevents secret leakage (no echo, masked in logs)
- ✅ Prevents malicious PRs (all checks required)
- ✅ Prevents tag manipulation (protected tags)
- ✅ Audit trail for forensics (ledger + GitHub logs)

---

### Why This Design - Architecture Deep Dive

This section explains the architectural decisions behind QuantumPoly's CI/CD pipeline, comparing trade-offs and justifying choices.

#### 1. Consolidated CI vs. Separate Workflows

**Decision:** Consolidate 5 workflows → 1 unified `ci.yml` with 6 parallel jobs

| Approach                        | Pros                                             | Cons                                                |
| ------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| **Separate workflows** (before) | Isolated concerns; failure doesn't affect others | 5× `npm ci` duplication; slower; harder to maintain |
| **Consolidated** (current)      | 60% faster; shared deps; single truth source     | Larger YAML file; all jobs re-run on changes        |

**Winner:** Consolidated — Performance gain and maintainability outweigh minor complexity increase.

---

#### 2. Vercel CLI vs. vercel/action

**Decision:** Use Vercel CLI directly (not GitHub Action)

| Approach                 | Pros                                                            | Cons                                          |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------- |
| **vercel/action**        | Simpler YAML; less verbose                                      | Less control; no GPG integration; rate limits |
| **Vercel CLI** (current) | Full control; better logs; GPG-compatible; offline reproducible | Slightly more verbose; manual CLI install     |

**Winner:** Vercel CLI — Governance integration (GPG ledger signing) and debugging capabilities critical for compliance.

---

#### 3. Separate Preview Workflow

**Decision:** Keep `preview.yml` separate from `ci.yml`

| Approach               | Pros                                                                      | Cons                                                 |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Integrated**         | Single workflow file                                                      | CI requires Vercel secrets (blocks fork PRs); slower |
| **Separate** (current) | CI runs in forks without secrets; clear separation: testing vs deployment | One additional workflow file                         |

**Winner:** Separate — Security (no secrets in fork PRs) and clarity outweigh organizational complexity.

---

#### 4. Manual Approval for Production

**Decision:** Require human approval via GitHub Environment

| Approach             | Pros                                                       | Cons                                           |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| **Automatic**        | Faster deployments; no human bottleneck                    | Risk of accidental deploys; no human oversight |
| **Manual** (current) | Human-in-the-loop governance; audit trail; risk mitigation | Adds latency (requires human availability)     |

**Winner:** Manual — Risk mitigation and compliance requirements (legal oversight) outweigh deployment latency.

---

#### 5. Artifact Retention Strategy

**Decision:** Tiered retention (7/30/90 days)

| Artifact Type   | Retention | Rationale                                            |
| --------------- | --------- | ---------------------------------------------------- |
| Build outputs   | 7 days    | Short-term debugging; not needed long-term           |
| Test/coverage   | 30 days   | Operational debugging; trending analysis             |
| Governance/a11y | 90 days   | Compliance audits (SOC 2, ISO 27001); legal evidence |

**Cost-Benefit:** Balances GitHub storage costs with compliance requirements. 90-day governance retention meets most audit windows.

---

#### 6. Concurrency Control Strategy

**Decision:** `cancel-in-progress: true` (CI) / `false` (Release)

| Workflow        | Strategy               | Rationale                                        |
| --------------- | ---------------------- | ------------------------------------------------ |
| **ci.yml**      | Cancel superseded runs | Saves CI minutes; faster feedback on latest code |
| **release.yml** | Never cancel           | Deployment integrity; prevent partial deploys    |

**Trade-off:** CI speed vs deployment safety — appropriate strategy per workflow.

---

#### 7. Node Version Choice

**Decision:** Node 20.x LTS (not 18.x or 22.x)

| Version       | Status                          | QuantumPoly Choice                         |
| ------------- | ------------------------------- | ------------------------------------------ |
| Node 18.x     | Active LTS until 2025-04-30     | ❌ EOL approaching                         |
| **Node 20.x** | **Active LTS until 2026-04-30** | ✅ **Current choice**                      |
| Node 22.x     | Active LTS until 2027-04-30     | ⚠️ Too new; ecosystem not fully compatible |

**Rationale:** Node 20.x provides 18-month support window, broad ecosystem compatibility, and Next.js 14.x full support.

---

#### 8. Permissions Model

**Decision:** Least-privilege per workflow

| Workflow        | Permissions                              | Justification                                      |
| --------------- | ---------------------------------------- | -------------------------------------------------- |
| **ci.yml**      | `contents: read`, `pull-requests: write` | Only reads code; comments on PRs; no repo writes   |
| **release.yml** | `contents: write`, `deployments: write`  | Requires writes for ledger commits; deployment API |

**Security:** Minimizes attack surface. Compromised CI workflow cannot push malicious code; only Release workflow (with approval) can modify repo.

---

#### 9. GPG Signing (Optional)

**Decision:** Optional GPG signatures for ledger entries

| Use Case                                   | GPG Required?  | Rationale                          |
| ------------------------------------------ | -------------- | ---------------------------------- |
| Regulated industries (healthcare, finance) | ✅ Yes         | Cryptographic audit trail mandated |
| Enterprise SOC 2 / ISO 27001               | ✅ Recommended | Audit authenticity verification    |
| Early-stage startup / internal tools       | ❌ Optional    | Cost-benefit may not justify setup |

**Implementation:** See [`docs/CICD_GPG_LEDGER_INTEGRATION.md`](docs/CICD_GPG_LEDGER_INTEGRATION.md) for setup guide.

---

#### 10. Two-Key Approval System

**Decision:** Tag + Release + Human approval (not just one gate)

| Gate                     | Purpose         | Prevents                        |
| ------------------------ | --------------- | ------------------------------- |
| **Git tag** (`v1.0.0`)   | Technical gate  | Malformed versions              |
| **GitHub Release**       | Governance gate | Undocumented deployments        |
| **Environment approval** | Human gate      | Accidental/unauthorized deploys |

**Rationale:** Separation of duties. No single person can accidentally deploy to production. Supports compliance requirements for oversight.

---

### Design Principles Summary

| Principle                     | Implementation                          | Benefit                        |
| ----------------------------- | --------------------------------------- | ------------------------------ |
| **Fail Fast**                 | Block merge on any quality gate failure | Prevents broken code in main   |
| **Least Privilege**           | Minimal permissions per workflow        | Reduces attack surface         |
| **Separation of Concerns**    | CI (verify) vs Release (deploy)         | Clear audit trail              |
| **Human-in-the-Loop**         | Manual production approval              | Governance accountability      |
| **Transparency**              | Public ledger, 90-day artifacts         | Audit compliance, public trust |
| **Automation with Oversight** | Automate gates, require human decision  | Balance speed and safety       |

---

### Related Documentation

For deeper dives into specific topics:

- **[CI/CD Prompt Compliance Matrix](docs/CICD_PROMPT_COMPLIANCE_MATRIX.md)** - Requirements mapping and validation
- **[CI/CD Validation Scenarios](docs/CICD_VALIDATION_SCENARIOS.md)** - Test scenarios with expected results
- **[CI/CD Testing Guide](docs/CICD_TESTING_GUIDE.md)** - Step-by-step testing procedures
- **[CI/CD GPG Ledger Integration](docs/CICD_GPG_LEDGER_INTEGRATION.md)** - Cryptographic signature setup
- **[CICD Review Checklist](../.github/CICD_REVIEW_CHECKLIST.md)** - Pre-deployment validation
- **[DNS Configuration](docs/DNS_CONFIGURATION.md)** - Production domain setup
- **[BLOCK7 Implementation Summary](BLOCK7_CICD_IMPLEMENTATION_SUMMARY.md)** - Complete architecture overview

---

### Troubleshooting

#### CI Failing on Quality Gates

**Lint Errors:**

```bash
npm run lint
# Fix errors, commit, push
```

**Type Errors:**

```bash
npm run typecheck
# Fix TypeScript errors, commit, push
```

**Test Failures:**

```bash
npm run test
# Fix failing tests, commit, push
```

**Accessibility Violations:**

```bash
npm run test:a11y
# See: docs/ACCESSIBILITY_TESTING.md for fixes
```

**Performance Budget Exceeded:**

```bash
npm run build
npm run budget
# Review: .next/build-manifest.json
# Apply code splitting, remove unused deps
```

---

#### Staging Deployment Failing

**Symptoms:** `deploy-staging` job fails

**Common causes:**

1. **Invalid Vercel credentials**
   - Verify secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - Regenerate token if expired

2. **Build errors**
   - Check build logs in workflow
   - Run `npm run build` locally
   - Verify environment variables in Vercel

3. **Vercel project not linked**
   - Run `vercel link` locally
   - Update project ID in secrets

---

#### Production Deployment Not Triggering

**Checklist:**

- [ ] Tag format is `v*.*.*` (e.g., `v1.0.0`)
- [ ] GitHub Release created for tag
- [ ] Tag pushed to GitHub: `git push origin v1.0.0`
- [ ] Workflow file exists: `.github/workflows/release.yml`

**Manual trigger (if needed):**

```bash
gh workflow run release.yml
```

---

#### Approval Not Showing

**Problem:** Production deployment job doesn't prompt for approval

**Solutions:**

1. Create `production` environment in Repository → Settings → Environments
2. Add required reviewers in environment protection rules
3. Ensure workflow specifies: `environment: production`

---

#### Ledger Update Failing

**Symptoms:** `update-ledger` job fails with commit errors

**Common causes:**

1. **Insufficient permissions**
   - Verify workflow has `contents: write` permission

2. **No changes to commit**
   - Check ledger update script: `npm run ethics:ledger-update`
   - Verify governance reports generated

3. **Git configuration issues**
   - Workflow automatically configures git user
   - Check for branch protection preventing bot commits

**Manual ledger update:**

```bash
npm run ethics:ledger-update
git add governance/ledger/
git commit -m "chore: update governance ledger [skip ci]"
git push
```

---

### DNS Configuration

For complete DNS setup instructions (production domain, staging subdomain, SSL/TLS, verification):

**See: [docs/DNS_CONFIGURATION.md](./docs/DNS_CONFIGURATION.md)**

Quick reference:

- **Production:** `www.quantumpoly.ai` (CNAME → cname.vercel-dns.com)
- **Staging:** Dynamic Vercel URL or custom `staging.quantumpoly.ai`
- **SSL/TLS:** Automatic via Let's Encrypt (Vercel)
- **Verification:** `dig www.quantumpoly.ai`, `curl -I https://www.quantumpoly.ai`

---

### Review Checklist

Before merging or deploying, ensure:

**See: [.github/CICD_REVIEW_CHECKLIST.md](./.github/CICD_REVIEW_CHECKLIST.md)**

Quick checklist:

- [ ] All CI quality gates passing
- [ ] Preview deployment verified
- [ ] Accessibility score ≥ 95
- [ ] Performance score ≥ 90
- [ ] Bundle budget < 250KB
- [ ] Governance validation passed
- [ ] Staging deployed and tested (for production)
- [ ] Tag and release created (for production)
- [ ] Approval granted (for production)

---

### Additional Resources

- **[DNS Configuration](./docs/DNS_CONFIGURATION.md)** - Complete DNS setup guide
- **[CI/CD Review Checklist](./.github/CICD_REVIEW_CHECKLIST.md)** - Pre-deployment validation
- **[Accessibility Testing](./docs/ACCESSIBILITY_TESTING.md)** - A11y testing guide
- **[Governance Documentation](./docs/governance/)** - Ethical governance framework

---

## Project Structure Details

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
│   ├── ui/          # UI components (buttons, etc.) - reserved
├── hooks/           # Custom React hooks - reserved
├── lib/             # Utility functions - reserved
├── locales/         # Translation files - prepared for i18n
└── styles/          # Global styles and Tailwind config
```

## Components: i18n, A11y, Theming & Testing

All QuantumPoly UI components are:

- ✅ Prop-driven (i18n-ready) — no hardcoded text
- ♿ Accessible — semantic HTML, ARIA where needed, visible focus
- 🎨 Themeable — Tailwind light/dark, AA contrast
- 🧪 Tested — Jest + Testing Library
- 📖 Documented — Storybook (default + dark) with controls

### Usage Example

```tsx
import { Hero } from '@/components/Hero';

<Hero
  title="Welcome"
  subtitle="QuantumPoly is leading the future"
  ctaLabel="Learn more"
  heroImage={{
    src: '/images/hero.webp',
    alt: 'QuantumPoly visualization',
    width: 1280,
    height: 720,
    sizes: '(max-width: 768px) 100vw, 1280px',
  }}
/>;
```

### Props Overview

- **Hero**: `title`, `subtitle?`, `ctaLabel?`, `onCtaClick?`, `headingLevel?`, `heroImage?`, `className?`
- **About**: `title`, `body: ReactNode`, `headingLevel?`, `className?`
- **Vision**: `title`, `pillars: { title: string; description: string; icon?: ReactNode }[]`, `headingLevel?`, `className?`, `iconRenderer?`
- **NewsletterForm**: `title`, `description?`, `emailLabel`, `emailPlaceholder`, `submitLabel`, `successMessage`, `errorMessage`, `className?`, `onSubscribe?`, `validationRegex?`
- **Footer**: `brand`, `tagline?`, `copyright`, `socialLinks?: { label: string; href: string }[]`, `headingLevel?`, `className?`, `socialSlot?`

### Commands

- Tests: `npm run test`
- Storybook: `npm run storybook`

### Accessibility Features

All components include:

- **Semantic HTML** — proper heading hierarchy, landmark elements
- **ARIA Support** — labels, describedby relationships, live regions
- **Keyboard Navigation** — focusable elements, visible focus indicators
- **Screen Reader Support** — proper announcements, hidden decorative elements
- **External Link Security** — `rel="noopener noreferrer"` on external links

## Enterprise-Level Accessibility Design Decisions

### Live Region Pattern: `role="status"` vs `role="alert"`

**Design Decision**: Non-critical form feedback (validation errors, success messages) uses `role="status"` with `aria-live="polite"` by design. This is WCAG-compliant and intentional.

**Rationale**:

- `role="status"` with `aria-live="polite"` provides non-intrusive announcements
- Users maintain their current reading context while receiving feedback
- Keyboard flow remains unchanged (no focus trapping)
- `role="alert"` is reserved for truly critical errors requiring immediate attention

**When to Use `role="alert"`**:

- Security failures (authentication errors, permission denied)
- System failures (server unreachable, payment processing failure)
- Data loss warnings (unsaved changes, destructive actions)

### Heading Hierarchy & Landmark Strategy

**Single H1 Policy**: Each page maintains exactly one `<h1>` element (typically in Hero component) with all other sections using `<h2>` and properly nested `<h3>` elements.

**Landmark Labeling**: All major sections use `role="region"` with `aria-labelledby` pointing to their heading elements for proper screen reader navigation.

**Footer Semantics**: Footer uses `role="contentinfo"` for proper document structure and landmark navigation.

### Testing Coverage for Accessibility

- **Integration Tests**: Validate single H1 per page and proper landmark labeling
- **Component Tests**: Assert `aria-invalid`, `aria-describedby`, and live region behavior
- **Screen Reader Flow**: Test proper announcement patterns and navigation structure

### Testing Strategy

- **Unit Tests** — behavior testing via roles, labels, text (no snapshots)
- **Accessibility Testing** — proper ARIA attributes, keyboard navigation
- **Form Validation** — error states, success feedback, async handling
- **Component Variants** — multiple heading levels, with/without optional props

### Storybook Documentation

Each component includes:

- **Default Story** — realistic usage example
- **Dark Variant** — dark theme demonstration
- **Multiple Variants** — different configurations and use cases
- **Controls** — interactive prop editing
- **Documentation** — usage notes and accessibility guidelines

## Storybook—How we write stories

Our Storybook follows Component Story Format 3 (CSF3) with TypeScript integration and accessibility-first design. All stories must include proper accessibility testing and realistic usage examples.

### Story Template

```typescript
// Example.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    a11y: { disable: false },
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Visual variant of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

export const WithInteraction: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test accessibility and interactions
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    await expect(button).toHaveFocus();
  },
};
```

### Required Story Types

- **Default**: Most common usage scenario
- **All Variants**: Cover all prop combinations
- **Interactive States**: Hover, focus, active with play functions
- **Error/Edge Cases**: Error states, loading states, disabled states
- **Accessibility Examples**: Screen reader scenarios, keyboard navigation

### Guidelines Document

For complete guidelines, see [Storybook Hygiene Guidelines](./docs/STORYBOOK_HYGIENE_GUIDELINES.md).

<!-- PROPS:START -->

## Component Props

### Hero

| Prop           | Type         | Default | Required | Description                                                                  |
| -------------- | ------------ | ------- | -------- | ---------------------------------------------------------------------------- |
| `title`        | `string`     | —       | Yes      | Main heading text                                                            |
| `subtitle`     | `string`     | —       | No       | Optional subtitle displayed below the title                                  |
| `ctaLabel`     | `string`     | —       | No       | Label for the call-to-action button                                          |
| `onCtaClick`   | `() => void` | —       | No       | Click handler for the CTA button                                             |
| `headingLevel` | `enum`       | `2`     | No       | Provide a custom HTML heading level (1-6). Defaults to 2.                    |
| `media`        | `ReactNode`  | —       | No       | Optional background or immersive media element rendered beneath text         |
| `heroImage`    | `HeroImage`  | —       | No       | Optional optimized hero background image (LCP candidate with priority flag)  |
| `className`    | `string`     | —       | No       | Additional Tailwind or CSS classes to apply to the component's root element. |

### About

| Prop           | Type        | Default | Required | Description |
| -------------- | ----------- | ------- | -------- | ----------- |
| `title`        | `string`    | —       | Yes      | —           |
| `body`         | `ReactNode` | —       | Yes      | —           |
| `headingLevel` | `enum`      | `2`     | No       | —           |
| `className`    | `string`    | —       | No       | —           |

### Vision

| Prop           | Type                                            | Default | Required | Description                            |
| -------------- | ----------------------------------------------- | ------- | -------- | -------------------------------------- |
| `title`        | `string`                                        | —       | Yes      | —                                      |
| `pillars`      | `Pillar[]`                                      | —       | Yes      | —                                      |
| `headingLevel` | `enum`                                          | `2`     | No       | —                                      |
| `className`    | `string`                                        | —       | No       | —                                      |
| `iconRenderer` | `(icon: ReactNode, title: string) => ReactNode` | —       | No       | Optional custom icon renderer function |

### Footer

| Prop           | Type           | Default | Required | Description                                         |
| -------------- | -------------- | ------- | -------- | --------------------------------------------------- |
| `brand`        | `string`       | —       | Yes      | Brand or site title                                 |
| `tagline`      | `string`       | —       | No       | Optional tagline displayed beneath the brand        |
| `copyright`    | `string`       | —       | Yes      | Copyright notice (already localised)                |
| `socialLinks`  | `SocialLink[]` | —       | No       | Optional array of social links                      |
| `headingLevel` | `enum`         | `2`     | No       | Heading level for the brand element (defaults to 2) |
| `className`    | `string`       | —       | No       | Tailwind utility class extension                    |
| `socialSlot`   | `ReactNode`    | —       | No       | Slot to completely override the social links layout |

### NewsletterForm

| Prop               | Type                               | Default | Required | Description                                                                           |
| ------------------ | ---------------------------------- | ------- | -------- | ------------------------------------------------------------------------------------- |
| `title`            | `string`                           | —       | Yes      | Heading text displayed above the form                                                 |
| `description`      | `string`                           | —       | No       | Optional description displayed under the title                                        |
| `emailLabel`       | `string`                           | —       | Yes      | Label text for the email input                                                        |
| `emailPlaceholder` | `string`                           | —       | Yes      | Placeholder for the email input                                                       |
| `submitLabel`      | `string`                           | —       | Yes      | Label for the submit button                                                           |
| `successMessage`   | `string`                           | —       | Yes      | Message announced on successful subscription                                          |
| `errorMessage`     | `string`                           | —       | Yes      | Message announced when submission fails                                               |
| `onSubscribe`      | `(email: string) => Promise<void>` | —       | No       | Optional external submit handler. Receives the email string and should resolve/reject |
| `className`        | `string`                           | —       | No       | Extra className for root section                                                      |
| `validationRegex`  | `RegExp`                           | —       | No       | Optional custom email validation regex pattern                                        |

<!-- PROPS:END -->
