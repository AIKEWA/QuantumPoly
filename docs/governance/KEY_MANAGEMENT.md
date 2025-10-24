# GPG Key Management for Transparency Ledger

## Overview

The QuantumPoly Ethical Governance Dashboard uses GPG (GNU Privacy Guard) cryptographic signatures to ensure the authenticity and integrity of transparency ledger entries.

---

## Key Generation

### Local Development

Generate a GPG key pair for signing ledger entries:

```bash
# Generate new GPG key
gpg --full-generate-key

# Follow prompts:
# - Key type: RSA and RSA (default)
# - Key size: 4096 bits
# - Expiration: 2 years (recommended)
# - Real name: "QuantumPoly Ethics Bot"
# - Email: ethics@quantumpoly.org (or appropriate)
# - Comment: "Ethical Governance Ledger Signing Key"
```

### Export Public Key

```bash
# List keys
gpg --list-keys

# Export public key (replace KEY_ID with your key ID)
gpg --armor --export KEY_ID > governance/keys/ethical.pub

# Commit public key to repository
git add governance/keys/ethical.pub
git commit -m "Add ethical governance signing public key"
```

### Export Private Key (for CI)

```bash
# Export private key (DO NOT commit to repository!)
gpg --armor --export-secret-keys KEY_ID > ethical-private.key

# Base64 encode for GitHub Secrets
cat ethical-private.key | base64 > ethical-private-b64.txt

# Copy contents to GitHub Secrets as GPG_PRIVATE_KEY
```

---

## CI/CD Integration

### GitHub Actions Secrets

Add the following secrets to your GitHub repository:

1. **GPG_PRIVATE_KEY:**
   - Base64-encoded private key
   - Used by `ledger-update.mjs` to sign entries in CI

2. **GPG_KEY_ID (optional):**
   - Key ID for explicit key selection
   - Format: `ABCD1234EFGH5678`

### Workflow Configuration

The private key is automatically imported and used during CI runs:

```yaml
- name: Update Transparency Ledger
  run: npm run ethics:ledger-update
  env:
    CI: true
    GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
    GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

---

## Key Rotation Policy

### Rotation Schedule

- **Standard:** Every 2 years
- **Compromised:** Immediately upon suspected compromise
- **Planned:** At major version milestones

### Rotation Procedure

1. **Generate New Key:**

   ```bash
   gpg --full-generate-key
   ```

2. **Export New Public Key:**

   ```bash
   gpg --armor --export NEW_KEY_ID > governance/keys/ethical-v2.pub
   ```

3. **Update Repository:**

   ```bash
   git add governance/keys/ethical-v2.pub
   git commit -m "Rotate GPG key: ethical-v2"
   ```

4. **Update CI Secrets:**
   - Export new private key
   - Update `GPG_PRIVATE_KEY` secret in GitHub
   - Update `GPG_KEY_ID` secret if applicable

5. **Document Rotation:**
   - Add entry to `governance/keys/rotation-log.md`
   - Include old key fingerprint, new key fingerprint, date

6. **Revoke Old Key (if compromised):**
   ```bash
   gpg --gen-revoke OLD_KEY_ID > revocation.asc
   gpg --import revocation.asc
   gpg --send-keys OLD_KEY_ID  # Publish to keyserver
   ```

---

## Verification

### Verify Ledger Signatures

Run the automated verification script:

```bash
npm run ethics:verify-ledger
```

This script:

- Reads all ledger entries
- Verifies GPG signatures
- Checks Merkle tree integrity
- Reports any tampering attempts

### Manual Signature Verification

```bash
# Extract signature and data from ledger entry
# (Example using jq)
cat governance/ledger/ledger.jsonl | tail -n 1 | jq -r '.signature' > /tmp/sig.asc

# Reconstruct signed data
cat governance/ledger/ledger.jsonl | tail -n 1 | jq '{id,timestamp,commit,merkleRoot}' > /tmp/data.txt

# Verify
gpg --verify /tmp/sig.asc /tmp/data.txt
```

---

## Security Best Practices

### Private Key Storage

- **DO NOT** commit private keys to version control
- **DO NOT** share private keys via email or chat
- **DO** store in password manager or hardware security module (HSM)
- **DO** use strong passphrase for key encryption

### Access Control

- Private key access limited to:
  - CI/CD system (GitHub Actions)
  - Authorized release managers
  - Security administrators

### Monitoring

- Review ledger signatures quarterly
- Run `ethics:verify-ledger` in CI to detect issues early
- Alert on unsigned entries in production

---

## Troubleshooting

### Signature Verification Fails

1. **Check key availability:**

   ```bash
   gpg --list-keys
   ```

2. **Import public key:**

   ```bash
   gpg --import governance/keys/ethical.pub
   ```

3. **Trust key:**
   ```bash
   gpg --edit-key KEY_ID
   # In GPG prompt: trust -> 5 (ultimate) -> quit
   ```

### CI Signing Fails

1. **Verify secret is set:**
   - Check GitHub repository secrets
   - Ensure `GPG_PRIVATE_KEY` is base64-encoded

2. **Check workflow logs:**
   - Look for GPG import errors
   - Verify `CI=true` environment variable

3. **Test locally:**
   ```bash
   # Simulate CI environment
   export CI=true
   export GPG_PRIVATE_KEY="$(cat ethical-private.key | base64)"
   npm run ethics:ledger-update
   ```

---

## Key Information

### Current Key

- **Purpose:** Ethical Governance Ledger Signing
- **Algorithm:** RSA 4096-bit
- **Created:** 2025-10-19
- **Expires:** 2027-10-19
- **Fingerprint:** _(To be added after key generation)_
- **Public Key:** `governance/keys/ethical.pub`

### Key Contacts

- **Primary:** Ethics team lead
- **Secondary:** DevOps lead
- **Emergency:** Security officer

---

## References

- [GPG Manual](https://www.gnupg.org/documentation/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OpenPGP Best Practices](https://help.riseup.net/en/security/message-security/openpgp/best-practices)

**Last Updated:** 2025-10-19
