# Integrity Monitoring

**Block 9.8 — Continuous Integrity & Self-Healing**

This directory contains governance integrity verification reports and autonomous repair records.

## Overview

The continuous integrity monitoring system automatically verifies:

- Ledger chain consistency (hashes, timestamps, signatures)
- Federation partner proof validity
- Trust proof freshness
- Temporal consistency
- Cross-reference validity
- Compliance stage drift detection

## Directory Structure

```
governance/integrity/
├── reports/
│   ├── 2025-11-07.json
│   ├── 2025-11-08.json
│   └── ...
└── README.md (this file)
```

## Report Format

Each daily report (`YYYY-MM-DD.json`) contains:

```json
{
  "timestamp": "ISO 8601 timestamp",
  "verification_scope": ["all"],
  "total_issues": 0,
  "auto_repaired": 0,
  "requires_human_review": 0,
  "issues": [],
  "ledger_status": {
    "governance": "valid",
    "consent": "valid",
    "federation": "valid",
    "trust_proofs": "valid"
  },
  "global_merkle_root": "SHA-256 hash",
  "system_state": "healthy"
}
```

## System States

- **healthy**: No issues detected, all ledgers valid
- **degraded**: Minor issues or recent auto-repairs, no critical issues
- **attention_required**: Critical issues pending human review

## Ledger Health Status

- **valid**: Ledger is consistent and up-to-date
- **degraded**: Minor inconsistencies or stale data
- **critical**: Integrity breaks or missing critical data

## Issue Classifications

### Auto-Repairable (Conservative Scope)

- `stale_date`: Overdue review dates → Updated to `ATTENTION_REQUIRED`
- `minor_inconsistency`: Formatting issues (escalated for review)

### Escalate Immediately

- `hash_mismatch`: Hash mismatches indicating tampering
- `missing_reference`: Missing critical documents
- `integrity_break`: Structural ledger corruption
- `compliance_downgrade`: Silent compliance stage downgrades
- `attestation_expired`: Expired trust proofs
- `federation_stale`: Outdated federation verifications

## Autonomous Repair Entries

All repairs are logged to `governance/ledger/ledger.jsonl` with entry type `autonomous_repair`.

**Applied Repairs:**

```json
{
  "entry_id": "autonomous_repair-2025-11-07T13:45Z-abc123",
  "ledger_entry_type": "autonomous_repair",
  "status": "applied",
  "issue_classification": "stale_date",
  "original_state": { "next_review": "2025-05-01" },
  "new_state": { "next_review": "ATTENTION_REQUIRED" },
  "rationale": "Automated escalation: review date exceeded by 190 days"
}
```

**Pending Human Review:**

```json
{
  "entry_id": "autonomous_repair-2025-11-07T14:00Z-def456",
  "ledger_entry_type": "autonomous_repair",
  "status": "pending_human_review",
  "issue_classification": "hash_mismatch",
  "requires_followup_by": "2025-11-10T00:00:00Z",
  "followup_owner": "Governance Officer"
}
```

## Verification Schedule

- **Automated**: Daily at 00:00 UTC via GitHub Actions
- **Manual**: `npm run integrity:verify`
- **Dry Run**: `npm run integrity:verify:dry-run`

## Notification System

Critical issues trigger:

1. **Ledger Entry**: `autonomous_repair` with `status: pending_human_review`
2. **Email**: To `GOVERNANCE_OFFICER_EMAIL` (if configured)
3. **Webhook**: To `INTEGRITY_WEBHOOK_URL` (if configured)

## Response Time SLA

- **Critical**: 1 business day
- **High**: 2 business days
- **Medium**: 5 business days
- **Low**: 7 business days

## Public API

Current integrity status available at:

```
GET /api/integrity/status
```

Rate limit: 60 requests/minute per IP

## Documentation

- [Block 9.8 Implementation](../../BLOCK09.8_CONTINUOUS_INTEGRITY.md)
- [Developer Guide](../../docs/integrity/INTEGRITY_README.md)
- [Integrity Dashboard](/governance/integrity)

---

**Compliance:** GDPR Art. 5(2), DSG 2023 Art. 19, 25  
**Privacy:** Zero personal data in integrity reports  
**Auditability:** Full audit trail in governance ledger
