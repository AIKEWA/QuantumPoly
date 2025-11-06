# Audit Storage Directory

**Block 9.9 — Human Audit & Final Review Layer**

---

## Purpose

This directory stores human sign-off records for final audit and release authorization. It serves as the structured storage layer for the dual-storage system (JSONL + ledger).

---

## File Structure

```
governance/audits/
├── README.md              # This file
└── signoffs.jsonl         # Human sign-off records (append-only)
```

---

## Sign-Off Record Format

Each line in `signoffs.jsonl` is a complete JSON object representing one human sign-off:

```json
{
  "review_id": "review-lead-engineer-2025-11-07T15-02-11-789Z-a1b2c3d4",
  "reviewer_name": "Aykut Aydin",
  "role": "Lead Engineer",
  "review_scope": [
    "System Architecture & Security Baseline",
    "Block 9.0-9.8 Implementation Verification"
  ],
  "decision": "approved",
  "exceptions": [],
  "notes": "All technical requirements met. Integrity monitoring operational.",
  "integrity_snapshot": {
    "timestamp": "2025-11-07T15:02:00Z",
    "system_state": "healthy",
    "last_verification": "2025-11-07T00:00:00Z",
    "verification_scope": "all",
    "ledger_status": {
      "governance": "valid",
      "consent": "valid",
      "federation": "valid",
      "trust_proofs": "valid"
    },
    "open_issues": [],
    "recent_repairs": [],
    "pending_human_reviews": 0,
    "global_merkle_root": "abc123..."
  },
  "timestamp": "2025-11-07T15:02:11Z",
  "signature_hash": "def456..."
}
```

---

## Required Reviewer Roles

Four roles must provide sign-off before release:

1. **Lead Engineer** — System architecture, security baseline, technical implementation
2. **Governance Officer** — Policy alignment, ethical compliance, risk disclosure
3. **Legal Counsel** — Jurisdictional compliance, liability review, legal obligations
4. **Accessibility Reviewer** — WCAG 2.2 AA compliance, inclusive design verification

---

## Sign-Off Workflow

### 1. Review Dashboard Access

Authorized reviewers access the review dashboard at:

```
/[locale]/governance/review
```

Authentication: API key via `Authorization: Bearer <key>` header

### 2. Integrity Status Check

Dashboard displays live integrity status from Block 9.8:

- System state (healthy / degraded / attention_required)
- Ledger health status
- Open issues
- Pending human reviews

### 3. Sign-Off Submission

Reviewer provides:

- Name and role
- Review scope (areas reviewed)
- Decision (approved / rejected / approved_with_exceptions)
- Exception justifications (if approving with `attention_required` state)
- Optional notes

### 4. Record Storage

Sign-off written to `signoffs.jsonl` with:

- Unique review ID
- Timestamp
- Integrity snapshot (full state at time of review)
- Signature hash (SHA-256 of record)

### 5. Ledger Finalization

After all four roles sign off, `scripts/finalize-audit.mjs` creates final ledger entry:

```bash
npm run audit:finalize
```

This appends a `final_audit_signoff` entry to `governance/ledger/ledger.jsonl`.

---

## Conditional Approval

If integrity state is `attention_required`, reviewers may still approve **with explicit exception justifications**:

```json
{
  "decision": "approved_with_exceptions",
  "exceptions": [
    {
      "issue_description": "Minor contrast ratio issue in consent modal footer",
      "rationale": "Issue affects non-critical informational text only. Does not impact usability or legal compliance.",
      "mitigation_plan": "Schedule contrast fix in next maintenance cycle. Update color tokens in design system.",
      "mitigation_owner": "UI/UX Lead",
      "deadline": "2025-11-30"
    }
  ]
}
```

**Requirements for conditional approval:**

- Each exception must include: issue description, rationale, mitigation plan, owner, deadline
- Exceptions must be documented in final audit dossier
- Critical ledger failures (status: `critical`) block release even with exceptions

---

## Data Retention

- **Sign-off records:** Retained indefinitely for audit trail
- **Current release window:** Last 7 days of sign-offs considered "current"
- **Historical records:** All previous sign-offs remain accessible

---

## Privacy & Security

**Personal Data:**

- Reviewer names are recorded (required for accountability)
- No email addresses, IP addresses, or user IDs stored
- Notes field should not contain sensitive personal information

**Integrity:**

- Each record includes SHA-256 signature hash
- Tampering detection via hash verification
- Append-only storage (no deletions or modifications)

**Access Control:**

- Write access: Authenticated reviewers only (API key)
- Read access: Public summaries via `/api/audit/history` (no sensitive data)
- Full records: Internal access only

---

## Verification

### Verify Sign-Off Integrity

```bash
node scripts/verify-audit-signoffs.mjs
```

Checks:

- Valid JSON structure
- Complete required fields
- Signature hash matches computed hash
- Chronological order
- No duplicate review IDs

### Query Sign-Off Status

```bash
npm run audit:status
```

Returns:

- Completed sign-offs by role
- Readiness state (ready_for_review / blocked / approved)
- Blocking issues (if any)

---

## Compliance

**GDPR Compliance:**

- Art. 5(2): Accountability — Named human responsibility
- Art. 25: Privacy by design — Minimal personal data collection

**DSG 2023 Compliance:**

- Art. 19: Data security — Cryptographic integrity verification
- Art. 25: Transparency — Public audit history (anonymized)

**WCAG 2.2 AA:**

- Review dashboard accessible to all reviewers
- Keyboard navigation, screen reader support
- Manual accessibility audit required before sign-off

---

## Contact

**Governance Questions:** governance@quantumpoly.ai  
**Technical Issues:** engineering@quantumpoly.ai  
**Audit Coordination:** audit@quantumpoly.ai

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0  
**Status:** Operational

