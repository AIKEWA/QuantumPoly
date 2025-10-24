# GPG Ledger Signing Workflow

**Date:** 2025-10-23  
**Author:** CASP Lead Architect  
**Status:** Production Ready  
**Classification:** Security Enhancement (Optional)

---

## Overview

This document provides comprehensive guidance for integrating GPG cryptographic signing into the QuantumPoly governance ledger workflow. GPG signatures provide tamper-evident proof of ledger integrity, supporting compliance requirements and public transparency objectives.

### Purpose

GPG (GNU Privacy Guard) signatures serve as an optional security layer that:

1. **Authenticates** ledger entries as originating from authorized CI/CD infrastructure
2. **Ensures integrity** through cryptographic verification of ledger content
3. **Prevents tampering** via detection of any post-signature modifications
4. **Supports compliance** with SOC 2, ISO 27001, HIPAA, and financial regulations
5. **Enables transparency** through public verification of deployment claims

### Compliance Mapping

| Standard                | Control                                        | How GPG Signing Satisfies                                      |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| **SOC 2 CC6.1**         | Logical and Physical Access Controls           | Cryptographic proof of audit log integrity                     |
| **ISO 27001 A.12.4.2**  | Protection of Log Information                  | Tamper-evident signatures detect unauthorized modifications    |
| **EWA-GOV Control 7.4** | Cryptographic Proof of Change Ledger Integrity | Clearsign + verify operations provide cryptographic guarantees |
| **EWA-HIL-02**          | Manual Override Governance                     | Workflow input toggle ensures human activation                 |

### When to Use GPG Signing

| Use Case                                              | Recommended    | Rationale                                    |
| ----------------------------------------------------- | -------------- | -------------------------------------------- |
| **Regulated industries** (healthcare, finance, legal) | ✅ Yes         | Mandatory cryptographic audit trails         |
| **Public sector / government contracts**              | ✅ Yes         | Transparency and accountability requirements |
| **Enterprise SOC 2 / ISO 27001 audits**               | ✅ Recommended | Demonstrates security maturity               |
| **Open source transparency**                          | ✅ Recommended | Builds public trust through verifiability    |
| **Internal projects / early-stage startups**          | ❌ Optional    | Cost-benefit may not justify complexity      |

---

## Architecture

### Workflow Structure

The GPG signing system is implemented as a **reusable workflow snippet** that can be called from the main `release.yml` workflow. This modular design provides:

- **Separation of concerns**: Signing logic isolated from deployment logic
- **Reusability**: Same snippet usable across multiple workflows
- **Maintainability**: Single source of truth for GPG operations
- **Testability**: Workflow can be tested independently

### Integration Points

```
Production Deployment Flow:
  1. validate-release      (verify tag format, release exists)
  2. deploy-production     (manual approval → Vercel deployment)
  3. update-ledger         (generate dated JSON ledger entry)
  4. sign-ledger           (← GPG signing happens here)
  5. notify-release        (post-deployment verification)
```

### Artifacts Generated

For each production release, the workflow creates:

```
governance/ledger/releases/
├── 2025-10-23-v1.0.0.json      # Unsigned ledger entry
└── 2025-10-23-v1.0.0.json.asc  # GPG clearsigned ledger (signature embedded)
```

The `.asc` file contains:

- Complete original ledger JSON (plaintext)
- PGP signature block with cryptographic proof
- Signer key ID and timestamp

---

## Setup Instructions

### Prerequisites

- **GPG installed locally**: `gpg --version` (≥ 2.2.0 required)
- **Admin access** to GitHub repository (for secrets configuration)
- **Understanding** of public-key cryptography fundamentals

### Step 1: Generate GPG Key Pair

```bash
# Generate new GPG key (RSA 4096-bit recommended)
gpg --full-generate-key

# Interactive prompts:
# - Key type: (1) RSA and RSA
# - Key size: 4096
# - Expiration: 2y (2 years recommended for key rotation)
# - Real name: QuantumPoly CI/CD
# - Email: cicd@quantumpoly.ai
# - Passphrase: (leave empty for CI/CD automation)
```

**Security Note:** For CI/CD automation, generate keys **without a passphrase**. The private key is protected by GitHub Secrets encryption at rest.

### Step 2: Export Keys

```bash
# List keys to obtain KEY_ID
gpg --list-keys --keyid-format LONG

# Example output:
# pub   rsa4096/ABCD1234ABCD1234 2025-10-23 [SC] [expires: 2027-10-23]
#       Fingerprint: ABCD 1234 ABCD 1234 ABCD  1234 ABCD 1234 ABCD 1234
# uid           [ultimate] QuantumPoly CI/CD <cicd@quantumpoly.ai>
# sub   rsa4096/EFGH5678EFGH5678 2025-10-23 [E]

# Note the KEY_ID from the pub line: ABCD1234ABCD1234

# Export private key (for GitHub secret)
gpg --armor --export-secret-keys ABCD1234ABCD1234 > private.key

# Export public key (for verification)
gpg --armor --export ABCD1234ABCD1234 > public.key
```

### Step 3: Configure GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

#### Secret 1: `GPG_PRIVATE_KEY`

```bash
# Copy entire contents of private.key file
cat private.key

# Paste into GitHub secret value
# Should start with: -----BEGIN PGP PRIVATE KEY BLOCK-----
# Should end with:   -----END PGP PRIVATE KEY BLOCK-----
```

**Value:** Entire ASCII-armored private key (including header and footer lines)

#### Secret 2: `GPG_KEY_ID`

**Value:** The key ID from Step 2 (e.g., `ABCD1234ABCD1234`)

**Format:** 16-character hexadecimal string (long format preferred)

### Step 4: Secure Private Key

After configuring GitHub secrets, **securely delete** the local private key file:

```bash
# Linux (secure overwrite)
shred -u private.key

# macOS (secure delete)
rm -P private.key

# Windows (PowerShell)
Remove-Item -Path private.key -Force
```

### Step 5: Publish Public Key

For public verification, commit the public key to the repository:

```bash
# Copy public key to governance directory
cp public.key governance/keys/cicd-public.key

# Commit to repository
git add governance/keys/cicd-public.key
git commit -m "chore(governance): add CI/CD GPG public key for ledger verification"
git push
```

**Optional:** Also publish to public key servers for discoverability:

```bash
# Upload to OpenPGP key server
gpg --send-keys ABCD1234ABCD1234 --keyserver keys.openpgp.org

# Users can then import with:
gpg --recv-keys ABCD1234ABCD1234 --keyserver keys.openpgp.org
```

---

## Workflow Integration

### Basic Integration Pattern

Add the following to your `release.yml` workflow:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      SIGN_LEDGER:
        description: 'Enable GPG signing of governance ledger'
        required: true
        type: boolean
        default: false

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    # ... deployment steps ...

  update-ledger:
    name: Update Governance Ledger
    needs: deploy-production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate ledger entry
        run: |
          # Script creates: governance/ledger/releases/YYYY-MM-DD-vX.Y.Z.json
          npm run ethics:ledger-update
      - name: Commit ledger
        run: |
          git add governance/ledger/releases/*.json
          git commit -m "chore(governance): add ledger entry for ${{ github.ref_name }}"
          git push

  sign-ledger:
    name: Sign Governance Ledger
    needs: update-ledger
    if: ${{ inputs.SIGN_LEDGER == true || github.event_name == 'push' }}
    uses: ./.github/workflows/snippets/gpg-sign-ledger.yml
    with:
      ledger_file_path: governance/ledger/releases/${{ steps.get-filename.outputs.filename }}
      sign_enabled: ${{ inputs.SIGN_LEDGER == true || github.event_name == 'push' }}
    secrets:
      GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
      GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

### Advanced Integration: Dynamic File Path

If you need to determine the ledger file path dynamically:

```yaml
jobs:
  update-ledger:
    name: Update Governance Ledger
    needs: deploy-production
    runs-on: ubuntu-latest
    outputs:
      ledger_file: ${{ steps.generate.outputs.file_path }}
    steps:
      - uses: actions/checkout@v4
      - name: Generate ledger entry
        id: generate
        run: |
          # Generate ledger file
          LEDGER_FILE="governance/ledger/releases/$(date +%Y-%m-%d)-${{ github.ref_name }}.json"
          npm run ethics:ledger-update -- --output "$LEDGER_FILE"
          echo "file_path=$LEDGER_FILE" >> $GITHUB_OUTPUT

  sign-ledger:
    name: Sign Governance Ledger
    needs: update-ledger
    uses: ./.github/workflows/snippets/gpg-sign-ledger.yml
    with:
      ledger_file_path: ${{ needs.update-ledger.outputs.ledger_file }}
      sign_enabled: true
    secrets:
      GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
      GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

---

## Operator Verification Guide

### Local Verification (Manual Testing)

#### 1. Import Public Key

```bash
# Import from repository
gpg --import governance/keys/cicd-public.key

# Verify import
gpg --list-keys "QuantumPoly CI/CD"
```

#### 2. Verify Signature

```bash
# Verify a specific ledger signature
gpg --verify governance/ledger/releases/2025-10-23-v1.0.0.json.asc

# Expected output:
# gpg: Signature made Thu Oct 23 12:34:56 2025 UTC
# gpg:                using RSA key ABCD1234ABCD1234
# gpg: Good signature from "QuantumPoly CI/CD <cicd@quantumpoly.ai>" [unknown]
```

**Note:** The `[unknown]` trust level is expected if you haven't explicitly trusted the key. The signature is still cryptographically valid.

#### 3. Bulk Verification

Verify all ledger signatures at once:

```bash
#!/bin/bash
# Verify all signatures in releases directory

set -euo pipefail

FAILED=0
PASSED=0

for sig_file in governance/ledger/releases/*.json.asc; do
  if [ ! -f "$sig_file" ]; then
    continue
  fi

  echo "Verifying: $sig_file"

  if gpg --verify "$sig_file" 2>&1 | grep -q "Good signature"; then
    echo "  ✅ PASSED"
    ((PASSED++))
  else
    echo "  ❌ FAILED"
    ((FAILED++))
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary: $PASSED passed, $FAILED failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
```

#### 4. Tamper Detection Test

Demonstrate that signature verification detects tampering:

```bash
# Create test file
echo '{"test": "original"}' > test.json

# Sign it
gpg --clearsign --local-user "QuantumPoly CI/CD" test.json

# Verify (should succeed)
gpg --verify test.json.asc
# Output: gpg: Good signature

# Tamper with the signed file (edit test.json.asc, modify JSON content)
sed -i 's/original/tampered/g' test.json.asc

# Verify again (should fail)
gpg --verify test.json.asc
# Output: gpg: BAD signature

# Cleanup
rm test.json test.json.asc
```

### CI/CD Verification

Add signature verification to your CI workflow:

```yaml
- name: Verify Ledger Signatures
  run: |
    set -euo pipefail

    # Import public key
    gpg --import governance/keys/cicd-public.key

    # Verify all signatures
    for sig in governance/ledger/releases/*.json.asc; do
      if [ ! -f "$sig" ]; then
        continue
      fi
      
      echo "Verifying: $sig"
      if ! gpg --verify "$sig" 2>&1 | grep -q "Good signature"; then
        echo "❌ ERROR: Signature verification failed for $sig"
        exit 1
      fi
    done

    echo "✅ All signatures verified successfully"
```

---

## Security Best Practices

### Key Management

| Practice                     | Rationale                                  | Implementation                             |
| ---------------------------- | ------------------------------------------ | ------------------------------------------ |
| **Dedicated CI/CD key**      | Isolates risk from personal keys           | Generate separate key for automation       |
| **No passphrase for CI**     | Enables automation without interaction     | GitHub Secrets provides encryption at rest |
| **2-year expiration**        | Limits exposure window if compromised      | Set expiry during key generation           |
| **Encrypted offline backup** | Enables key recovery if GitHub access lost | Export and encrypt private key securely    |
| **Revocation certificate**   | Allows key invalidation if compromised     | Generate during initial setup              |

### Key Rotation Procedure

Rotate GPG keys every 2 years:

```bash
# 1. Generate new key (follow Step 1 in Setup Instructions)
# 2. Export new keys
# 3. Update GitHub Secrets (GPG_PRIVATE_KEY, GPG_KEY_ID)
# 4. Commit new public key to repository
git add governance/keys/cicd-public-v2.key
git commit -m "chore(governance): rotate CI/CD GPG key (2025→2027)"

# 5. Keep old key available for historical verification
# (Don't delete governance/keys/cicd-public.key)

# 6. Document rotation in governance ledger
cat >> governance/ledger/KEY_ROTATION.md << EOF
## Key Rotation: $(date +%Y-%m-%d)
- Old Key: ABCD1234ABCD1234 (retired, historical verification only)
- New Key: WXYZ9876WXYZ9876 (active)
- Reason: Scheduled 2-year rotation
EOF
```

### Threat Mitigation

| Threat                       | Mitigation Strategy                                         |
| ---------------------------- | ----------------------------------------------------------- |
| **Private key leak**         | GitHub Secrets encryption + audit logging + rotation        |
| **Compromised CI/CD runner** | Manual approval required before deployment                  |
| **Signature forgery**        | Public key verification detects invalid signatures          |
| **Timestamp manipulation**   | GitHub Actions logs provide independent timestamp           |
| **Key compromise**           | Revocation certificate + immediate rotation                 |
| **Man-in-the-middle**        | HTTPS for all communications + key fingerprint verification |

### Revocation Certificate

Generate a revocation certificate during initial setup:

```bash
# Generate revocation certificate
gpg --output revoke-cicd-key.asc --gen-revoke ABCD1234ABCD1234

# Interactive prompts:
# - Reason: 1 = Key has been compromised
# - Description: (optional)

# Store securely (encrypted USB, password manager, offline backup)
# DO NOT commit to repository
# Use only if private key is compromised
```

If key compromise is detected:

```bash
# Import revocation certificate
gpg --import revoke-cicd-key.asc

# Publish revocation to key servers
gpg --send-keys ABCD1234ABCD1234 --keyserver keys.openpgp.org

# Immediately rotate keys (follow Key Rotation Procedure)
```

---

## Validation Table

| Condition                | Expected Outcome                        | Verification Method                                   |
| ------------------------ | --------------------------------------- | ----------------------------------------------------- |
| **Valid key configured** | ✅ Signature created successfully       | `gpg --verify *.asc` returns "Good signature"         |
| **Secrets missing**      | ⏭️ Gracefully skipped with info message | Workflow logs show "GPG signing skipped (no secrets)" |
| **Wrong GPG_KEY_ID**     | ❌ Import fails with clear error        | Workflow logs show "Failed to import GPG key"         |
| **Tampered ledger**      | ❌ Verification fails, job fails        | `gpg --verify` returns "BAD signature", job exits 1   |
| **Re-run on same file**  | ✅ Deterministic signature created      | Second run replaces .asc with identical signature     |
| **Expired key**          | ⚠️ Warning shown, signature valid       | `gpg --verify` shows "Note: This key has expired!"    |
| **Revoked key**          | ❌ Verification fails                   | `gpg --verify` shows "Key has been revoked"           |

---

## Troubleshooting

### Issue 1: "GPG signing skipped (no secrets)"

**Symptom:**

```
❌ ERROR: GPG secrets not configured
```

**Cause:** `GPG_PRIVATE_KEY` or `GPG_KEY_ID` secrets not set in GitHub.

**Resolution:**

1. Navigate to **Repository → Settings → Secrets and variables → Actions**
2. Verify both `GPG_PRIVATE_KEY` and `GPG_KEY_ID` exist
3. If missing, follow **Step 3: Configure GitHub Secrets** in this document
4. Re-run workflow

### Issue 2: "Failed to import GPG key"

**Symptom:**

```
❌ ERROR: Failed to import GPG key with ID: ABCD1234ABCD1234
```

**Causes and Solutions:**

| Cause                 | Solution                                                                         |
| --------------------- | -------------------------------------------------------------------------------- |
| Wrong key ID          | Verify `GPG_KEY_ID` matches the key in `GPG_PRIVATE_KEY` using `gpg --list-keys` |
| Corrupted private key | Re-export private key and update GitHub secret                                   |
| Key format issue      | Ensure private key includes header (`-----BEGIN PGP PRIVATE KEY BLOCK-----`)     |

### Issue 3: "Signature verification failed"

**Symptom:**

```
❌ ERROR: Signature verification failed
gpg: BAD signature
```

**Causes and Solutions:**

| Cause                         | Solution                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| Ledger modified after signing | Don't manually edit signed files; regenerate signature           |
| Wrong public key              | Import correct public key from `governance/keys/cicd-public.key` |
| Signature file corrupted      | Re-run deployment to regenerate signature                        |
| Key mismatch                  | Ensure signing key matches verification key                      |

### Issue 4: "Ledger file not found"

**Symptom:**

```
❌ ERROR: Ledger file not found: governance/ledger/releases/...
```

**Cause:** `update-ledger` job did not generate the expected file.

**Resolution:**

1. Check `update-ledger` job logs for errors
2. Verify `ethics:ledger-update` script is working correctly
3. Ensure file path in `ledger_file_path` input matches generated file
4. Consider using dynamic file path pattern (see **Advanced Integration** section)

### Issue 5: Trust warnings

**Symptom:**

```
gpg: WARNING: This key is not certified with a trusted signature!
```

**Explanation:** This warning is **expected** and **harmless**. It indicates you haven't explicitly trusted the key, but the signature is still cryptographically valid.

**Optional Resolution (for local verification only):**

```bash
# Trust the key (interactive)
gpg --edit-key ABCD1234ABCD1234
gpg> trust
# Select: 5 = I trust ultimately
gpg> quit
```

---

## Related Documentation

- **CI/CD Architecture:** `/docs/CICD_GPG_LEDGER_INTEGRATION.md`
- **Validation Scenarios:** `/docs/governance/GPG_SIGNING_VALIDATION.md`
- **Example Integration:** `/docs/examples/release-with-gpg-signing.yml`
- **General Governance:** `/governance/README.md`
- **CI/CD Implementation:** `/BLOCK7_CICD_IMPLEMENTATION_SUMMARY.md`

---

## Support

### Resources

- **GPG Official Documentation:** https://gnupg.org/documentation/
- **OpenPGP Best Practices:** https://riseup.net/en/security/message-security/openpgp/best-practices
- **Key Servers:** https://keys.openpgp.org

### Questions and Issues

For implementation questions:

1. Review this documentation thoroughly
2. Check **Troubleshooting** section above
3. Verify **Validation Table** conditions
4. Consult `/docs/governance/GPG_SIGNING_VALIDATION.md` for test scenarios
5. Open GitHub issue with `governance` label if problems persist

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-23  
**Maintained By:** CASP Lead Architect  
**Review Cycle:** Quarterly or after major GPG key rotation
