# Feedback Cycle Archive

This directory stores completed feedback cycles that are older than 1 year. Archival ensures the active `cycles/` directory remains manageable while preserving historical governance records for auditability.

## Archival Policy

**Criteria for Archival:**
- Feedback cycle completed more than 1 year ago
- All action items resolved or explicitly deferred
- Cycle referenced in at least one governance ledger entry
- No pending secondary validation or disputes

**Archival Process:**
1. Verify cycle completion status
2. Move entire cycle directory from `cycles/[cycle-id]/` to `archive/[cycle-id]/`
3. Update metadata.json with archival date and reason
4. Verify ledger entry references remain valid (relative paths updated if necessary)
5. Document archival in governance ledger with entry type `feedback-cycle-archived`

## Restoration

Archived cycles can be restored to active status if:
- Reopened action item requires review
- Historical precedent needed for current cycle
- Audit or compliance review requests historical data

**Restoration Process:**
1. Move cycle directory from `archive/[cycle-id]/` back to `cycles/[cycle-id]/`
2. Add restoration note to metadata.json
3. Document restoration reason in governance ledger

## Access and Verification

All archived cycles remain:
- Publicly accessible in repository
- Verifiable via governance ledger references
- Cryptographically validated (hash integrity maintained)
- GPG signed (if Block 8 signing was operational during cycle)

**To verify an archived cycle:**

```bash
# Verify ledger references resolve correctly
cat governance/ledger/ledger.jsonl | jq -r 'select(.entryType == "feedback-synthesis") | .artifactLinks[]'

# Verify specific archived cycle hash
cat governance/feedback/archive/[cycle-id]/raw-findings.json | sha256sum
```

## Retention Policy

**Minimum Retention:** 7 years (compliance with ISO 42001 and typical audit requirements)

**Permanent Retention:** Cycles involving:
- Critical security findings
- Compliance violations
- Ethical breaches
- Legal proceedings

**Deletion (if applicable after retention period):**
1. Governance Lead approval required
2. Legal counsel confirmation of no ongoing obligations
3. Ledger entry updated to reflect deletion (with hash of deleted content preserved)
4. Deletion documented in governance ledger with justification

## Current Status

**Active Cycles:** `../cycles/`  
**Archived Cycles:** None yet (framework established 2025-10-25)  
**First Archival Expected:** Q4 2026 (when 2025-Q4-validation reaches 1-year age)

---

**Policy Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Review Cycle:** Annually

