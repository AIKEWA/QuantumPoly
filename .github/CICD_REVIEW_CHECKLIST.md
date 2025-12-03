# CI/CD Review Checklist

**Purpose:** Pre-deployment validation checklist for QuantumPoly CI/CD pipeline  
**Audience:** Engineering, QA, Security, Compliance  
**Last Updated:** 2025-10-24

---

## Instructions

This checklist ensures systematic validation before merging pull requests, deploying to staging, or releasing to production. Each section corresponds to a deployment gate with measurable acceptance criteria.

**Status Indicators:**

- ✅ Pass — Requirement met
- ⚠️ Warning — Non-blocking issue requires attention
- ❌ Fail — Blocker, must be resolved before proceeding

---

## 1. Pre-Merge Validation (Pull Requests)

Execute before merging any PR to `main`.

### 1.1 Code Quality

| Check               | Command                 | Pass Criteria                | Status | Notes |
| ------------------- | ----------------------- | ---------------------------- | ------ | ----- |
| ESLint passes       | `npm run lint`          | Exit code 0, no violations   | ☐      |       |
| TypeScript compiles | `npm run typecheck`     | Exit code 0, no type errors  | ☐      |       |
| Unit tests pass     | `npm test`              | Exit code 0, all tests green | ☐      |       |
| Coverage ≥ 85%      | `npm run test:coverage` | Global: 85%+, API: 90%+      | ☐      |       |

### 1.2 Accessibility Compliance

| Check               | Command                 | Pass Criteria         | Status | Notes |
| ------------------- | ----------------------- | --------------------- | ------ | ----- |
| jsx-a11y lint rules | `npm run lint`          | Zero a11y violations  | ☐      |       |
| Jest-axe unit tests | `npm run test:a11y`     | Zero violations       | ☐      |       |
| Playwright axe E2E  | `npm run test:e2e:a11y` | Zero critical/serious | ☐      |       |
| Lighthouse A11y     | `npm run lh:a11y`       | Score ≥ 95/100        | ☐      |       |

### 1.3 Performance Standards

| Check           | Command           | Pass Criteria      | Status | Notes |
| --------------- | ----------------- | ------------------ | ------ | ----- |
| Bundle budget   | `npm run budget`  | < 250 KB per route | ☐      |       |
| Lighthouse Perf | `npm run lh:perf` | Score ≥ 90/100     | ☐      |       |
| LCP             | Lighthouse report | ≤ 2.5s             | ☐      |       |
| TBT             | Lighthouse report | < 300ms            | ☐      |       |
| CLS             | Lighthouse report | < 0.1              | ☐      |       |

### 1.4 Governance & Ethics

| Check                    | Command                           | Pass Criteria | Status | Notes |
| ------------------------ | --------------------------------- | ------------- | ------ | ----- |
| Translation validation   | `npm run validate:translations`   | Exit code 0   | ☐      |       |
| Locale validation        | `npm run validate:locales`        | Exit code 0   | ☐      |       |
| Policy review validation | `npm run validate:policy-reviews` | Exit code 0   | ☐      |       |

### 1.5 Build & Integration

| Check            | Command                   | Pass Criteria          | Status | Notes |
| ---------------- | ------------------------- | ---------------------- | ------ | ----- |
| Production build | `npm run build`           | Exit code 0, no errors | ☐      |       |
| Storybook build  | `npm run build-storybook` | Exit code 0, no errors | ☐      |       |
| SBOM generation  | CI artifact               | CycloneDX valid        | ☐      |       |

### 1.6 Preview Deployment

| Check              | Verification     | Pass Criteria        | Status | Notes |
| ------------------ | ---------------- | -------------------- | ------ | ----- |
| Preview deploys    | Check PR comment | Vercel URL posted    | ☐      |       |
| Preview accessible | Visit URL        | Site loads correctly | ☐      |       |
| Preview Lighthouse | CI workflow      | A11y = 1.0           | ☐      |       |

### 1.7 Code Review

| Check                  | Verification   | Pass Criteria        | Status | Notes |
| ---------------------- | -------------- | -------------------- | ------ | ----- |
| Peer review            | GitHub PR      | 1+ approval          | ☐      |       |
| No unresolved comments | GitHub PR      | All threads resolved | ☐      |       |
| Conventional commits   | Commit history | Valid format         | ☐      |       |

---

## 2. Pre-Staging Deployment

Execute before merging to `main` (triggers automatic staging deploy).

### 2.1 Quality Gate Verification

| Check              | Verification   | Pass Criteria      | Status | Notes |
| ------------------ | -------------- | ------------------ | ------ | ----- |
| All CI jobs passed | GitHub Actions | Green checkmarks   | ☐      |       |
| No failing tests   | CI logs        | Zero failures      | ☐      |       |
| Branch up to date  | GitHub PR      | No merge conflicts | ☐      |       |

### 2.2 Staging Readiness

| Check                      | Verification     | Pass Criteria        | Status | Notes |
| -------------------------- | ---------------- | -------------------- | ------ | ----- |
| Staging secrets configured | Vercel dashboard | Preview env vars set | ☐      |       |
| Staging URL known          | Previous deploy  | URL documented       | ☐      |       |

---

## 3. Pre-Production Deployment

Execute before creating Git tag and GitHub Release for production.

### 3.1 Release Preparation

| Check               | Verification | Pass Criteria        | Status | Notes |
| ------------------- | ------------ | -------------------- | ------ | ----- |
| Staging validated   | Manual QA    | All features working | ☐      |       |
| Changelog updated   | CHANGELOG.md | Version documented   | ☐      |       |
| Version incremented | package.json | Semver compliance    | ☐      |       |
| Tag format valid    | Git tag      | `v*.*.*` pattern     | ☐      |       |

### 3.2 Release Validation

| Check                  | Verification    | Pass Criteria      | Status | Notes |
| ---------------------- | --------------- | ------------------ | ------ | ----- |
| Git tag created        | `git tag -l`    | Tag exists locally | ☐      |       |
| Tag pushed             | GitHub releases | Tag visible        | ☐      |       |
| GitHub Release created | GitHub UI       | Release published  | ☐      |       |
| Release notes complete | Release body    | Changelog included | ☐      |       |

### 3.3 Production Deployment Criteria

| Check               | Verification       | Pass Criteria | Status | Notes |
| ------------------- | ------------------ | ------------- | ------ | ----- |
| Approvers assigned  | GitHub Environment | 2+ reviewers  | ☐      |       |
| EII score validated | Governance report  | EII ≥ 90      | ☐      |       |
| No P0/P1 issues     | Issue tracker      | Zero blockers | ☐      |       |

### 3.4 Governance & Compliance

| Check            | Verification                   | Pass Criteria         | Status | Notes |
| ---------------- | ------------------------------ | --------------------- | ------ | ----- |
| Ledger integrity | `npm run ethics:verify-ledger` | Exit code 0           | ☐      |       |
| Ethics metrics   | Governance dashboard           | All metrics green     | ☐      |       |
| Security audit   | Dependency scan                | No high/critical CVEs | ☐      |       |

### 3.5 Production Environment

| Check              | Verification                         | Pass Criteria     | Status | Notes |
| ------------------ | ------------------------------------ | ----------------- | ------ | ----- |
| Production secrets | Vercel dashboard                     | Prod env vars set | ☐      |       |
| DNS configured     | `dig www.quantumpoly.ai`             | CNAME correct     | ☐      |       |
| SSL cert valid     | `curl -I https://www.quantumpoly.ai` | HTTPS working     | ☐      |       |

---

## 4. During Production Deployment

Execute while production deployment is in progress.

### 4.1 Manual Approval

| Check                   | Verification      | Pass Criteria           | Status | Notes |
| ----------------------- | ----------------- | ----------------------- | ------ | ----- |
| Workflow triggered      | GitHub Actions    | release.yml running     | ☐      |       |
| Validate-release passed | CI logs           | Tag/Release verified    | ☐      |       |
| Approval prompt shown   | GitHub Actions UI | Environment gate active | ☐      |       |
| Reviewer approves       | GitHub Actions    | Approval granted        | ☐      |       |

### 4.2 Deployment Monitoring

| Check                 | Verification | Pass Criteria              | Status | Notes |
| --------------------- | ------------ | -------------------------- | ------ | ----- |
| Vercel build success  | CI logs      | Build completed            | ☐      |       |
| Vercel deploy success | CI logs      | Deploy URL returned        | ☐      |       |
| Domain alias success  | CI logs      | www.quantumpoly.ai aliased | ☐      |       |
| No error logs         | CI output    | Zero errors                | ☐      |       |

### 4.3 Ledger Update

| Check                    | Verification   | Pass Criteria       | Status | Notes |
| ------------------------ | -------------- | ------------------- | ------ | ----- |
| Ledger update job runs   | GitHub Actions | Job triggered       | ☐      |       |
| Ledger commit success    | Git log        | Commit pushed       | ☐      |       |
| Ledger tag created       | GitHub tags    | `v*.*.*-ledger` tag | ☐      |       |
| Ledger artifact uploaded | CI artifacts   | 90-day retention    | ☐      |       |

---

## 5. Post-Deployment Verification

Execute immediately after production deployment completes.

### 5.1 DNS & Connectivity

| Check              | Command                                                                        | Pass Criteria     | Status | Notes |
| ------------------ | ------------------------------------------------------------------------------ | ----------------- | ------ | ----- |
| DNS resolves       | `dig +short www.quantumpoly.ai`                                                | Returns Vercel IP | ☐      |       |
| HTTPS accessible   | `curl -I https://www.quantumpoly.ai`                                           | 200 OK response   | ☐      |       |
| SSL cert valid     | `curl -vI https://www.quantumpoly.ai 2>&1 \| grep "SSL certificate verify ok"` | Certificate valid | ☐      |       |
| Canonical redirect | `curl -I http://quantumpoly.ai`                                                | 301 → www         | ☐      |       |

### 5.2 SEO & Indexing

| Check            | Verification                                  | Pass Criteria          | Status | Notes |
| ---------------- | --------------------------------------------- | ---------------------- | ------ | ----- |
| robots.txt       | `curl https://www.quantumpoly.ai/robots.txt`  | Production policy      | ☐      |       |
| sitemap.xml      | `curl https://www.quantumpoly.ai/sitemap.xml` | Valid XML              | ☐      |       |
| Hreflang present | Sitemap inspection                            | All locales listed     | ☐      |       |
| Meta tags        | View source                                   | Title, description, OG | ☐      |       |

### 5.3 Security Headers

| Check           | Command                              | Pass Criteria             | Status | Notes |
| --------------- | ------------------------------------ | ------------------------- | ------ | ----- |
| HSTS            | `curl -I https://www.quantumpoly.ai` | Strict-Transport-Security | ☐      |       |
| X-Frame-Options | Header inspection                    | DENY or SAMEORIGIN        | ☐      |       |
| X-Content-Type  | Header inspection                    | nosniff                   | ☐      |       |
| CSP             | Header inspection                    | Content-Security-Policy   | ☐      |       |

### 5.4 Performance Validation

| Check           | Command           | Pass Criteria  | Status | Notes |
| --------------- | ----------------- | -------------- | ------ | ----- |
| Lighthouse Perf | `npm run lh:perf` | Score ≥ 90/100 | ☐      |       |
| LCP             | Lighthouse report | ≤ 2.5s         | ☐      |       |
| TBT             | Lighthouse report | < 300ms        | ☐      |       |
| CLS             | Lighthouse report | < 0.1          | ☐      |       |

### 5.5 Accessibility Validation

| Check                 | Command           | Pass Criteria        | Status | Notes |
| --------------------- | ----------------- | -------------------- | ------ | ----- |
| Lighthouse A11y       | `npm run lh:a11y` | Score ≥ 95/100       | ☐      |       |
| Axe browser extension | Manual check      | Zero violations      | ☐      |       |
| Keyboard navigation   | Manual check      | Full site accessible | ☐      |       |
| Screen reader         | Manual check      | Proper announcements | ☐      |       |

### 5.6 Functional Testing

| Check             | Verification    | Pass Criteria     | Status | Notes |
| ----------------- | --------------- | ----------------- | ------ | ----- |
| Homepage loads    | Browser test    | Content visible   | ☐      |       |
| Language switcher | Click test      | Locales change    | ☐      |       |
| Newsletter form   | Form test       | Submission works  | ☐      |       |
| Policy pages      | Navigation test | All pages load    | ☐      |       |
| Footer links      | Click test      | All links work    | ☐      |       |
| Storybook         | Browser test    | Components render | ☐      |       |

### 5.7 Governance Verification

| Check               | Verification                 | Pass Criteria       | Status | Notes |
| ------------------- | ---------------------------- | ------------------- | ------ | ----- |
| Ledger updated      | `git log governance/ledger/` | New entry present   | ☐      |       |
| Deployment metadata | Ledger entry                 | Tag, URL, timestamp | ☐      |       |
| EII score recorded  | Governance report            | Score documented    | ☐      |       |
| Audit artifacts     | GitHub artifacts             | 90-day retention    | ☐      |       |

---

## 6. Rollback Procedure

Execute if critical issues are discovered post-deployment.

### 6.1 Immediate Actions

| Action                 | Command                              | Status | Notes |
| ---------------------- | ------------------------------------ | ------ | ----- |
| Stop traffic           | Vercel dashboard → Redeploy previous | ☐      |       |
| Notify team            | Slack/incident channel               | ☐      |       |
| Create incident ticket | Issue tracker                        | ☐      |       |
| Document issue         | Incident report                      | ☐      |       |

### 6.2 Rollback Decision Matrix

| Severity          | Criteria                                   | Action                  | Approval Required  |
| ----------------- | ------------------------------------------ | ----------------------- | ------------------ |
| **P0 - Critical** | Site down, data loss, security breach      | Immediate rollback      | No (emergency)     |
| **P1 - High**     | Major feature broken, compliance violation | Rollback within 1 hour  | Lead engineer      |
| **P2 - Medium**   | Minor feature broken, visual issues        | Fix forward or rollback | Product owner      |
| **P3 - Low**      | Cosmetic issues, typos                     | Fix forward             | No rollback needed |

### 6.3 Rollback Commands

```bash
# Option 1: Redeploy previous version via Vercel CLI
vercel rollback <DEPLOYMENT_URL> --token=$VERCEL_TOKEN

# Option 2: Redeploy previous Git tag
git checkout <PREVIOUS_TAG>
git tag -a <NEW_TAG> -m "Rollback to <PREVIOUS_TAG>"
git push origin <NEW_TAG>
# Then create GitHub Release (triggers production deploy)

# Option 3: Vercel Dashboard
# Navigate to: Project → Deployments → Previous Deployment → Promote to Production
```

### 6.4 Post-Rollback Procedures

| Action                   | Verification              | Status | Notes |
| ------------------------ | ------------------------- | ------ | ----- |
| Verify rollback success  | Visit www.quantumpoly.ai  | ☐      |       |
| Update incident ticket   | Status → Resolved         | ☐      |       |
| Update governance ledger | Ledger entry for rollback | ☐      |       |
| Conduct postmortem       | Document root cause       | ☐      |       |

---

## 7. Checklist Usage Guidelines

### For Pull Requests

1. Developer completes Section 1 (Pre-Merge Validation)
2. Developer attaches checklist to PR description
3. Reviewer verifies checklist completion
4. Merge only after all ✅ or documented ⚠️ exceptions

### For Staging Deployments

1. Lead engineer completes Section 2 (Pre-Staging)
2. Monitor staging deploy workflow
3. QA team validates staging environment

### For Production Deployments

1. Release manager completes Sections 3, 4, 5 (Pre/During/Post Production)
2. At least 2 reviewers validate Section 3 before approval
3. On-call engineer completes Section 5 within 30 minutes of deploy
4. Results documented in release notes

---

## 8. Sign-Off Template

Use this template for formal release approval:

```
## Release Sign-Off: v1.0.0

**Date:** 2025-10-24
**Environment:** Production
**Deployment URL:** https://www.quantumpoly.ai

### Pre-Deployment Validation
- [ ] All CI quality gates passed
- [ ] Staging validated by QA
- [ ] Security scan clean
- [ ] Governance review complete

### Post-Deployment Verification
- [ ] DNS resolves correctly
- [ ] HTTPS certificate valid
- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 95
- [ ] Functional testing complete

### Sign-Offs
- [ ] Engineering: ______________________ (Name, Date)
- [ ] QA: ______________________ (Name, Date)
- [ ] Security: ______________________ (Name, Date)
- [ ] Compliance: ______________________ (Name, Date)

**Status:** ✅ Approved / ❌ Rejected / ⚠️ Conditional

**Notes:**
_[Any exceptions, caveats, or follow-up items]_
```

---

## 9. Related Documentation

- **CI/CD Architecture:** README.md - CI/CD Pipeline section
- **DNS Setup:** docs/DNS_CONFIGURATION.md
- **Deployment Workflows:** .github/workflows/ci.yml, .github/workflows/release.yml
- **Block 7 Implementation:** BLOCK07.0_CICD_IMPLEMENTATION_SUMMARY.md
- **Accessibility Testing:** docs/ACCESSIBILITY_TESTING.md
- **Performance Optimization:** PERFORMANCE_OPTIMIZATION_SUMMARY.md

---

## 10. Maintenance

This checklist should be reviewed and updated:

- **After each major release** — Validate checklist accuracy
- **Quarterly** — Update based on learnings and process improvements
- **When workflows change** — Ensure checklist reflects pipeline changes
- **After incidents** — Add new validation steps to prevent recurrence

**Last Reviewed:** 2025-10-24  
**Next Review Due:** 2026-01-24  
**Owner:** A.I.K (Engineering Lead)

---

**Document Version:** 1.0.0  
**Created:** 2025-10-24  
**Status:** Active
