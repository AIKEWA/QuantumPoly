# GPG Signatures Directory

This directory contains GPG detached ASCII-armored signatures for governance ledger entries.

## Purpose

GPG signatures provide cryptographic proof of authenticity and integrity for critical governance documents. Each signature file is a detached signature that can be independently verified using the signer's public key.

## Block 10.9 Signatures

### entry-block10.9-closure.aa.asc
- **Signer:** Aykut Aydin (A.I.K.)
- **Role:** Chief AI Engineer
- **Scope:** Stage VI Closure document and ledger entry
- **Algorithm:** GPG/PGP (RSA or EdDSA)

### entry-block10.9-closure.ewa.asc
- **Signer:** E.W. Armstrong (EWA)
- **Role:** Governance Lead
- **Scope:** Stage VI Closure document and ledger entry
- **Algorithm:** GPG/PGP (RSA or EdDSA)

## Generating Signatures

To generate a GPG signature for the closure document:

```bash
# Sign the closure document (Aykut Aydin)
gpg --detach-sign --armor \
  --output governance/ledger/signatures/entry-block10.9-closure.aa.asc \
  BLOCK10.9_CLOSURE.md

# Sign the closure document (E.W. Armstrong)
gpg --detach-sign --armor \
  --output governance/ledger/signatures/entry-block10.9-closure.ewa.asc \
  BLOCK10.9_CLOSURE.md
```

## Verifying Signatures

To verify the signatures:

```bash
# Verify Aykut Aydin signature
gpg --verify governance/ledger/signatures/entry-block10.9-closure.aa.asc BLOCK10.9_CLOSURE.md

# Verify E.W. Armstrong signature
gpg --verify governance/ledger/signatures/entry-block10.9-closure.ewa.asc BLOCK10.9_CLOSURE.md
```

Expected output:
```
gpg: Signature made [DATE]
gpg: Good signature from "[SIGNER NAME] <email@example.com>"
```

## Public Keys

Public keys for signature verification should be available at:
- `docs/governance/public-keys/aykut-aydin.pub.asc`
- `docs/governance/public-keys/ewa.pub.asc`

Or retrieved from public keyservers:
```bash
gpg --keyserver keys.openpgp.org --recv-keys [KEY_ID]
```

## Signature Policy

1. **Dual Approval Required:** All major governance closures require signatures from both A.I.K. and EWA
2. **Detached Signatures:** All signatures are detached (separate .asc files) to maintain document integrity
3. **ASCII Armor:** All signatures use ASCII armor format for readability and compatibility
4. **Permanent Record:** Once signed, signatures are immutable and archived permanently

## Reference Documentation

See also:
- `/docs/governance/GPG_SIGNING_WORKFLOW.md` - Complete workflow documentation
- `/docs/governance/GPG_SIGNING_VALIDATION.md` - Validation procedures
- `BLOCK10.9_CLOSURE.md` - The document being signed

