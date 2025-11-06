# Ethical Governance System

## Overview

This directory contains the infrastructure for QuantumPoly's Ethical Governance Dashboard, including the transparency ledger, cryptographic keys, and compliance documentation.

---

## Directory Structure

```
governance/
├── README.md                    # This file
├── ledger/
│   └── ledger.jsonl            # Immutable transparency ledger (JSON Lines)
└── keys/
    ├── ethical.pub             # Public GPG key for signature verification
    └── .gitignore              # Prevents accidental commit of private keys
```

---

## Transparency Ledger

### Format

The ledger uses **JSON Lines** format (`.jsonl`), where each line is a complete JSON object representing one audit entry.

### Entry Structure

```json
{
  "id": "2025-10-19-001",
  "timestamp": "2025-10-19T12:00:00Z",
  "commit": "a3f2b8c",
  "eii": 93.5,
  "metrics": {
    "seo": 92,
    "a11y": 97,
    "performance": 91,
    "bundle": 94
  },
  "hash": "d5f81c6e...d9b",
  "merkleRoot": "a3f2...b8c",
  "signature": "-----BEGIN PGP SIGNATURE-----..."
}
```

### Properties

- **id:** Unique entry identifier (format: `YYYY-MM-DD-NNN`)
- **timestamp:** ISO 8601 UTC timestamp
- **commit:** Git commit hash when metrics were collected
- **eii:** Ethical Integrity Index (0-100)
- **metrics:** Individual category scores
- **hash:** SHA256 hash of all source artifacts
- **merkleRoot:** Merkle tree root of all metric hashes
- **signature:** GPG detached signature (optional, if GPG available)

---

## Cryptographic Verification

### Hash Verification

Each entry's `hash` field is a SHA256 digest computed from the source metrics data. To verify:

```bash
# Automated verification
npm run ethics:validate

# Or check manually
echo '{"metrics":{"seo":92,"a11y":97,...}}' | sha256sum
```

### Merkle Tree

The `merkleRoot` field represents a Merkle tree built from all individual metric hashes. This enables:

- Efficient verification of data integrity
- Detection of any tampering with individual metrics
- Scalable proof of inclusion

### GPG Signatures

Entries are signed with a GPG key to prove:

- **Authenticity:** Entry created by authorized system
- **Non-repudiation:** Cannot deny creation of entry
- **Integrity:** Entry has not been modified since signing

To verify signatures:

```bash
# Automated verification
npm run ethics:verify-ledger

# Or verify manually
gpg --import governance/keys/ethical.pub
gpg --verify signature.asc data.txt
```

---

## Immutability Guarantees

### Append-Only

The ledger is append-only by design:

- New entries added to end of file
- Existing entries never modified or deleted
- Violations detectable through hash chain verification

### Tamper Detection

Any modification to the ledger will:

- Break hash chain consistency
- Invalidate GPG signatures
- Be detected by verification script

### Auditability

All entries are:

- Timestamped with Git commit references
- Cryptographically signed
- Publicly accessible
- Independently verifiable

---

## Usage

### View Ledger

**Web Interface:**
Navigate to `/dashboard/ledger` in the application

**Command Line:**

```bash
cat governance/ledger/ledger.jsonl | jq
```

### Add Entry

Entries are automatically added via CI pipeline:

```bash
npm run ethics:aggregate    # Collect metrics
npm run ethics:validate     # Validate data
npm run ethics:ledger-update # Append to ledger
```

### Verify Integrity

```bash
npm run ethics:verify-ledger
```

This checks:

- JSON structure validity
- Chronological ordering
- Hash format consistency
- GPG signatures (if available)
- Entry type validation (EII baseline, feedback synthesis)

---

## Feedback Synthesis System

**Introduced:** 2025-10-25 (Block 8.7)  
**Framework Documentation:** `governance/feedback/README.md`

### Overview

The Ethical Feedback Synthesis System transforms stakeholder reviews into structured, traceable governance entries. This enables continuous improvement across technical, ethical, and communication dimensions while preserving anonymity and maintaining constructive professional discourse.

### Key Features

- **Structured Collection:** Standardized templates for evidence-based feedback
- **Ethical Categorization:** Technical, Ethical, and Communication findings
- **Governance Integration:** Full ledger traceability with machine-readable exports
- **Quarterly Cycles:** Regular review cadence with ad-hoc emergency reviews
- **Anonymity Protection:** Reviewers choose attribution level (public, anonymized, restricted)

### Feedback Entry Types

Feedback synthesis creates ledger entries with type `feedback-synthesis`:

```json
{
  "id": "feedback-2025-Q4-validation",
  "timestamp": "2025-10-25T12:00:00Z",
  "commit": "...",
  "entryType": "feedback-synthesis",
  "cycleId": "2025-Q4-validation",
  "metrics": {
    "totalFindings": 9,
    "criticalFindings": 1,
    "resolvedFindings": 0
  },
  "artifactLinks": [
    "governance/feedback/cycles/2025-Q4-validation/synthesis-report.md",
    "governance/feedback/cycles/2025-Q4-validation/raw-findings.json"
  ],
  "hash": "...",
  "merkleRoot": "...",
  "signature": null
}
```

### Submit Feedback

**Templates:** `governance/feedback/templates/feedback-collection-form.md`  
**Email:** trust@quantumpoly.ai or governance@quantumpoly.ai  
**GitHub:** Open issue with labels `feedback` and `governance`

**Anonymity Options:**
- Public (name visible)
- Anonymized (role only)
- Restricted (governance team only)

### Review Cycle Schedule

- **Q4 2025:** Initial validation cycle (demonstration)
- **Q1 2026:** Post-launch feedback synthesis
- **Q2 2026+:** Ongoing quarterly cycles
- **Ad-hoc:** Emergency cycles for critical findings (P0)

### Aggregate Feedback

Process feedback synthesis reports and integrate into ledger:

```bash
npm run feedback:aggregate -- --cycle 2025-Q4-validation
```

This script:
- Validates raw-findings.json against schema
- Computes artifact hashes (SHA256)
- Generates ledger entry
- Appends to ledger.jsonl
- Verifies integrity

### Documentation

- **Framework Guide:** `governance/feedback/README.md`
- **Submission Guide:** `docs/governance/FEEDBACK_SUBMISSION_GUIDE.md`
- **Templates:** `governance/feedback/templates/`
- **Schema:** `governance/feedback/schema/feedback-entry.schema.json`
- **Onboarding:** `ONBOARDING.md` § "Providing Feedback and Reviews"

### Ledger Entry Types

The ledger supports multiple entry types:

- **`eii-baseline`** — Ethical Integrity Index baseline measurements
- **`feedback-synthesis`** — Quarterly feedback synthesis reports  
- **`audit_closure`** — Audit closure and compliance baselines
- **`legal_compliance`** — Legal and regulatory compliance milestones

Each entry type has specific required fields validated by the verification script.

### Export Ledger

**JSON Lines (raw):**

```bash
cp governance/ledger/ledger.jsonl exported-ledger.jsonl
```

**JSON Array:**

```bash
cat governance/ledger/ledger.jsonl | jq -s '.' > ledger-array.json
```

**API:**

```bash
curl https://your-domain.com/api/legal/export?format=json
```

---

## Legal Compliance

**Block 9.0 — Legal Compliance Baseline**  
**Date:** October 26, 2025  
**Status:** ✅ Approved

QuantumPoly has established a comprehensive legal compliance baseline for public website launch:

- **Imprint (Impressum):** Fully compliant with German TMG § 5, Swiss UWG Art. 3, and MStV § 18 Abs. 2
- **Privacy Policy:** GDPR/DSG-compliant with transparent data processing disclosures
- **Languages:** German (primary) and English (complete)
- **Hosting Provider:** Vercel Inc. (USA) with GDPR safeguards (Standard Contractual Clauses)
- **Tracking Status:** Zero tracking tools currently active (consent banner planned for future)

**Documentation:**
- Master Summary: `BLOCK9.0_LEGAL_COMPLIANCE_BASELINE.md`
- Imprint (DE): `content/policies/imprint/de.md` (v1.0.0)
- Imprint (EN): `content/policies/imprint/en.md` (v1.0.0)
- Privacy Policy (DE): `content/policies/privacy/de.md` (v1.0.0)
- Privacy Policy (EN): `content/policies/privacy/en.md` (v1.0.0)

**Ledger Entry:** `legal-compliance-block9.0` (October 26, 2025)

**Next Review:** April 26, 2026 (6 months)

---

## Compliance

### GDPR

- **Data Minimization:** Only aggregate technical metrics stored
- **No Personal Data:** Zero PII collected or processed
- **Right to Access:** Full ledger publicly accessible
- **Right to Portability:** JSON/JSONL export available

### EU AI Act 2024

- **Transparency:** Public audit trail maintained
- **Explainability:** Scoring methodology documented
- **Record-Keeping:** Complete history preserved
- **Human Oversight:** Manual verification tools provided

### ISO 42001

- **Process Evidence:** CI pipeline logs
- **Continuous Monitoring:** Automated validation
- **Risk Management:** Tamper detection mechanisms

---

## Troubleshooting

### Ledger Verification Fails

1. **Check file integrity:**

   ```bash
   cat governance/ledger/ledger.jsonl | jq empty
   ```

2. **Verify GPG key:**

   ```bash
   gpg --import governance/keys/ethical.pub
   gpg --list-keys
   ```

3. **Review recent changes:**
   ```bash
   git log -- governance/ledger/ledger.jsonl
   ```

### Signature Verification Fails

1. **Import public key:**

   ```bash
   gpg --import governance/keys/ethical.pub
   ```

2. **Trust key:**
   ```bash
   gpg --edit-key KEY_ID
   trust
   5 (ultimate)
   quit
   ```

### Ledger Growing Too Large

The ledger is designed to be append-only, but if size becomes an issue:

- Archive old entries (>1 year) to separate file
- Document archival in metadata
- Maintain hash chain integrity

---

## Maintenance

### Regular Tasks

- **Daily:** Automated via CI pipeline
- **Weekly:** Review ledger statistics
- **Monthly:** Verify random sample of signatures
- **Quarterly:** Full integrity audit

### Key Rotation

Follow the procedure in `/docs/governance/KEY_MANAGEMENT.md`:

1. Generate new key pair
2. Export new public key
3. Update CI secrets
4. Document rotation
5. Keep old key for historical verification

---

## References

- **Compliance Framework:** `/docs/governance/COMPLIANCE_FRAMEWORK.md`
- **Scoring Methodology:** `/docs/governance/ETHICAL_SCORING_METHODOLOGY.md`
- **Key Management:** `/docs/governance/KEY_MANAGEMENT.md`
- **Dashboard UI:** `/dashboard`
- **API Documentation:** `/docs/NEWSLETTER_API.md` (similar structure)

---

## Contact

For questions about the ethical governance system:

- **Technical:** Open issue in GitHub repository
- **Legal/Compliance:** Refer to project maintainers
- **Security:** Follow responsible disclosure policy

**Last Updated:** 2025-10-19
