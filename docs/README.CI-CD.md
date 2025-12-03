<!-- FILE: README.CI-CD.md -->

# CI/CD Pipeline Documentation

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Audience:** Maintainers, DevOps Engineers, SREs, Contributors

---

## Purpose & Scope

This document provides a comprehensive overview of the QuantumPoly CI/CD pipeline architecture. The pipeline enforces quality gates, governance compliance, and ethical accountability across all deployment stages from pull request to production.

**Key Principles:**

- **Separation of Concerns:** Quality verification (CI) is separate from deployment orchestration (Release)
- **Least Privilege:** Minimal permissions per workflow
- **Human-in-the-Loop:** Manual approval required for production deployments
- **Audit Trail:** All deployments recorded in cryptographically verifiable governance ledger

---

## CI/CD Pipeline Architecture (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QUANTUMPOLY CI/CD PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Developer   │
│  Commits     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Feature Branch  │
│  Push / PR Open  │
└──────┬───────────┘
       │
       ├─────────────────────────────────────────────────────────────┐
       │                                                             │
       ▼                                                             ▼
┌─────────────────────────────────────────────────────┐   ┌──────────────────┐
│          CI WORKFLOW (.github/workflows/ci.yml)     │   │  Preview Deploy  │
│  ┌──────────────────────────────────────────────┐   │   │  (preview.yml)   │
│  │  QUALITY GATES (Parallel Execution)          │   │   │                  │
│  │                                              │   │   │  • Vercel CLI    │
│  │  1. Environment Detection                   │   │   │  • Preview URL   │
│  │     • Package manager (npm/yarn/pnpm)       │   │   │  • Lighthouse CI │
│  │     • Test framework (Jest/Vitest)          │   │   └────────┬─────────┘
│  │     • Node version audit                    │   │            │
│  │                                              │   │            ▼
│  │  2. Lint                                     │   │   ┌─────────────────┐
│  │     ✓ ESLint (--max-warnings=0)             │   │   │  PR Comment     │
│  │     ✓ jsx-a11y rules                        │   │   │  with Preview   │
│  │     ✓ Node 18.x, 20.x matrix                │   │   │  URL & Gates    │
│  │                                              │   │   └─────────────────┘
│  │  3. Type Check                               │   │
│  │     ✓ TypeScript strict mode                │   │
│  │     ✓ Node 18.x, 20.x matrix                │   │
│  │                                              │   │
│  │  4. Test & Coverage                          │   │
│  │     ✓ Jest unit tests                       │   │
│  │     ✓ Coverage ≥ 80% (global)               │   │
│  │     ✓ Coverage ≥ 90% (API endpoints)        │   │
│  │     ✓ JUnit XML reports                     │   │
│  │     ✓ Coverage merged across matrix         │   │
│  │                                              │   │
│  │  5. Accessibility (a11y)                     │   │
│  │     ✓ Playwright + @axe-core/playwright     │   │
│  │     ✓ WCAG 2.1 Level AA compliance          │   │
│  │     ✓ Automated violation detection         │   │
│  │     • Runs on: PRs, main pushes, manual     │   │
│  │                                              │   │
│  │  ARTIFACTS (90-day retention):               │   │
│  │     • Coverage reports (lcov.info, JSON)    │   │
│  │     • Playwright a11y reports               │   │
│  │     • JUnit test results                    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
       │
       │  ALL GATES PASS ✓
       │
       ▼
┌──────────────────┐
│  Merge to Main   │
└──────┬───────────┘
       │
       ├───────────────────────────────────────┐
       │                                       │
       ▼                                       ▼
┌─────────────────────────┐       ┌─────────────────────────────────┐
│  CI Re-runs on Main     │       │  STAGING DEPLOYMENT             │
│  (Same Quality Gates)   │       │  (release.yml: deploy-staging)  │
└─────────────────────────┘       │                                 │
                                  │  • Automatic trigger            │
                                  │  • Vercel preview environment   │
                                  │  • QA validation URL            │
                                  │  • 7-day artifact retention     │
                                  └─────────────────────────────────┘
                                              │
                                              │  Manual QA Validation
                                              │
                                              ▼
                                  ┌─────────────────────────────────┐
                                  │  Create Git Tag v*.*.* +        │
                                  │  GitHub Release                 │
                                  └──────────┬──────────────────────┘
                                             │
                                             ▼
                      ┌─────────────────────────────────────────────────┐
                      │  PRODUCTION DEPLOYMENT WORKFLOW                 │
                      │  (release.yml: production path)                 │
                      │                                                 │
                      │  ┌──────────────────────────────────────────┐   │
                      │  │  1. validate-release                     │   │
                      │  │     • Verify tag format (v*.*.*) ✓       │   │
                      │  │     • Verify GitHub Release exists ✓     │   │
                      │  │     • Extract release notes              │   │
                      │  └──────────────────────────────────────────┘   │
                      │              ▼                                  │
                      │  ┌──────────────────────────────────────────┐   │
                      │  │  2. deploy-production                    │   │
                      │  │     ⏸  MANUAL APPROVAL REQUIRED          │   │
                      │  │     (GitHub Environment: production)     │   │
                      │  │                                          │   │
                      │  │     After approval:                      │   │
                      │  │     • Vercel build --prod                │   │
                      │  │     • Vercel deploy --prod               │   │
                      │  │     • Alias → www.quantumpoly.ai         │   │
                      │  │     • Create GitHub deployment record    │   │
                      │  │     • 90-day artifact retention          │   │
                      │  └──────────────────────────────────────────┘   │
                      │              ▼                                  │
                      │  ┌──────────────────────────────────────────┐   │
                      │  │  3. update-ledger                        │   │
                      │  │     • Run ethics:ledger-update           │   │
                      │  │     • Commit ledger entry (w/ metadata)  │   │
                      │  │     • Create signature tag (v*-ledger)   │   │
                      │  │     • Optional: GPG signature            │   │
                      │  └──────────────────────────────────────────┘   │
                      │              ▼                                  │
                      │  ┌──────────────────────────────────────────┐   │
                      │  │  4. notify-release                       │   │
                      │  │     • Comment on GitHub Release          │   │
                      │  │     • Post-deployment checklist          │   │
                      │  └──────────────────────────────────────────┘   │
                      └─────────────────────────────────────────────────┘
                                             │
                                             ▼
                                  ┌─────────────────────────────────┐
                                  │  PRODUCTION LIVE                │
                                  │  https://www.quantumpoly.ai     │
                                  │                                 │
                                  │  Governance Ledger Updated      │
                                  │  governance/ledger/ledger.jsonl │
                                  └─────────────────────────────────┘
```

---

## Pipeline Stages & Triggers

### 1. Pull Request Stage

**Trigger:** Pull request opened or updated against `main` or `develop` branches

**Workflows:**

- `.github/workflows/ci.yml` – Quality verification
- `.github/workflows/preview.yml` – Preview deployment

**Execution:**

- All quality gates run in parallel (6 jobs)
- Preview deployment creates unique Vercel URL
- Lighthouse CI validates preview
- PR receives comment with preview URL and quality gate status

**Approval Requirement:** None (automated)

**Artifacts:** Coverage reports, test results, Playwright reports (30-day retention)

---

### 2. Main Branch Stage (Staging)

**Trigger:** Pull request merged to `main`

**Workflows:**

- `.github/workflows/ci.yml` – Quality verification (re-run)
- `.github/workflows/release.yml` (deploy-staging job)

**Execution:**

- CI quality gates re-run on main branch
- Automatic deployment to Vercel staging environment
- Staging URL provided for QA validation

**Approval Requirement:** None (automated)

**Artifacts:** Staging deployment artifacts (7-day retention)

**Staging URL Format:** `https://quantumpoly-[hash].vercel.app`

---

### 3. Production Release Stage

**Trigger:** Git tag `v*.*.*` pushed AND GitHub Release published

**Workflows:**

- `.github/workflows/release.yml` (production path: 4 jobs)

**Execution:**

1. **validate-release:** Verify tag format and GitHub Release
2. **deploy-production:** Wait for manual approval → Deploy to Vercel production
3. **update-ledger:** Record deployment in governance ledger
4. **notify-release:** Comment on release with post-deployment checklist

**Approval Requirement:** ✅ **MANUAL APPROVAL REQUIRED**

- Configured in GitHub Environment: `production`
- Required reviewers must approve before deployment proceeds

**Artifacts:** Production deployment artifacts, ledger entries (90-day retention)

**Production URL:** `https://www.quantumpoly.ai`

---

## Quality Gates (Enforcement Criteria)

### Gate 1: Lint

**Tool:** ESLint (Next.js config + jsx-a11y + tailwindcss plugins)

**Criteria:**

- Zero warnings (`--max-warnings=0`)
- No accessibility violations in JSX
- Tailwind color utility compliance

**Local Execution:**

```bash
npm run lint
# or with auto-fix
npm run lint -- --fix
```

**Failure Impact:** PR blocked from merge

---

### Gate 2: Type Check

**Tool:** TypeScript compiler (tsc)

**Criteria:**

- No type errors in strict mode
- All imports resolve correctly
- Type definitions consistent

**Local Execution:**

```bash
npm run typecheck
# or for continuous checking
npm run typecheck -- --watch
```

**Failure Impact:** PR blocked from merge

---

### Gate 3: Test & Coverage

**Tool:** Jest (Next.js integration)

**Criteria:**

- All tests pass
- Global coverage thresholds:
  - Branches: ≥ 80%
  - Functions: ≥ 85%
  - Lines: ≥ 85%
  - Statements: ≥ 82%
- API endpoint coverage:
  - All metrics ≥ 90% for `src/app/api/newsletter/route.ts`

**Local Execution:**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- Hero.test.tsx

# Run in watch mode
npm run test:watch
```

**Coverage Report Location:** `coverage/lcov-report/index.html`

**Failure Impact:** PR blocked from merge

---

### Gate 4: Accessibility (a11y)

**Tools:**

- Playwright with `@axe-core/playwright`
- Jest with `jest-axe` (component-level)

**Criteria:**

- Zero WCAG 2.1 Level AA violations
- Automated axe-core scans pass
- Manual accessibility checks documented

**Local Execution:**

```bash
# End-to-end accessibility tests
npm run test:e2e:a11y

# Component-level accessibility tests
npm run test:a11y

# Lighthouse accessibility audit
npm run lh:a11y
```

**Conditional Execution:**

- Always runs on PRs
- Always runs on main branch pushes
- Can be manually triggered via workflow_dispatch

**Failure Impact:** PR blocked from merge

**Artifacts:** Playwright HTML report with violation details

---

### Gate 5: Merge Coverage Reports

**Tool:** Custom script (`.github/scripts/merge-coverage.js`)

**Purpose:** Aggregate coverage from Node 18.x and 20.x matrix runs

**Execution:** Automatic after test job completes

**Artifacts:** `coverage-summary.json`

---

### Gate 6: Conditional Security Scanning (Placeholder)

**Status:** Commented out in workflow (ADR-007)

**Future Tools:**

- CodeQL (JavaScript/TypeScript analysis)
- Snyk (dependency vulnerability scanning)

**Activation:** Uncomment in `.github/workflows/ci.yml` when approved

---

## Manual Approval Rationale

### Why Manual Approval for Production?

**1. Risk-Based Governance**

- Production deployment impacts public-facing website
- Changes affect user experience and brand reputation
- Regulatory compliance requires human oversight (EU AI Act, ISO 42001)

**2. Two-Key Approval System**
Production deployment requires three distinct approvals:

- **Technical Gate:** Git tag with semantic version (`v*.*.*`) ← Developer action
- **Governance Gate:** GitHub Release publication ← Governance approval
- **Human Gate:** Manual approval in GitHub Environment ← Designated reviewer

**3. Change Categories & Approval Matrix**

| Change Type   | Description                                     | Approval Required                               | Example                           |
| ------------- | ----------------------------------------------- | ----------------------------------------------- | --------------------------------- |
| **Standard**  | Regular feature releases, planned updates       | 1 reviewer + GitHub Release                     | New blog post, UI enhancement     |
| **Normal**    | Bug fixes, minor improvements                   | 1 reviewer + GitHub Release                     | Fix broken link, update copy      |
| **Emergency** | Critical security patches, production incidents | 1 reviewer (expedited) + post-hoc documentation | XSS vulnerability fix, API outage |

**4. Reviewer Roles**

- **DevOps Lead:** Infrastructure changes, CI/CD modifications
- **Product Owner:** Feature releases, UX changes
- **Compliance Officer:** Legal/governance-sensitive deployments

**Configuration Location:** Repository → Settings → Environments → `production`

---

## Local Development & Parity

### Running CI Jobs Locally

To simulate CI execution before pushing:

```bash
# Full CI quality suite (recommended before PR)
npm run ci:quality
# Equivalent to: npm run lint && npm run typecheck && npm run test

# Build validation
npm run ci:build
# Equivalent to: npm run build && npm run budget

# Governance validation
npm run ci:validate
# Equivalent to: npm run validate:translations && npm run validate:locales && npm run validate:policy-reviews
```

---

### Running Individual Quality Gates

**Lint:**

```bash
npm run lint
npm run lint:strict  # Includes Tailwind color check
```

**Type Check:**

```bash
npm run typecheck
```

**Unit Tests:**

```bash
npm test                    # All tests
npm run test:coverage       # With coverage report
npm run test:watch          # Watch mode
npm run test:integration    # Integration tests only
npm run test:api            # API tests only
```

**Accessibility Tests:**

```bash
# Playwright end-to-end accessibility
npm run test:e2e:a11y

# Component-level accessibility
npm run test:a11y

# Lighthouse accessibility score
npm run lh:a11y
```

**Internationalization (i18n):**

```bash
npm run validate:translations   # Check translation completeness
npm run validate:locales        # Validate locale files
npm run test:i18n-keys          # Test i18n key consistency
npm run test:e2e:i18n           # E2E tests for i18n
```

**Performance & SEO:**

```bash
npm run lh:perf        # Lighthouse performance
npm run budget         # Bundle size budget check
npm run seo:validate   # Sitemap + robots.txt validation
```

**Governance & Ethics:**

```bash
npm run ethics:aggregate        # Collect metrics
npm run ethics:validate         # Validate data
npm run ethics:verify-ledger    # Verify ledger integrity
npm run validate:policy-reviews # Policy content validation
```

---

### Simulating Vercel Deployment Locally

```bash
# Install Vercel CLI
npm i -g vercel@latest

# Link to Vercel project (first time only)
vercel link

# Pull environment variables
vercel env pull .env.local

# Run development server
vercel dev
# or
npm run dev

# Build production bundle
vercel build

# Test production build locally
npm run build
npm run start
```

**Note:** Local builds may differ slightly from Vercel due to environment-specific optimizations. Always validate on preview deployments.

---

## Artifacts & Observability

### Artifact Retention Policies

| Artifact Type        | Retention Period | Storage Location                 | Purpose                 |
| -------------------- | ---------------- | -------------------------------- | ----------------------- |
| Coverage reports     | 30 days          | GitHub Actions artifacts         | Code quality metrics    |
| Lighthouse evidence  | 90 days          | GitHub Actions artifacts         | Governance compliance   |
| Playwright reports   | 30 days          | GitHub Actions artifacts         | E2E test results        |
| JUnit test results   | 30 days          | `reports/junit.xml`              | Test result aggregation |
| Governance reports   | 90 days          | GitHub Actions artifacts         | Ethical audit trail     |
| Build outputs        | 7 days           | GitHub Actions artifacts         | Staging validation      |
| Production artifacts | 90 days          | GitHub Actions artifacts         | Production audit trail  |
| Governance ledger    | Permanent        | `governance/ledger/ledger.jsonl` | Immutable audit log     |

---

### Accessing Artifacts

**Via GitHub Actions UI:**

1. Navigate to repository → Actions tab
2. Select workflow run
3. Scroll to "Artifacts" section at bottom
4. Download artifact ZIP file

**Via GitHub CLI:**

```bash
# List artifacts for a workflow run
gh run view [RUN_ID] --log

# Download artifact
gh run download [RUN_ID] -n [ARTIFACT_NAME]
```

---

### Observability & Monitoring

**GitHub Actions Dashboard:**

- Repository → Actions → All workflows
- Filter by workflow, branch, or status
- View logs, artifacts, and summaries

**Workflow Run Summaries:**
Each workflow generates a markdown summary visible in the Actions UI:

- Quality gate results
- Coverage percentages
- Deployment URLs
- Governance metrics (EII score)

**Vercel Deployment Dashboard:**

- https://vercel.com/[org]/[project]/deployments
- Preview, staging, and production deployment history
- Deployment logs and build analytics

**Governance Ledger Dashboard:**

- Application route: `/dashboard/ledger` (when deployed)
- View all ledger entries with cryptographic verification
- Export ledger data (JSON, JSONL)

---

## Workflow Concurrency & Cancellation

### CI Workflow (`ci.yml`)

- **Concurrency Group:** `${{ github.workflow }}-${{ github.ref }}`
- **Cancel in Progress:** `true`
- **Rationale:** New commits to PR invalidate previous CI runs; cancel outdated runs to save CI minutes

### Release Workflow (`release.yml`)

- **Concurrency Group:** `release-${{ github.ref }}`
- **Cancel in Progress:** `false`
- **Rationale:** Never cancel in-flight deployments to prevent incomplete state

---

## Permissions & Security

### CI Workflow Permissions

```yaml
permissions:
  contents: read # Read repository code
  pull-requests: write # Comment on PRs
```

**Principle:** Least privilege – no write access to repository

---

### Release Workflow Permissions

```yaml
permissions:
  contents: write # Required for ledger commits
  deployments: write # Required for GitHub deployment API
  pull-requests: write # Optional: comment deployment status
```

**Principle:** Elevated permissions only for deployment workflows

---

### Secret Management

All secrets stored in GitHub repository settings:

- Repository → Settings → Secrets and variables → Actions

**Required Secrets:**

- `VERCEL_TOKEN` – Vercel deployment token
- `VERCEL_ORG_ID` – Vercel organization identifier
- `VERCEL_PROJECT_ID` – Vercel project identifier

**Optional Secrets:**

- `GPG_PRIVATE_KEY` – For ledger cryptographic signatures
- `GPG_KEY_ID` – GPG key identifier

**See:** `SECRETS.inventory.md` for complete catalog

---

## Troubleshooting & Rollback

For common failure scenarios, diagnosis steps, and rollback procedures, see:

- **`TROUBLESHOOTING.and.ROLLBACK.md`** – Operational runbook

For DNS configuration and environment setup issues, see:

- **`DNS.and.Environments.md`** – Environment mapping and DNS troubleshooting

---

## Change Management & Versioning

For release notes, versioning policy, and changelog requirements, see:

- **`CHANGELOG.policy.md`** – Release notes template and SemVer guidelines

---

## Governance & Compliance

For compliance mapping, approval justification, and audit requirements, see:

- **`GOVERNANCE.rationale.md`** – Controls and compliance framework

For complete event-to-approval mapping, see:

- **`CI-CD.MAP.md`** – Pipeline matrix reference

---

## Related Documentation

| Document                                   | Description                                     |
| ------------------------------------------ | ----------------------------------------------- |
| `SECRETS.inventory.md`                     | Complete secrets catalog with rotation policies |
| `GOVERNANCE.rationale.md`                  | Compliance mapping and approval justification   |
| `TROUBLESHOOTING.and.ROLLBACK.md`          | Failure scenarios and rollback procedures       |
| `DNS.and.Environments.md`                  | Environment configuration and DNS setup         |
| `CHANGELOG.policy.md`                      | Release notes and versioning policy             |
| `CI-CD.MAP.md`                             | Event-to-approval matrix                        |
| `DNS_CONFIGURATION.md`                     | Comprehensive DNS setup guide                   |
| `CICD_REVIEW_CHECKLIST.md`                 | Pre-deployment validation checklist             |
| `BLOCK07.0_CICD_IMPLEMENTATION_SUMMARY.md` | Block 7 implementation details                  |

---

## Quick Reference Commands

```bash
# Pre-commit quality checks
npm run lint && npm run typecheck && npm test

# Full CI simulation
npm run ci:quality

# Accessibility validation
npm run test:e2e:a11y

# Build and budget check
npm run ci:build

# Governance validation
npm run ci:validate

# Run all checks (comprehensive)
npm run ci

# Verify ledger integrity
npm run ethics:verify-ledger
```

---

## Support & Contact

**Technical Issues:**

- Open issue in GitHub repository
- Tag with `ci/cd` label

**Compliance Questions:**

- Refer to project governance documentation
- Contact designated compliance officer

**Emergency Rollback:**

- See `TROUBLESHOOTING.and.ROLLBACK.md` section 3 (Rollback Procedures)
- Contact DevOps on-call via [internal communication channel]

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-10-21  
**Next Review:** 2026-01-21 (Quarterly)  
**Maintained By:** CASP Lead Architect & DevOps Team
