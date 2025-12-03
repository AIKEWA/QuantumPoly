<!-- FILE: docs/review-checklist.md -->

# 📋 Release Review Checklist & Audit Gate

## 📌 Purpose & Scope

This checklist is a structured audit framework for ensuring safe, ethical, and compliant software releases. It is designed for maintainers, DevOps engineers, SREs, and compliance/security reviewers to assess readiness across **three critical stages**: Pre-merge, Pre-release, and Post-deployment.

- **Version:** 1.0.0
- **Owners:** DevOps, Security, Product, Compliance
- **Document Location:** `/docs/review-checklist.md`
- **Related Documentation:**
  - [DNS Verification Runbook](DNS.md)
  - [CI/CD Workflows](../.github/workflows)
  - [Governance Ledger](../governance/README.md)
- **Usage Guide:**  
  Each section must be completed before proceeding. Reviewers must provide evidence and check all items explicitly. Manual sign-off is required at the Audit Gate.

---

## 🛠️ Stage A — Pre-Merge Checklist

| #   | Check Item                                                                   | Evidence                                               | Pass/Fail |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------ | --------- |
| 1   | ✅ Code Linting passes with exit code 0                                      | `npm run lint` → [ci.yml](../.github/workflows/ci.yml) | [ ]       |
| 2   | ✅ Unit tests pass; coverage ≥ 85%                                           | `npm test` → [ci.yml](../.github/workflows/ci.yml)     | [ ]       |
| 3   | ✅ Build artifacts reproducible                                              | Hash matches via CI logs                               | [ ]       |
| 4   | ✅ Static Application Security Test (SAST) complete, no Critical/High issues | GitHub Advanced Security / Snyk scan                   | [ ]       |
| 5   | ✅ Infrastructure as Code (IaC) scanned, no Critical risks                   | Workflow configuration validated                       | [ ]       |
| 6   | ✅ Dependency audit shows no known vulnerabilities                           | `npm audit` in [ci.yml](../.github/workflows/ci.yml)   | [ ]       |
| 7   | ✅ Secrets scan shows no exposed credentials                                 | GitHub secret scanning enabled                         | [ ]       |
| 8   | ✅ Documentation & changelog updated                                         | `CHANGELOG.md` diff                                    | [ ]       |
| 9   | ✅ Ethical/Threat impact note added                                          | [Governance Dashboard](/dashboard)                     | [ ]       |
| 10  | ✅ PR includes ticket reference                                              | Issue/PR URL                                           | [ ]       |
| 11  | ✅ Minimum two peer reviews or policy threshold met                          | GitHub reviews tab                                     | [ ]       |
| 12  | ✅ Conventional commits followed & version bump justified                    | Commit logs                                            | [ ]       |
| 13  | ✅ Static config diffs reviewed                                              | Workflow/vercel.json changes reviewed                  | [ ]       |
| 14  | ✅ SBOM attached if applicable                                               | `/artifacts/sbom.json`                                 | [ ]       |

**Pre-Merge CI Validation:** [ci.yml](../.github/workflows/ci.yml), [a11y.yml](../.github/workflows/a11y.yml), [seo-validation.yml](../.github/workflows/seo-validation.yml)

---

## 🚀 Stage B — Pre-Release Checklist

| #   | Check Item                                             | Evidence                                                                | Pass/Fail |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------- | --------- |
| 1   | ✅ Staging deployment successful                       | [vercel-deploy.yml](../.github/workflows/vercel-deploy.yml) staging job | [ ]       |
| 2   | ✅ E2E / smoke tests pass                              | [e2e-tests.yml](../.github/workflows/e2e-tests.yml) Playwright results  | [ ]       |
| 3   | ✅ Performance benchmarks meet thresholds              | [perf.yml](../.github/workflows/perf.yml) Lighthouse scores             | [ ]       |
| 4   | ✅ Data migration dry-run validated & rollback ready   | Migration logs if applicable                                            | [ ]       |
| 5   | ✅ Feature flags and blast radius documented           | Feature flag configuration documented                                   | [ ]       |
| 6   | ✅ Security exceptions approved                        | Exception ticket URL if applicable                                      | [ ]       |
| 7   | ✅ Governance ticket created & DPIA attached if needed | [Governance Ledger](../governance/ledger) entry                         | [ ]       |
| 8   | ✅ Release notes & changelog complete                  | Release notes drafted                                                   | [ ]       |
| 9   | ✅ Manual approval required                            | See Audit Gate below                                                    | [ ]       |
| 10  | ✅ Tag/version correct, artifact immutable             | Git tag verified, artifact checksum validated                           | [ ]       |
| 11  | ✅ Backup and restore validated                        | Vercel deployment rollback tested                                       | [ ]       |
| 12  | ✅ Incident communication drafted                      | Status communication template ready                                     | [ ]       |
| 13  | ✅ Rollback steps verified and tested                  | [DNS.md Rollback Procedures](DNS.md#rollback-procedures)                | [ ]       |

**Pre-Release Validation:** [vercel-deploy.yml](../.github/workflows/vercel-deploy.yml) staging environment

---

## 📦 Stage C — Post-Deployment Checklist

| #   | Check Item                              | Evidence                                                                | Pass/Fail |
| --- | --------------------------------------- | ----------------------------------------------------------------------- | --------- |
| 1   | ✅ DNS resolves correctly, SSL valid    | [DNS.md DNS Verification](DNS.md#propagation-checks): `dig`, `nslookup` | [ ]       |
| 2   | ✅ Health checks return 200/OK          | [DNS.md Health Checks](DNS.md#health--cutover): `curl /health`          | [ ]       |
| 3   | ✅ Monitors and alerts all green        | Vercel Analytics dashboard                                              | [ ]       |
| 4   | ✅ No new P1/P0 errors in logs          | Vercel logs aggregation                                                 | [ ]       |
| 5   | ✅ Synthetic checks pass globally       | [DNS.md Global Propagation](DNS.md#global-propagation-tools-web-based)  | [ ]       |
| 6   | ✅ Data integrity validated post-deploy | Integrity checksums validated                                           | [ ]       |
| 7   | ✅ Observability traces normal          | Vercel deployment traces                                                | [ ]       |
| 8   | ✅ Rollback plan validated              | [DNS.md Rollback Options](DNS.md#rollback-procedures)                   | [ ]       |
| 9   | ✅ Governance ledger updated            | [Ledger updated](../governance/ledger/releases) by automation           | [ ]       |
| 10  | ✅ Artifacts retained per policy        | Vercel artifact registry (90 days)                                      | [ ]       |
| 11  | ✅ Post-release retro scheduled         | Calendar invite created                                                 | [ ]       |
| 12  | ✅ Attestation uploaded for audit       | `attestation.json` in governance ledger                                 | [ ]       |

**Post-Deployment Verification:**

- DNS/SSL: [docs/DNS.md](DNS.md) verification procedures
- Governance: Automated sync via [scripts/audit-sync-ledger.sh](../scripts/audit-sync-ledger.sh)

---

## ✅ Audit Gate — Manual Approval & Blockers

**🚨 DO NOT PROCEED if any blockers below are active.**

### Blockers

- [ ] Failed or skipped checklist items above.
- [ ] Missing governance or ethics sign-off.
- [ ] Unresolved P1/P0 alerts post-deploy.

### Sign-Off Matrix

| Role        | Name | Signature | Date | Notes |
| ----------- | ---- | --------- | ---- | ----- |
| Product     |      | [ ]       |      |       |
| Engineering |      | [ ]       |      |       |
| Security    |      | [ ]       |      |       |
| Compliance  |      | [ ]       |      |       |

**Validation:** This matrix is validated by [scripts/validate-checklist.sh](../scripts/validate-checklist.sh) in CI pipeline.

---

## 📂 Evidence Table Template

| Stage | Check Item | Command/Tool   | Output Screenshot/Link | Reviewer     | Timestamp |
| ----- | ---------- | -------------- | ---------------------- | ------------ | --------- |
| A/B/C | e.g., Lint | `npm run lint` | CI workflow run URL    | ReviewerName | DateTime  |

---

## 🔄 Failure Handling

If any check **fails**:

1. 🔴 **Halt** release immediately.
2. 🔄 **Rollback** using [DNS.md Rollback Procedures](DNS.md#rollback-procedures).
3. 📣 **Notify** stakeholders via incident channels.
4. 📝 Log incident link in the [governance ledger](../governance/ledger).
5. 📅 Schedule retrospective within 48h.

---

## 📚 Appendix

### Severity Levels

| Level | Description                      |
| ----- | -------------------------------- |
| P0    | Outage / full production failure |
| P1    | Major degradation / high impact  |
| P2    | Moderate impact, user-visible    |
| P3    | Minor / cosmetic issues          |

### RACI Chart

| Task             | Responsible | Accountable | Consulted | Informed |
| ---------------- | ----------- | ----------- | --------- | -------- |
| Pre-merge review | Engineer    | Dev Lead    | Security  | Product  |
| Release approval | Compliance  | Product     | SRE       | All      |

### Glossary

- **SAST**: Static Application Security Testing
- **IaC**: Infrastructure as Code
- **DPIA**: Data Protection Impact Assessment
- **SBOM**: Software Bill of Materials

### QuantumPoly-Specific Resources

**CI/CD Workflows:**

- [ci.yml](../.github/workflows/ci.yml) - Main CI pipeline (lint, test, build)
- [a11y.yml](../.github/workflows/a11y.yml) - Accessibility validation
- [seo-validation.yml](../.github/workflows/seo-validation.yml) - SEO checks
- [e2e-tests.yml](../.github/workflows/e2e-tests.yml) - End-to-end Playwright tests
- [perf.yml](../.github/workflows/perf.yml) - Performance benchmarking
- [vercel-deploy.yml](../.github/workflows/vercel-deploy.yml) - Deployment pipeline

**Governance System:**

- [Governance README](../governance/README.md) - Ethical governance framework
- [Ledger System](../governance/ledger) - Transparency ledger
- [Ethics Dashboard](/dashboard) - Public metrics dashboard

**Operational Runbooks:**

- [DNS.md](DNS.md) - DNS connection and verification procedures
- [Release workflow](.) - Deployment documentation

**Automation Scripts:**

- [validate-checklist.sh](../scripts/validate-checklist.sh) - Checklist validation
- [audit-sync-ledger.sh](../scripts/audit-sync-ledger.sh) - Governance ledger sync
- [ledger-update.mjs](../scripts/ledger-update.mjs) - Ethics ledger updates
- [verify-ledger.mjs](../scripts/verify-ledger.mjs) - Ledger integrity verification

### Compliance Alignment

| Framework          | Requirement                            | Implementation                   |
| ------------------ | -------------------------------------- | -------------------------------- |
| **GDPR**           | Right to access audit logs             | Public governance ledger         |
| **ISO 27001**      | Change management documentation        | This checklist + ledger          |
| **SOC 2 Type II**  | Audit trail for infrastructure changes | Immutable append-only ledger     |
| **EU AI Act 2024** | Transparency and record-keeping        | Cryptographically signed entries |

---

## 🔗 Integration Notes

**Automated Validation:**
This checklist is automatically validated before production deployments via the `audit-check` job in [vercel-deploy.yml](../.github/workflows/vercel-deploy.yml).

**Governance Ledger Sync:**
Upon successful production deployment, the sign-off matrix is automatically synchronized to the governance ledger at `/governance/ledger/releases/` via the `governance-ledger` job.

**Manual Updates:**
To manually update this checklist before a release:

1. Check applicable boxes: `[ ]` → `[x]`
2. Fill in Sign-Off Matrix with Name and Date
3. Add Evidence Table entries
4. Commit changes: `git commit -m "chore(release): Complete review checklist for vX.Y.Z"`

**Validation Command:**

```bash
bash scripts/validate-checklist.sh
```

**Expected Output (Pass):**

```
✅ Release Review Checklist Validation PASSED
Stage A: 14/14 checks complete
Stage B: 13/13 checks complete
Stage C: 12/12 checks complete
Sign-Off Matrix: 4/4 roles signed
Blockers: None active
Overall: 100% complete
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-23  
**Maintained By:** DevOps & SRE Team  
**Next Review:** Quarterly or before major releases

---

**End of Release Review Checklist**
