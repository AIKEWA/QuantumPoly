# Federation Governance

**Block 9.6 — Collective Ethics Graph**

This directory contains governance artifacts for the federated transparency network.

## Overview

The Collective Ethics Graph is a network in which each node is a governance-aware system (e.g., QuantumPoly instance A, QuantumPoly instance B, etc.). Each node:

- Publishes verifiable summaries of its internal ethics state
- Periodically verifies the integrity proofs of its peers
- Logs the result of that verification

This is NOT a data-sharing network of personal data. This IS a trust lattice for ethical posture.

## Directory Structure

```
governance/federation/
├── ledger.jsonl              # Federation verification events
├── trust-reports/            # Historical trust snapshots
└── README.md                 # This file
```

## Ledger Format

The federation ledger (`ledger.jsonl`) uses JSON Lines format (one JSON object per line). Each entry represents a federation event:

### Entry Types

1. **federation_integration** - Initial federation setup
2. **federation_verification** - Partner verification results
3. **partner_registration** - New partner added
4. **webhook_notification** - Webhook received from partner

### Example Entry

```json
{
  "entry_id": "federation-verification-2025-11-01",
  "ledger_entry_type": "federation_verification",
  "block_id": "9.6",
  "title": "Daily Federation Verification",
  "status": "approved",
  "approved_date": "2025-11-01",
  "timestamp": "2025-11-01T00:00:00Z",
  "responsible_roles": ["Federation Trust Officer", "Governance Officer"],
  "summary": "Verified 3 partners. 2 valid, 1 stale, 0 flagged.",
  "next_review": "2025-11-02",
  "verification_results": [...],
  "hash": "...",
  "merkleRoot": "...",
  "signature": null
}
```

## Trust Reports

Historical trust report snapshots are stored in `trust-reports/` with the naming convention:

```
trust-report-YYYY-MM-DD-HHmmss.json
```

Each report contains:
- Network trust summary
- Per-partner verification results
- Trust score and health status
- Network Merkle aggregate

## Verification Process

1. **Scheduled Verification** - Daily GitHub Actions workflow fetches partner records
2. **Merkle Root Comparison** - Compares received roots with previous values
3. **Trust Status Calculation** - Determines valid/stale/flagged/error status
4. **Ledger Append** - Logs verification results immutably
5. **Report Generation** - Saves snapshot to trust-reports/

## Privacy & Compliance

- **Zero Personal Data** - Only aggregate trust states are exchanged
- **GDPR/DSG Compliant** - No user-level data crosses federation links
- **Cryptographic Proof** - All verification events are hashed and chained
- **Public Accountability** - Verification results available via public APIs

## APIs

- `GET /api/federation/verify` - Per-partner trust states
- `GET /api/federation/trust` - Network-level summary
- `GET /api/federation/record` - This instance's FederationRecord
- `POST /api/federation/register` - Admin-only partner registration
- `POST /api/federation/notify` - Webhook notifications

## Documentation

See `BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md` for complete specification.

---

**Compliance Baseline:** Stage VI — Federated Transparency  
**Last Updated:** 2025-10-26  
**Maintained By:** Federation Trust Officer, Governance Officer

