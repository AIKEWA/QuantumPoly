<!-- FILE: CI-CD.MAP.md -->

# CI/CD Pipeline Map (Quick Reference Matrix)

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Audience:** Auditors, Compliance Reviewers, Quick Reference  
**Classification:** Public Reference

---

## Purpose

This document provides a single-screen matrix mapping CI/CD events to jobs, quality gates, artifacts, environments, and approvals. Use this for rapid audits, compliance reviews, and pipeline orientation.

---

## Event → Deployment Matrix

| Event                             | Workflow File            | Jobs Triggered                                                                                                          | Quality Gates                                                                                                                                         | Artifacts Generated                                                                                              | Environment                                            | Approval Required                            | Ledger Entry |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------- | ------------ |
| **Pull Request Opened/Updated**   | `ci.yml`, `preview.yml`  | • Environment Detection<br>• Lint<br>• Type Check<br>• Test & Coverage<br>• A11y<br>• Preview Deploy<br>• Lighthouse CI | • ESLint (--max-warnings=0)<br>• TypeScript strict<br>• Jest coverage ≥80%<br>• Playwright + axe-core<br>• WCAG 2.1 Level AA<br>• Lighthouse a11y ≥95 | • Coverage reports (30d)<br>• Playwright a11y reports (30d)<br>• JUnit XML (30d)<br>• Vercel preview output (7d) | **Preview**<br>`quantumpoly-[hash]-[scope].vercel.app` | ❌ None                                      | ❌ No        |
| **Merge to Main**                 | `ci.yml`, `release.yml`  | • All CI jobs (re-run)<br>• Deploy to Staging                                                                           | • Same as PR (re-validated)<br>• Coverage merged across Node versions                                                                                 | • Coverage summary (30d)<br>• Staging deployment output (7d)                                                     | **Staging**<br>`quantumpoly-[hash].vercel.app`         | ❌ None                                      | ❌ No        |
| **Tag `v*.*.*` + GitHub Release** | `release.yml`            | • Validate Release<br>• Deploy Production<br>• Update Ledger<br>• Notify Release                                        | • Tag format validation<br>• GitHub Release existence<br>• **Manual human approval**                                                                  | • Production deployment output (90d)<br>• Governance ledger entry (permanent)<br>• Ledger tag `v*-ledger`        | **Production**<br>`www.quantumpoly.ai`                 | ✅ **Manual approval in GitHub Environment** | ✅ Yes       |
| **Workflow Dispatch (Manual)**    | `ci.yml` (optional a11y) | • Forced A11y Tests<br>(if `run_a11y: true`)                                                                            | • Playwright + axe-core                                                                                                                               | • A11y reports (30d)                                                                                             | N/A (test-only)                                        | ❌ None                                      | ❌ No        |

---

## Quality Gates Detailed Matrix

| Quality Gate                   | Tool                                             | Threshold                                                        | Failure Impact            | Artifact Location            | Retention      | Bypass Allowed                     |
| ------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------- | ---------------------------- | -------------- | ---------------------------------- |
| **Lint**                       | ESLint (Next.js config + jsx-a11y + tailwindcss) | Zero warnings (`--max-warnings=0`)                               | ❌ PR blocked             | Workflow logs                | 90 days (logs) | ❌ Never                           |
| **Type Check**                 | TypeScript (tsc --noEmit)                        | Zero type errors                                                 | ❌ PR blocked             | Workflow logs                | 90 days (logs) | ❌ Never                           |
| **Test Coverage (Global)**     | Jest                                             | Branches ≥80%<br>Functions ≥85%<br>Lines ≥85%<br>Statements ≥82% | ❌ PR blocked             | `coverage-report-node-*.zip` | 30 days        | ⚠️ Emergency only (document in PR) |
| **Test Coverage (API)**        | Jest                                             | All metrics ≥90% for `src/app/api/newsletter/route.ts`           | ❌ PR blocked             | `coverage-report-node-*.zip` | 30 days        | ⚠️ Emergency only (document in PR) |
| **Accessibility (Component)**  | jest-axe                                         | Zero WCAG 2.1 Level AA violations                                | ❌ PR blocked             | JUnit XML                    | 30 days        | ❌ Never                           |
| **Accessibility (E2E)**        | Playwright + @axe-core/playwright                | Zero WCAG 2.1 Level AA violations                                | ❌ PR blocked             | `playwright-a11y-report`     | 30 days        | ❌ Never                           |
| **Accessibility (Lighthouse)** | Lighthouse CI                                    | Score ≥95                                                        | ⚠️ Warning (not blocking) | Lighthouse reports           | 90 days        | N/A (non-blocking)                 |
| **Performance (Lighthouse)**   | Lighthouse CI                                    | Score ≥90                                                        | ⚠️ Warning (not blocking) | Lighthouse reports           | 90 days        | N/A (non-blocking)                 |
| **Bundle Budget**              | Custom script                                    | Total <250KB                                                     | ⚠️ Warning (not blocking) | Build logs                   | 7 days         | N/A (non-blocking)                 |
| **Governance (Translations)**  | Custom validation script                         | All required keys present                                        | ❌ PR blocked             | Workflow logs                | 90 days (logs) | ❌ Never                           |
| **Governance (Policies)**      | Custom validation script                         | Policy metadata valid                                            | ❌ PR blocked             | Workflow logs                | 90 days (logs) | ❌ Never                           |

---

## Artifacts Inventory

| Artifact Name                    | Generated By               | Contents                                    | Retention Period | Storage Location           | Access                   |
| -------------------------------- | -------------------------- | ------------------------------------------- | ---------------- | -------------------------- | ------------------------ |
| `coverage-report-node-18.x`      | CI: Test job (Node 18.x)   | lcov.info, coverage-final.json, HTML report | 30 days          | GitHub Actions Artifacts   | Repository collaborators |
| `coverage-report-node-20.x`      | CI: Test job (Node 20.x)   | lcov.info, coverage-final.json, HTML report | 30 days          | GitHub Actions Artifacts   | Repository collaborators |
| `coverage-summary`               | CI: Merge Coverage job     | Merged coverage JSON                        | 30 days          | GitHub Actions Artifacts   | Repository collaborators |
| `playwright-a11y-report`         | CI: A11y job               | HTML report with violation details          | 30 days          | GitHub Actions Artifacts   | Repository collaborators |
| `vercel-prebuilt`                | Preview: Deploy job        | `.vercel/output` directory                  | 7 days           | GitHub Actions Artifacts   | Repository collaborators |
| `vercel-staging-output`          | Release: Deploy Staging    | `.vercel/output` directory                  | 7 days           | GitHub Actions Artifacts   | Repository collaborators |
| `vercel-production-output`       | Release: Deploy Production | `.vercel/output` directory                  | 90 days          | GitHub Actions Artifacts   | Repository collaborators |
| `governance-ledger-v*.*.*`       | Release: Update Ledger     | Ledger files, governance reports            | 90 days          | GitHub Actions Artifacts   | Repository collaborators |
| `governance/ledger/ledger.jsonl` | Release: Update Ledger     | Permanent ledger entries                    | Permanent        | Git repository             | Public (via dashboard)   |
| `reports/junit.xml`              | CI: Test job               | JUnit test results XML                      | 30 days          | Git repository (committed) | Repository collaborators |

---

## Environment Configuration Matrix

| Environment    | URL                                     | Vercel Environment | Trigger                | Approval                       | Environment Variables         | DNS Required                             | SSL Certificate         |
| -------------- | --------------------------------------- | ------------------ | ---------------------- | ------------------------------ | ----------------------------- | ---------------------------------------- | ----------------------- |
| **Preview**    | `quantumpoly-[hash]-[scope].vercel.app` | `preview`          | PR opened/updated      | None                           | Preview env vars in Vercel    | ❌ No                                    | ✅ Auto (Vercel)        |
| **Staging**    | `quantumpoly-[hash].vercel.app`         | `preview`          | Push to `main`         | None                           | Preview env vars in Vercel    | ❌ No (optional: staging.quantumpoly.ai) | ✅ Auto (Vercel)        |
| **Production** | `www.quantumpoly.ai`                    | `production`       | Tag `v*.*.*` + Release | ✅ Manual (GitHub Environment) | Production env vars in Vercel | ✅ CNAME: `www` → `cname.vercel-dns.com` | ✅ Auto (Let's Encrypt) |

---

## Approval Requirements Matrix

| Deployment Type            | Technical Gate                   | Governance Gate   | Human Gate                     | Total Approvals   | Approver Roles                                   | Bypass Allowed          |
| -------------------------- | -------------------------------- | ----------------- | ------------------------------ | ----------------- | ------------------------------------------------ | ----------------------- |
| **Preview**                | ✅ CI quality gates              | ❌ None           | ❌ None                        | 0 (automatic)     | N/A                                              | N/A                     |
| **Staging**                | ✅ CI quality gates              | ❌ None           | ❌ None                        | 0 (automatic)     | N/A                                              | N/A                     |
| **Production (Standard)**  | ✅ CI quality gates              | ✅ GitHub Release | ✅ Manual approval             | 3 gates           | DevOps Lead / Product Owner / Compliance Officer | ❌ Never                |
| **Production (Emergency)** | ⚠️ May bypass with justification | ✅ GitHub Release | ✅ Manual approval (expedited) | 2 gates (minimum) | CTO / Engineering Director                       | ⚠️ With post-hoc review |

---

## Workflow Permissions Matrix

| Workflow      | `contents` | `deployments` | `pull-requests` | `security-events` | Justification                                          |
| ------------- | ---------- | ------------- | --------------- | ----------------- | ------------------------------------------------------ |
| `ci.yml`      | `read`     | —             | `write`         | —                 | Read code, comment on PRs                              |
| `preview.yml` | `read`     | —             | `write`         | —                 | Read code, comment on PRs                              |
| `release.yml` | `write`    | `write`       | `write`         | —                 | Commit ledger, create deployments, comment on releases |

**Note:** All workflows use minimal permissions (principle of least privilege).

---

## Secret Usage Matrix

| Secret              | Used By Workflow             | Used By Job         | Required For                 | Rotation Schedule           | Owner              |
| ------------------- | ---------------------------- | ------------------- | ---------------------------- | --------------------------- | ------------------ |
| `VERCEL_TOKEN`      | `preview.yml`, `release.yml` | All deployment jobs | Vercel API authentication    | 90 days                     | DevOps Lead        |
| `VERCEL_ORG_ID`     | `preview.yml`, `release.yml` | All deployment jobs | Organization context         | Never (immutable)           | DevOps Lead        |
| `VERCEL_PROJECT_ID` | `preview.yml`, `release.yml` | All deployment jobs | Project context              | Never (immutable)           | DevOps Lead        |
| `GPG_PRIVATE_KEY`   | `release.yml`                | Update Ledger       | Ledger signature (optional)  | 365 days                    | Compliance Officer |
| `GPG_KEY_ID`        | `release.yml`                | Update Ledger       | GPG key selection (optional) | Paired with GPG_PRIVATE_KEY | Compliance Officer |

---

## CI/CD Trigger Decision Tree

```
┌─────────────────┐
│  Developer      │
│  Action         │
└────────┬────────┘
         │
         ├─── Push to feature branch ───────────────────────────────────┐
         │                                                               │
         ├─── Create Pull Request ──────────────┐                       │
         │                                      │                       │
         │                         ┌────────────▼────────────┐          │
         │                         │  CI Workflow (ci.yml)   │          │
         │                         │  + Preview (preview.yml)│          │
         │                         │                         │          │
         │                         │  • Environment Detection│          │
         │                         │  • Lint                 │          │
         │                         │  • Type Check           │          │
         │                         │  • Test & Coverage      │          │
         │                         │  • A11y (Playwright)    │          │
         │                         │  • Preview Deployment   │          │
         │                         │  • Lighthouse CI        │          │
         │                         └────────────┬────────────┘          │
         │                                      │                       │
         │                         ┌────────────▼────────────┐          │
         │                         │  All Gates Pass?        │          │
         │                         └────┬──────────────┬─────┘          │
         │                              │ No           │ Yes            │
         │                         ┌────▼─────┐   ┌───▼────┐           │
         │                         │ PR       │   │ PR     │           │
         │                         │ Blocked  │   │ Ready  │           │
         │                         └──────────┘   └───┬────┘           │
         │                                            │                │
         ├─── Merge to Main ─────────────────────────┼────────────────┘
         │                                            │
         │                                 ┌──────────▼────────────┐
         │                                 │  CI Re-runs (ci.yml)  │
         │                                 │  + Staging Deploy     │
         │                                 │  (release.yml)        │
         │                                 └──────────┬────────────┘
         │                                            │
         │                                 ┌──────────▼────────────┐
         │                                 │  Staging URL:         │
         │                                 │  QA Validation        │
         │                                 └──────────┬────────────┘
         │                                            │
         ├─── Create Tag v*.*.* ─────────────────────┤
         │                                            │
         ├─── Create GitHub Release ─────────────────┤
         │                                            │
         │                                 ┌──────────▼────────────┐
         │                                 │  Validate Release     │
         │                                 │  (release.yml)        │
         │                                 └──────────┬────────────┘
         │                                            │
         │                                 ┌──────────▼────────────┐
         │                                 │  Deploy Production    │
         │                                 │  ⏸ WAITING FOR        │
         │                                 │    MANUAL APPROVAL    │
         │                                 └──────────┬────────────┘
         │                                            │
         └─── Approver Approves ────────────────────┐│
                                                     ││
                                          ┌──────────▼▼────────────┐
                                          │  Deploy to Production │
                                          │  (Vercel)             │
                                          └──────────┬────────────┘
                                                     │
                                          ┌──────────▼────────────┐
                                          │  Alias to             │
                                          │  www.quantumpoly.ai   │
                                          └──────────┬────────────┘
                                                     │
                                          ┌──────────▼────────────┐
                                          │  Update Ledger        │
                                          │  (governance/ledger/) │
                                          └──────────┬────────────┘
                                                     │
                                          ┌──────────▼────────────┐
                                          │  Production Live      │
                                          │  Ledger Entry Created │
                                          └───────────────────────┘
```

---

## Compliance Mapping (Quick Reference)

| Standard                | Control                 | Implementation                                        | Evidence Location                     |
| ----------------------- | ----------------------- | ----------------------------------------------------- | ------------------------------------- |
| **SOC 2 (CC6.6)**       | Separation of duties    | CI (`contents: read`) vs. Release (`contents: write`) | `.github/workflows/*.yml` permissions |
| **SOC 2 (CC7.2)**       | Automated quality gates | 6 parallel CI jobs (lint, typecheck, test, a11y)      | CI workflow logs, artifacts           |
| **SOC 2 (CC7.3)**       | Deployment audit trail  | Governance ledger (append-only, GPG-signed)           | `governance/ledger/ledger.jsonl`      |
| **ISO 27001 (A.8.3)**   | Secret management       | GitHub Secrets with rotation schedule                 | `SECRETS.inventory.md`                |
| **ISO 27001 (A.12.1)**  | Change management       | Tag + Release + Manual approval                       | GitHub Releases, deployment logs      |
| **ISO 27001 (A.12.4)**  | Audit logging           | Workflow logs (90-day retention), ledger (permanent)  | GitHub Actions logs, ledger entries   |
| **EU AI Act (Art. 13)** | Transparency            | Public governance ledger at `/dashboard/ledger`       | Ledger dashboard, API export          |
| **EU AI Act (Art. 14)** | Human oversight         | Manual approval for production deployments            | GitHub Environment protection rules   |
| **ISO 42001 (6.1)**     | Risk management         | Quality gates fail deployment if thresholds not met   | CI workflow failure blocks merge      |

---

## Rollback Options (Quick Reference)

| Rollback Method                           | Time to Execute | Advantages                                 | Disadvantages                       | When to Use          |
| ----------------------------------------- | --------------- | ------------------------------------------ | ----------------------------------- | -------------------- |
| **1. Redeploy Previous Release**          | 10-15 min       | Full CI/CD validation, ledger auto-updated | Requires approval (slower)          | Standard rollback    |
| **2. Promote Previous Vercel Deployment** | 2-5 min         | Immediate, no approval                     | Bypasses CI/CD, manual ledger entry | P0 incidents         |
| **3. Git Revert + Emergency Deploy**      | 15-20 min       | Permanent fix, clean history               | Slower, may conflict                | Non-urgent incidents |
| **4. Disable Workflow**                   | 1 min           | Stops all deployments                      | Doesn't fix current state           | Investigation needed |

**See:** `TROUBLESHOOTING.and.ROLLBACK.md` for detailed procedures

---

## One-Line Summaries (Elevator Pitch)

| Stage              | Summary                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **PR (Preview)**   | Every PR gets: quality gates + preview deployment + Lighthouse validation + PR comment                  |
| **Main (Staging)** | Every merge: re-runs quality gates + auto-deploys to staging for QA validation                          |
| **Production**     | Every release: requires tag + GitHub Release + manual approval → deploys to production + updates ledger |
| **Rollback**       | Four rollback options: redeploy previous, promote Vercel deployment, Git revert, or disable workflow    |
| **Governance**     | Every production deployment: recorded in cryptographically verifiable ledger with EII score             |

---

## Critical Paths (Troubleshooting Quick Guide)

| Issue                   | First Check                                      | Fix                                                          | Reference                                       |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| **CI failing**          | Which job? (lint/typecheck/test/a11y)            | Run locally: `npm run lint && npm run typecheck && npm test` | `README.CI-CD.md` § Local Development           |
| **Coverage too low**    | `npm run test:coverage` → open HTML report       | Add tests for uncovered files                                | `TROUBLESHOOTING.and.ROLLBACK.md` § Failure 2   |
| **A11y violations**     | `npm run test:e2e:a11y` → view Playwright report | Fix WCAG violations per report                               | `TROUBLESHOOTING.and.ROLLBACK.md` § Failure 3   |
| **Vercel deploy fails** | Vercel dashboard → deployment logs               | Reproduce locally: `npm run build`                           | `TROUBLESHOOTING.and.ROLLBACK.md` § Failure 4   |
| **Approval stuck**      | Check designated reviewers available             | Contact reviewer or add temporary reviewer                   | `TROUBLESHOOTING.and.ROLLBACK.md` § Failure 6   |
| **DNS not resolving**   | `dig www.quantumpoly.ai CNAME +short`            | Verify CNAME: `www` → `cname.vercel-dns.com`                 | `DNS.and.Environments.md` § DNS Troubleshooting |

---

## Related Documentation Index

| Document                          | Primary Use Case                                               |
| --------------------------------- | -------------------------------------------------------------- |
| `README.CI-CD.md`                 | Comprehensive pipeline overview, local development commands    |
| `SECRETS.inventory.md`            | Secret catalog, rotation schedule, break-glass procedures      |
| `GOVERNANCE.rationale.md`         | Compliance mapping, approval justification, audit requirements |
| `TROUBLESHOOTING.and.ROLLBACK.md` | Incident response, failure diagnosis, rollback procedures      |
| `DNS.and.Environments.md`         | Environment configuration, DNS setup, safe rollout patterns    |
| `CHANGELOG.policy.md`             | Versioning rules, release notes template, reviewer sign-off    |
| `CI-CD.MAP.md`                    | **This document** – Quick reference matrix for audits          |

---

## Auditor Quick Start

**First-Time Audit:**

1. Read this document (CI-CD.MAP.md) for overview
2. Review `GOVERNANCE.rationale.md` for compliance controls
3. Inspect `.github/workflows/ci.yml` and `release.yml` for implementation
4. Verify `governance/ledger/ledger.jsonl` for deployment history
5. Check `SECRETS.inventory.md` for secret management

**Ongoing Compliance:**

1. Quarterly review of governance ledger entries
2. Verify artifact retention compliance (30/90-day policies)
3. Check secret rotation schedule adherence
4. Audit approval records (GitHub deployment history)
5. Review change categorization accuracy

---

## Contact for Clarifications

**Technical Questions:** DevOps Team (GitHub issues with `ci/cd` label)  
**Compliance Questions:** Compliance Officer (refer to internal directory)  
**Audit Support:** CASP Lead Architect

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-10-21  
**Next Review:** 2026-01-21 (Quarterly)  
**Maintained By:** DevOps Team & Compliance Team  
**Certification:** SOC 2 Type II (in progress), ISO 27001 (planned)
