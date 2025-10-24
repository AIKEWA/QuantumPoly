<!-- FILE: GOVERNANCE.rationale.md -->

# CI/CD Governance Rationale & Compliance

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Audience:** Auditors, Compliance Officers, Security Reviewers  
**Classification:** Public (Transparency Document)

---

## Purpose

This document justifies the controls, approval gates, and governance mechanisms embedded in the QuantumPoly CI/CD pipeline. It maps these controls to regulatory standards, explains the human-in-the-loop approval rationale, defines change categories, and documents audit artifact requirements.

---

## Standards Mapping

### SOC 2 Type II (Trust Services Criteria)

**CC6.6 – Logical and Physical Access Controls**

| Control                        | Implementation                                                          | Verification                                           |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Separation of duties           | CI workflow (`contents: read`) vs. Release workflow (`contents: write`) | Workflow permission audit in `.github/workflows/*.yml` |
| Least privilege access         | Secrets scoped to repository, environment-specific approvals            | GitHub Settings → Secrets, Environments                |
| Manual approval for production | GitHub Environment `production` with required reviewers                 | Deployment logs show approver identity                 |

**CC7.2 – System Monitoring**

| Control                        | Implementation                                         | Verification                            |
| ------------------------------ | ------------------------------------------------------ | --------------------------------------- |
| Automated quality gates        | 6 parallel CI jobs (lint, typecheck, test, a11y, etc.) | Workflow run logs with pass/fail status |
| Coverage threshold enforcement | Jest global: 80%+, API endpoints: 90%+                 | Coverage reports in artifacts           |
| Accessibility compliance       | Playwright + axe-core, WCAG 2.1 Level AA               | A11y violation reports                  |

**CC7.3 – System Operations**

| Control                | Implementation                                       | Verification                               |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------ |
| Deployment audit trail | Governance ledger (`governance/ledger/ledger.jsonl`) | Cryptographic hash chain verification      |
| Artifact retention     | 90 days for governance-critical artifacts            | GitHub Actions artifact retention policies |
| Immutable logs         | Ledger append-only, GPG-signed entries               | `npm run ethics:verify-ledger`             |

---

### ISO 27001:2022 (Information Security Management)

**A.8.3 – Media Handling**

| Control           | Implementation                                          | Verification                             |
| ----------------- | ------------------------------------------------------- | ---------------------------------------- |
| Secret management | GitHub Secrets with access control                      | Repository → Settings → Secrets          |
| Secret rotation   | 90-day rotation for VERCEL_TOKEN, 365-day for GPG keys  | `SECRETS.inventory.md` rotation schedule |
| Key storage       | GPG private keys in GitHub Secrets, public keys in repo | `governance/keys/ethical.pub`            |

**A.12.1 – Operational Procedures**

| Control             | Implementation                                   | Verification                     |
| ------------------- | ------------------------------------------------ | -------------------------------- |
| Change management   | Tag + Release + Manual approval for production   | GitHub Releases, deployment logs |
| Rollback procedures | Documented in `TROUBLESHOOTING.and.ROLLBACK.md`  | Runbook testing during QA        |
| Incident response   | Break-glass procedures in `SECRETS.inventory.md` | Incident log review              |

**A.12.4 – Logging and Monitoring**

| Control             | Implementation                                         | Verification                          |
| ------------------- | ------------------------------------------------------ | ------------------------------------- |
| Audit logging       | Workflow run logs (90-day retention via artifacts)     | GitHub Actions audit log              |
| Deployment tracking | Governance ledger with commit SHA, approver, timestamp | Ledger entries JSON schema validation |
| Coverage tracking   | Test coverage reports merged across Node versions      | `coverage-summary.json` artifacts     |

---

### EU AI Act 2024 (Transparency & Accountability)

**Article 13 – Transparency and Provision of Information**

| Requirement         | Implementation                                       | Evidence                                         |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Public transparency | Governance ledger accessible at `/dashboard/ledger`  | Public dashboard deployment                      |
| Explainability      | EII (Ethical Integrity Index) methodology documented | `docs/governance/ETHICAL_SCORING_METHODOLOGY.md` |
| Record-keeping      | Immutable ledger with 7-year retention (proposed)    | Ledger append-only design                        |

**Article 14 – Human Oversight**

| Requirement         | Implementation                                      | Evidence                                     |
| ------------------- | --------------------------------------------------- | -------------------------------------------- |
| Human-in-the-loop   | Manual approval required for production deployments | GitHub Environment protection rules          |
| Review capabilities | Staging deployment for QA validation                | Staging URL provided in release workflow     |
| Override mechanisms | Emergency deployment via break-glass approval       | `SECRETS.inventory.md` break-glass procedure |

---

### ISO 42001:2023 (AI Management System)

**6.1 – Risk Management**

| Control                       | Implementation                                      | Verification                     |
| ----------------------------- | --------------------------------------------------- | -------------------------------- |
| Automated risk assessment     | Quality gates fail deployment if thresholds not met | CI workflow failure blocks merge |
| Performance monitoring        | Lighthouse performance ≥90, bundle <250KB           | Performance gate artifacts       |
| Accessibility risk mitigation | Automated axe-core scans, WCAG 2.1 Level AA         | A11y test reports                |

**7.2 – Competence & Awareness**

| Control            | Implementation                                         | Verification                       |
| ------------------ | ------------------------------------------------------ | ---------------------------------- |
| Documentation      | Comprehensive CI/CD documentation suite (7 files)      | This document and cross-references |
| Training materials | Local development parity commands in `README.CI-CD.md` | Developer onboarding checklist     |

---

## Human-in-the-Loop Approval Gates

### Rationale for Manual Approval

**1. Risk-Based Decision Making**

Production deployments carry inherent risks that automated systems cannot fully assess:

- **User Impact:** Changes affect public-facing website with potential brand/reputation impact
- **Legal Compliance:** Some jurisdictions require human oversight for AI-related deployments (EU AI Act Article 14)
- **Business Context:** Timing of releases may depend on external factors (marketing campaigns, partner agreements)

**2. Ethical Governance**

QuantumPoly's commitment to ethical technology requires human judgment:

- **EII Score Review:** Approver verifies Ethical Integrity Index (EII) ≥ 90 before production release
- **Policy Compliance:** Approver confirms alignment with trust policies and governance framework
- **Public Accountability:** Approver identity recorded in governance ledger for transparency

**3. Multi-Layered Defense**

Manual approval prevents single-point-of-failure scenarios:

- Automated tests catch technical defects
- Human review catches context-dependent issues (UX regressions, brand alignment)
- Separation of duties reduces insider threat risk

---

### Approval Gate Configuration

**GitHub Environment:** `production`

**Configuration Location:** Repository → Settings → Environments → `production`

**Protection Rules:**

- ✅ **Required reviewers:** Minimum 1 designated reviewer
- ✅ **Deployment branches:** Only tagged versions (`refs/tags/v*`)
- ⚠️ **Wait timer:** 0 minutes (manual approval only, no forced delay)

**Designated Reviewers (Roles):**
| Role | Responsibility | Approval Criteria |
|------|---------------|-------------------|
| **DevOps Lead** | Infrastructure, CI/CD, deployment pipeline changes | Verify staging deployment success, review infrastructure changes |
| **Product Owner** | Feature releases, UX changes, content updates | Verify UX alignment, review user-facing changes |
| **Compliance Officer** | Legal/governance-sensitive deployments, policy updates | Verify EII ≥ 90, review policy compliance |

**Approval Workflow:**

1. Developer creates tag `v*.*.*` and pushes
2. Developer creates GitHub Release with release notes
3. `validate-release` job runs automatically (verifies tag format, release exists)
4. `deploy-production` job waits for approval
5. GitHub notifies designated reviewers via email/UI
6. Reviewer verifies:
   - ✅ All CI quality gates passed
   - ✅ Staging deployment validated
   - ✅ EII score ≥ 90 (from governance job)
   - ✅ Release notes complete and accurate
   - ✅ No active incidents or security concerns
7. Reviewer clicks "Approve deployment" in GitHub Actions UI
8. Deployment proceeds automatically after approval
9. Approver identity recorded in governance ledger

---

### When Manual Approval Can Be Bypassed

**Never.** All production deployments require manual approval per governance policy.

**Emergency Override (Proposed Future Enhancement):**
For P0 incidents (production outage, critical security patch), define expedited approval process:

- Minimum approval time: 5 minutes (vs. standard: no time limit)
- Single approver required (vs. standard: may require multiple)
- Post-deployment review within 24 hours
- Incident documented in governance ledger with justification

**Current Status:** Emergency override not implemented; all deployments follow standard approval.

---

## Change Categories & Approval Matrix

### Change Category Definitions

| Category      | Description                                   | Examples                                                               | Approval Requirements                                             |
| ------------- | --------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Standard**  | Regular feature releases, planned updates     | New feature, blog post, scheduled content update                       | 1 reviewer + GitHub Release + Manual approval                     |
| **Normal**    | Bug fixes, minor improvements, maintenance    | Fix broken link, update dependency, improve error message              | 1 reviewer + GitHub Release + Manual approval                     |
| **Emergency** | Critical security patches, production outages | XSS vulnerability fix, API service restoration, data breach mitigation | 1 reviewer (expedited) + Post-hoc documentation + Incident report |

---

### Approval Matrix

| Change Type   | CI Quality Gates                      | Staging Validation | Production Approval             | Ledger Entry                | Post-Deployment Review        |
| ------------- | ------------------------------------- | ------------------ | ------------------------------- | --------------------------- | ----------------------------- |
| **Standard**  | ✅ Required                           | ✅ Required        | ✅ Manual approval (1 reviewer) | ✅ Automatic                | ⚠️ Optional (within 7 days)   |
| **Normal**    | ✅ Required                           | ✅ Required        | ✅ Manual approval (1 reviewer) | ✅ Automatic                | ⚠️ Optional (within 7 days)   |
| **Emergency** | ⚠️ May be bypassed with justification | ⚠️ May be bypassed | ✅ Manual approval (expedited)  | ✅ Automatic + Incident tag | ✅ Required (within 24 hours) |

**Notes:**

- Emergency bypasses require explicit justification documented in GitHub Release notes
- Post-deployment review validates emergency bypass was appropriate
- Repeated emergency bypasses trigger process improvement review

---

### Change Categorization Process

**Step 1: Developer Assessment**
Developer determines change category based on:

- User impact (high/medium/low)
- Security sensitivity (critical/moderate/low)
- Reversibility (easy/moderate/difficult to roll back)

**Step 2: Approver Verification**
Approver confirms categorization during manual approval review. If miscategorized:

- Request re-categorization before approval
- Document disagreement in approval comments

**Step 3: Post-Deployment Audit**
Compliance officer reviews change categorizations quarterly:

- Identify patterns of miscategorization
- Provide feedback to development team
- Update categorization criteria if needed

---

## Audit Artifacts & Retention

### Artifact Categories

| Artifact Type              | Contents                                           | Retention Period             | Storage Location                       | Purpose                                        |
| -------------------------- | -------------------------------------------------- | ---------------------------- | -------------------------------------- | ---------------------------------------------- |
| **Quality Gate Evidence**  | Lint results, type check output, test results      | 30 days                      | GitHub Actions artifacts               | Demonstrate compliance with quality standards  |
| **Coverage Reports**       | Line/branch/function coverage metrics              | 30 days                      | GitHub Actions artifacts               | Code quality metrics, regression detection     |
| **Accessibility Evidence** | Playwright reports, axe-core violation details     | 90 days                      | GitHub Actions artifacts               | WCAG 2.1 compliance, accessibility audit trail |
| **Performance Evidence**   | Lighthouse reports, bundle size measurements       | 30 days                      | GitHub Actions artifacts               | Performance regression detection               |
| **Governance Ledger**      | Deployment metadata, EII scores, approver identity | Permanent (append-only)      | `governance/ledger/ledger.jsonl`       | Regulatory compliance, public transparency     |
| **Deployment Logs**        | Workflow run logs, Vercel deployment logs          | 90 days                      | GitHub Actions logs + Vercel dashboard | Incident investigation, forensic analysis      |
| **Approval Records**       | Approver identity, approval timestamp, comments    | Permanent (GitHub audit log) | GitHub deployment history              | Accountability, compliance audits              |

---

### Retention Rationale

**30-Day Retention (Performance, Coverage):**

- Sufficient for sprint-level regression detection
- Balances storage costs with audit needs
- Extended retention available on-demand for investigations

**90-Day Retention (Accessibility, Deployment Logs):**

- Aligns with SOC 2 audit cycle (annual + quarterly reviews)
- Supports WCAG compliance documentation requirements
- Provides forensic evidence for incident response (90-day lookback typical)

**Permanent Retention (Governance Ledger, Approval Records):**

- Regulatory requirement for audit trail (ISO 27001, EU AI Act)
- Public transparency commitment (Block 6 governance dashboard)
- Enables long-term trend analysis (ethical metrics over time)

---

### Artifact Accessibility

**Internal Team Access:**

- GitHub Actions artifacts: Repository collaborators
- Governance ledger: All team members (version controlled)
- Vercel deployment logs: Organization members

**External Auditor Access:**

- Governance ledger: Public dashboard (`/dashboard/ledger`)
- Quality gate evidence: Available on request (download artifacts)
- Approval records: GitHub audit log export (requires admin)

**Public Access:**

- Governance ledger: Public dashboard
- EII scores: Public dashboard
- Deployment history (summary): Public transparency page

---

## Link to Governance Ledger

### Ledger Location

**Repository Path:** `governance/ledger/ledger.jsonl`

**Public Dashboard:** `https://www.quantumpoly.ai/dashboard/ledger` (when deployed)

**API Endpoint:** `https://www.quantumpoly.ai/api/legal/export?format=json` (proposed)

---

### Ledger Entry Schema

Each production deployment creates a ledger entry with:

```json
{
  "id": "2025-10-21-001",
  "timestamp": "2025-10-21T14:30:00Z",
  "commit": "a3f2b8c4d5e6f7890abcdef",
  "tag": "v1.0.0",
  "deploymentUrl": "https://www.quantumpoly.ai",
  "environment": "production",
  "approver": "github-username",
  "eii": 93.5,
  "metrics": {
    "seo": 92,
    "a11y": 97,
    "performance": 91,
    "bundle": 94
  },
  "hash": "sha256:d5f81c6e...d9b",
  "merkleRoot": "a3f2...b8c",
  "signature": "-----BEGIN PGP SIGNATURE-----..."
}
```

**Fields:**

- `id`: Unique entry identifier (YYYY-MM-DD-NNN)
- `timestamp`: ISO 8601 UTC deployment time
- `commit`: Git commit SHA deployed
- `tag`: Git tag (e.g., v1.0.0)
- `deploymentUrl`: Production URL
- `environment`: Always "production" for release workflow
- `approver`: GitHub username of approver (from deployment API)
- `eii`: Ethical Integrity Index (0-100)
- `metrics`: Individual category scores
- `hash`: SHA256 of source metrics data
- `merkleRoot`: Merkle tree root for tamper detection
- `signature`: GPG detached signature (if GPG configured)

---

### Ledger Verification

**Automated Verification:**

```bash
npm run ethics:verify-ledger
```

**Manual Verification:**

```bash
# Verify JSON structure
cat governance/ledger/ledger.jsonl | jq empty

# Verify chronological ordering
cat governance/ledger/ledger.jsonl | jq -r '.timestamp' | sort -c

# Verify GPG signatures (if present)
gpg --import governance/keys/ethical.pub
# Signature verification integrated in ethics:verify-ledger script
```

**Third-Party Verification:**
Public key available at `governance/keys/ethical.pub` for independent verification of ledger signatures.

---

## Compliance Audit Checklist

For auditors reviewing the CI/CD pipeline:

### Pre-Deployment Controls

- [ ] CI quality gates enforce minimum standards (lint, typecheck, test, a11y)
- [ ] Coverage thresholds configured in `jest.config.js` (≥80% global, ≥90% API)
- [ ] Accessibility tests use WCAG 2.1 Level AA standards
- [ ] Staging deployment validates changes before production

### Deployment Controls

- [ ] Production deployment requires manual approval (GitHub Environment)
- [ ] Approver identity recorded in deployment logs
- [ ] Two-key approval system enforced (tag + release + manual approval)
- [ ] Deployment artifacts retained for 90 days

### Post-Deployment Controls

- [ ] Governance ledger updated with deployment metadata
- [ ] Ledger entry includes EII score, approver, timestamp
- [ ] Ledger integrity verifiable via hash chain
- [ ] Optional: GPG signature for cryptographic verification

### Secret Management

- [ ] Secrets stored in GitHub repository settings (not in code)
- [ ] Secrets rotated per policy (90 days for tokens, 365 days for GPG keys)
- [ ] Secret rotation documented in `SECRETS.inventory.md`
- [ ] Break-glass procedure defined for emergency access

### Documentation & Training

- [ ] CI/CD documentation suite complete (7 files)
- [ ] Local development parity commands provided
- [ ] Troubleshooting runbook available
- [ ] Rollback procedures documented

---

## Continuous Improvement

### Quarterly Reviews

**Schedule:** Last week of each quarter (January, April, July, October)

**Review Scope:**

- Audit artifact retention compliance
- Secret rotation schedule adherence
- Change categorization accuracy
- Quality gate threshold effectiveness
- Approval process bottlenecks

**Reviewers:** DevOps Lead, Compliance Officer, Product Owner

**Output:** Compliance review report with action items

---

### Annual Audits

**Schedule:** Q4 (October-December)

**Audit Scope:**

- Full SOC 2 Type II readiness assessment
- ISO 27001 control effectiveness
- EU AI Act compliance gap analysis
- Governance ledger integrity verification

**External Auditor:** [To be determined based on certification goals]

**Output:** Audit report with certification recommendations

---

## Related Documentation

| Document                                         | Purpose                                      |
| ------------------------------------------------ | -------------------------------------------- |
| `README.CI-CD.md`                                | Pipeline architecture and quality gates      |
| `SECRETS.inventory.md`                           | Secret management and rotation policies      |
| `TROUBLESHOOTING.and.ROLLBACK.md`                | Operational procedures and incident response |
| `CI-CD.MAP.md`                                   | Event-to-approval matrix for quick reference |
| `governance/README.md`                           | Governance ledger structure and verification |
| `docs/governance/COMPLIANCE_FRAMEWORK.md`        | Comprehensive compliance framework           |
| `docs/governance/ETHICAL_SCORING_METHODOLOGY.md` | EII calculation methodology                  |

---

## Compliance Contact

**Primary Contact:** Compliance Officer (role-based, refer to internal directory)

**Secondary Contact:** CASP Lead Architect

**External Audit Inquiries:** Submit via GitHub issue with tag `compliance-audit`

**Incident Reporting:** Follow incident response procedure in `TROUBLESHOOTING.and.ROLLBACK.md`

---

## Version History

| Version | Date       | Changes                               | Approver            |
| ------- | ---------- | ------------------------------------- | ------------------- |
| 1.0     | 2025-10-21 | Initial governance rationale document | CASP Lead Architect |

**Next Review:** 2026-01-21 (Quarterly)

---

**Document Classification:** Public (Transparency)  
**Last Reviewed:** 2025-10-21  
**Maintained By:** Compliance Officer & DevOps Team  
**Revision:** 1.0
