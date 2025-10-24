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
