# Consent Audit Ledger

## Overview

This directory contains the consent audit ledger for QuantumPoly's GDPR/DSG-compliant consent management system.

## Purpose

The consent ledger provides an immutable audit trail of all consent events, enabling:

- **GDPR Art. 7(1) Compliance:** Demonstrable consent requirement
- **GDPR Art. 30 Compliance:** Records of processing activities
- **DSG Art. 6 Compliance:** Data processing principles
- **Transparency:** Full audit trail for governance review
- **Accountability:** Evidence of user consent decisions

## Files

### `ledger.jsonl`

JSONL (JSON Lines) file containing one consent event per line.

**Schema:**

```json
{
  "userId": "string (UUID v4)",
  "timestamp": "string (ISO-8601)",
  "event": "consent_given | consent_updated | consent_revoked | banner_dismissed",
  "preferences": {
    "essential": true,
    "analytics": boolean,
    "performance": boolean
  },
  "policyVersion": "string (e.g., v1.0.0)",
  "userAgent": "string (optional)",
  "ipAddress": "string (anonymized)"
}
```

**Example Entry:**

```json
{"userId":"550e8400-e29b-41d4-a716-446655440000","timestamp":"2025-10-26T14:30:00.000Z","event":"consent_given","preferences":{"essential":true,"analytics":true,"performance":false},"policyVersion":"v1.0.0","userAgent":"Mozilla/5.0...","ipAddress":"192.168.1.0"}
```

## Data Protection

### Pseudonymization

- **User IDs:** UUID v4 generated client-side, not linked to personal identifiable information
- **IP Addresses:** Anonymized (last octet removed for IPv4, last 80 bits for IPv6)
- **User Agents:** Stored for audit purposes but contain no PII

### Retention

- Consent events are retained for **3 years** from the date of last consent update
- After retention period, records are automatically archived or deleted
- Users can request deletion of their consent records via legal@quantumpoly.ai

### Access Control

- Ledger files are **read-only** in production
- Write access restricted to API endpoint (`/api/consent`)
- Governance team has read access for audit purposes

## Usage

### Recording Consent

Consent events are automatically recorded via the `/api/consent` API endpoint when users:

1. Accept all cookies (banner)
2. Customize preferences (modal)
3. Update preferences (settings page)
4. Revoke consent

### Querying Ledger

**Count total consent events:**

```bash
wc -l governance/consent/ledger.jsonl
```

**Filter by event type:**

```bash
grep '"event":"consent_given"' governance/consent/ledger.jsonl | wc -l
```

**Extract analytics opt-in rate:**

```bash
grep '"analytics":true' governance/consent/ledger.jsonl | wc -l
```

### Verification

Run the consent ledger verification script:

```bash
npm run test:consent-storage
```

This validates:
- JSONL format integrity
- Schema compliance
- Timestamp ordering
- Policy version consistency

## Compliance Notes

### GDPR Requirements

- **Art. 7(1):** Demonstrable consent - ✅ Ledger provides proof
- **Art. 7(3):** Easy withdrawal - ✅ Settings page available
- **Art. 12(3):** Response within 30 days - ✅ Automated system
- **Art. 15:** Right to access - ✅ Export function available
- **Art. 17:** Right to erasure - ✅ Contact legal@quantumpoly.ai

### DSG 2023 Requirements

- **Art. 6:** Data processing principles - ✅ Lawfulness, transparency
- **Art. 19:** Information obligations - ✅ Privacy Policy updated
- **Art. 25:** Data security - ✅ Pseudonymization, encryption

## Governance Integration

This ledger is referenced in:

- **Main Ledger:** `governance/ledger/ledger.jsonl` (Block 9.2 baseline entry)
- **Privacy Policy:** `content/policies/privacy/en.md` (Section 3.4)
- **Documentation:** `BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md`

## Support

For questions or audit requests, contact:

- **Governance Officer:** governance@quantumpoly.ai
- **Legal/DPO:** legal@quantumpoly.ai
- **Technical Lead:** Aykut Aydin <aykut@quantumpoly.ai>

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0  
**Status:** Active

