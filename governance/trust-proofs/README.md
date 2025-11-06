# Trust Proof Storage

**Block:** 9.7 — Ethical Trust Proof & Attestation Layer  
**Purpose:** Storage for active and revoked trust proofs  
**Status:** Operational

---

## Overview

This directory contains the trust proof storage system for QuantumPoly's attestation layer. Trust proofs provide cryptographic verification of published artifacts (reports, statements, compliance documents).

---

## Storage Structure

### `active-proofs.jsonl`

Stores currently valid trust proofs in JSONL format (one JSON object per line).

**Schema:**
```json
{
  "artifact_id": "ETHICS_REPORT_2025-11-05",
  "artifact_hash": "7b3c9e4d3f2b1a0c5e6d7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7e91a",
  "token": "eyJhcnRpZmFjdF9pZCI6IkVUSElDU19SRVBPU...",
  "issued_at": "2025-11-05T13:20:00Z",
  "expires_at": "2026-02-03T13:20:00Z",
  "ledger_reference": "trust-proof-block9.7",
  "status": "active",
  "artifact_type": "ethics_report",
  "file_path": "reports/ethics/ETHICS_REPORT_2025-11-05.pdf"
}
```

**Fields:**
- `artifact_id`: Unique identifier for the artifact
- `artifact_hash`: SHA-256 hash of the artifact content
- `token`: Full trust proof token (base64 encoded)
- `issued_at`: ISO 8601 timestamp when proof was issued
- `expires_at`: ISO 8601 timestamp when proof expires (90 days default)
- `ledger_reference`: Governance ledger entry that records this proof
- `status`: "active" or "expired"
- `artifact_type`: Type of artifact (e.g., "ethics_report", "federation_proof")
- `file_path`: Relative path to the artifact file

---

### `revoked-proofs.jsonl`

Stores revoked trust proofs with revocation metadata.

**Schema:**
```json
{
  "artifact_id": "ETHICS_REPORT_2025-09-01",
  "original_token": "eyJhcnRpZmFjdF9pZCI6IkVUSElDU19SRVBPU...",
  "revoked_at": "2025-09-15T14:00:00Z",
  "reason": "Error discovered in report methodology",
  "revoked_by": "Governance Officer",
  "replacement_artifact_id": "ETHICS_REPORT_2025-09-01_CORRECTED",
  "ledger_reference": "revocation-2025-09-15-001"
}
```

**Fields:**
- `artifact_id`: Identifier of the revoked artifact
- `original_token`: The original trust proof token
- `revoked_at`: ISO 8601 timestamp of revocation
- `reason`: Human-readable reason for revocation
- `revoked_by`: Role or person who authorized revocation
- `replacement_artifact_id`: (Optional) ID of replacement artifact
- `ledger_reference`: Ledger entry recording the revocation

---

## Usage

### For Developers

**Check if a proof exists:**
```bash
grep "ETHICS_REPORT_2025-11-05" governance/trust-proofs/active-proofs.jsonl
```

**Check if a proof is revoked:**
```bash
grep "ETHICS_REPORT_2025-11-05" governance/trust-proofs/revoked-proofs.jsonl
```

**List all active proofs:**
```bash
cat governance/trust-proofs/active-proofs.jsonl | jq .
```

**Count active proofs:**
```bash
wc -l < governance/trust-proofs/active-proofs.jsonl
```

---

### For Governance Officers

**Verify all active proofs:**
```bash
npm run trust:verify
```

**Check proof status:**
```bash
npm run trust:status
```

**Revoke a proof:**
```bash
npm run trust:revoke -- --artifact-id=ETHICS_REPORT_2025-11-05 --reason="Methodology error"
```

---

### For External Auditors

**Download active proofs:**
```bash
curl https://www.quantumpoly.ai/governance/trust-proofs/active-proofs.jsonl -o active-proofs.jsonl
```

**Verify a specific proof:**
```bash
# Extract artifact_id and signature from active-proofs.jsonl
ARTIFACT_ID="ETHICS_REPORT_2025-11-05"
SIGNATURE="<signature-from-proof>"

# Call verification API
curl "https://www.quantumpoly.ai/api/trust/proof?rid=${ARTIFACT_ID}&sig=${SIGNATURE}" | jq .
```

---

## Retention Policy

### Active Proofs
- Retained indefinitely while status is "active"
- Automatically marked "expired" after 90 days
- Expired proofs remain in `active-proofs.jsonl` for audit trail

### Revoked Proofs
- Retained permanently in `revoked-proofs.jsonl`
- Never deleted (immutable audit trail)
- Archived to separate file after 2 years if size becomes unwieldy

---

## Security Considerations

### No Personal Data
- Trust proofs contain ZERO personal information
- Only system-level metadata (artifact IDs, hashes, timestamps)
- No user IDs, emails, IP addresses, or behavioral data

### Cryptographic Integrity
- All proofs signed with HMAC-SHA256
- Artifact hashes computed with SHA-256
- Signatures verified against governance ledger

### Public Accessibility
- `active-proofs.jsonl` is publicly readable
- `revoked-proofs.jsonl` is publicly readable
- Transparency by design: anyone can verify

---

## Compliance

### GDPR 2016/679
- **Art. 5(2) Accountability**: Cryptographic proof of governance decisions
- **Art. 25 Privacy by Design**: No personal data in attestations
- **Art. 5(1)(c) Data Minimization**: Only system-level metadata

### DSG 2023 (Swiss Data Protection Act)
- **Art. 19 Data Security**: SHA-256 + HMAC-SHA256 cryptography
- **Art. 25 Transparency**: Public verification without authentication

---

## Maintenance

### Regular Tasks

**Daily:**
- Automated verification via GitHub Actions
- Check for expired proofs (>90 days)

**Monthly:**
- Review active proof count
- Verify ledger integrity

**Quarterly:**
- Audit revocation reasons
- Review proof expiry policy

**Annually:**
- Archive old proofs if needed
- Rotate HMAC secret key (if required)

---

## Contact

**Governance Officer:** governance@quantumpoly.ai  
**Transparency Engineer:** transparency@quantumpoly.ai  
**Documentation:** https://www.quantumpoly.ai/governance/trust-proof

---

**Last Updated:** 2025-11-05  
**Block:** 9.7  
**Status:** ✅ Operational

