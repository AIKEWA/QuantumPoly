# CI/CD GPG Ledger Integration

**Date:** 2025-10-23 (Updated)  
**Original Date:** 2025-10-19  
**Author:** CASP Lead Architect  
**Status:** Production Ready - Modular Workflow Architecture

---

## Overview

GPG (GNU Privacy Guard) signatures provide **cryptographic verification** of governance ledger entries, ensuring deployment audit trails are authentic and tamper-evident. This optional enhancement strengthens the CI/CD pipeline with cryptographic guarantees for compliance and security audits.

---

## Purpose

### Why GPG Signatures Matter

1. **Authenticity**: Prove ledger entries originated from authorized CI/CD system
2. **Integrity**: Detect any tampering with historical deployment records
3. **Non-repudiation**: Cryptographically bind deployments to approval decisions
4. **Compliance**: Meet requirements for SOC 2, ISO 27001, HIPAA, and financial regulations
5. **Transparency**: Enable public verification of deployment claims

### When GPG Signatures Are Required

| Use Case                                       | GPG Required?  | Rationale                                                 |
| ---------------------------------------------- | -------------- | --------------------------------------------------------- |
| **Regulated industries** (healthcare, finance) | ✅ Yes         | Regulatory compliance mandates cryptographic audit trails |
| **Public sector / government**                 | ✅ Yes         | Transparency and accountability requirements              |
| **Enterprise SOC 2 / ISO 27001**               | ✅ Recommended | Audit trail authenticity verification                     |
| **Open source transparency**                   | ✅ Recommended | Public trust and verifiability                            |
| **Internal projects / startups**               | ❌ Optional    | Cost-benefit may not justify complexity                   |

---

## Architecture

### Integration Points in CI/CD

GPG signing integrates at the **governance ledger update** stage in `release.yml`. As of 2025-10-23, this is implemented using a **reusable workflow snippet** for better maintainability:

```yaml
jobs:
  update-ledger:
    # ... generates ledger JSON file ...

  sign-ledger:
    name: Sign Governance Ledger
    needs: update-ledger
    uses: ./.github/workflows/snippets/gpg-sign-ledger.yml # ← Reusable workflow
    with:
      ledger_file_path: governance/ledger/releases/YYYY-MM-DD-vX.Y.Z.json
      sign_enabled: true
    secrets:
      GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
      GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

**Note:** For complete integration examples, see `/docs/examples/release-with-gpg-signing.yml` and the [Workflow Snippet Architecture](#workflow-snippet-architecture) section below.

### What Gets Signed

Each production deployment generates:

1. **Ledger entry JSON** (`governance/ledger/YYYY-MM-DD-vX.Y.Z.json`)
2. **GPG signature** (`governance/ledger/YYYY-MM-DD-vX.Y.Z.json.asc`)

### Signature Contents

Signed data includes:

- Deployment tag (e.g., `v1.0.0`)
- Production URL
- Commit SHA
- Approver identity (GitHub username)
- Timestamp (ISO 8601 UTC)
- Ethical Integrity Index (EII) score
- Quality gate results

---

## Workflow Snippet Architecture

### Modular Design Pattern

As of 2025-10-23, GPG signing is implemented as a **reusable workflow snippet** rather than inline code. This architectural pattern provides:

| Benefit                    | Description                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| **Separation of concerns** | Signing logic isolated from deployment orchestration                      |
| **Reusability**            | Same snippet callable from multiple workflows (release, hotfix, rollback) |
| **Maintainability**        | Single source of truth for GPG operations                                 |
| **Testability**            | Workflow can be independently validated and tested                        |
| **Version control**        | Snippet changes tracked separately from deployment logic                  |

### File Structure

```
.github/workflows/
├── release.yml                        # Main release workflow
├── snippets/
│   └── gpg-sign-ledger.yml           # Reusable GPG signing workflow
└── ...

docs/
├── governance/
│   ├── GPG_SIGNING_WORKFLOW.md       # Integration guide (comprehensive)
│   └── GPG_SIGNING_VALIDATION.md     # Test scenarios and validation
└── examples/
    └── release-with-gpg-signing.yml  # Complete integration example
```

### Integration Pattern

The reusable workflow is called using `workflow_call`:

```yaml
# In release.yml
jobs:
  sign-ledger:
    name: Sign Governance Ledger
    needs: update-ledger
    uses: ./.github/workflows/snippets/gpg-sign-ledger.yml
    with:
      ledger_file_path: governance/ledger/releases/2025-10-23-v1.0.0.json
      sign_enabled: true
    secrets:
      GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
      GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

### Manual Activation Pattern (EWA-HIL-02 Compliance)

The preferred activation method uses **workflow inputs** for human-controlled signing:

```yaml
# In release.yml
on:
  workflow_dispatch:
    inputs:
      SIGN_LEDGER:
        description: 'Enable GPG signing of governance ledger'
        required: true
        type: boolean
        default: false

jobs:
  sign-ledger:
    if: ${{ inputs.SIGN_LEDGER == true }}
    uses: ./.github/workflows/snippets/gpg-sign-ledger.yml
    # ...
```

This ensures:

- **Human approval** for each signing operation
- **Audit trail** of who activated signing (GitHub Actions logs)
- **Compliance** with EWA-HIL-02 Manual Override Governance
- **Flexibility** to skip signing for testing/development releases

### Workflow Inputs

The snippet accepts the following inputs:

| Input              | Type    | Required | Default | Description                                                                          |
| ------------------ | ------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| `ledger_file_path` | string  | Yes      | -       | Path to ledger JSON file (e.g., `governance/ledger/releases/YYYY-MM-DD-vX.Y.Z.json`) |
| `sign_enabled`     | boolean | No       | `false` | Enable/disable signing (graceful skip if `false`)                                    |

### Workflow Secrets

| Secret            | Required   | Description                    |
| ----------------- | ---------- | ------------------------------ |
| `GPG_PRIVATE_KEY` | Optional\* | ASCII-armored private key      |
| `GPG_KEY_ID`      | Optional\* | GPG key ID (8 or 16 hex chars) |

\*If secrets are missing, workflow **gracefully skips** signing without failing.

### Outputs and Artifacts

The workflow produces:

1. **Signature file**: `<ledger_file_path>.asc` (clearsigned ledger)
2. **Workflow artifact**: `ledger-signatures` (90-day retention)
3. **Summary report**: Human-readable summary in GitHub Actions UI
4. **Verification logs**: GPG verification output for audit trail

### Migration from Inline to Snippet

For teams with existing inline GPG code:

**Before (Inline):**

```yaml
- name: Sign ledger
  run: |
    echo "$GPG_PRIVATE_KEY" | gpg --import
    gpg --clearsign ledger.json
    gpg --verify ledger.json.asc
```

**After (Snippet):**

```yaml
sign-ledger:
  uses: ./.github/workflows/snippets/gpg-sign-ledger.yml
  with:
    ledger_file_path: governance/ledger/releases/ledger.json
    sign_enabled: true
  secrets:
    GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
    GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

**Migration steps:**

1. Copy snippet to `.github/workflows/snippets/gpg-sign-ledger.yml`
2. Replace inline signing code with `uses:` call
3. Update input paths to match your ledger file structure
4. Test with manual workflow trigger
5. Remove old inline code after validation

### Related Documentation

- **Workflow Implementation**: `/.github/workflows/snippets/gpg-sign-ledger.yml`
- **Integration Guide**: `/docs/governance/GPG_SIGNING_WORKFLOW.md`
- **Validation Scenarios**: `/docs/governance/GPG_SIGNING_VALIDATION.md`
- **Example Integration**: `/docs/examples/release-with-gpg-signing.yml`

---

## Setup Instructions

### Prerequisites

- **GPG installed** on local machine: `gpg --version` (≥ 2.2.0)
- **Admin access** to GitHub repository (to add secrets)
- **Understanding** of public-key cryptography basics

### Step 1: Generate GPG Key Pair

```bash
# Generate new GPG key (RSA 4096-bit)
gpg --full-generate-key

# Interactive prompts:
# - Key type: (1) RSA and RSA
# - Key size: 4096
# - Expiration: 2y (2 years recommended)
# - Real name: QuantumPoly CI/CD
# - Email: cicd@quantumpoly.ai
# - Passphrase: (leave empty for CI/CD use)
```

**Security Note:** For CI/CD automation, use **no passphrase**. The private key is protected by GitHub Secrets encryption.

### Step 2: Export Keys

```bash
# List keys to get KEY_ID
gpg --list-keys --keyid-format LONG

# Example output:
# pub   rsa4096/ABCD1234ABCD1234 2025-10-19 [SC] [expires: 2027-10-19]
#       Fingerprint: ABCD 1234 ABCD 1234 ABCD  1234 ABCD 1234 ABCD 1234
# uid           [ultimate] QuantumPoly CI/CD <cicd@quantumpoly.ai>
# sub   rsa4096/EFGH5678EFGH5678 2025-10-19 [E]

# Note the KEY_ID: ABCD1234ABCD1234

# Export private key (for GitHub secret)
gpg --armor --export-secret-keys ABCD1234ABCD1234 > private.key

# Export public key (for verification)
gpg --armor --export ABCD1234ABCD1234 > public.key
```

### Step 3: Add GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

Add two secrets:

#### Secret 1: `GPG_PRIVATE_KEY`

```bash
# Copy contents of private.key
cat private.key

# Paste into GitHub secret value
# Should start with: -----BEGIN PGP PRIVATE KEY BLOCK-----
```

#### Secret 2: `GPG_KEY_ID`

```
ABCD1234ABCD1234
```

**Security:** After adding secrets, **delete local private.key** file:

```bash
shred -u private.key  # Linux
rm -P private.key     # macOS
```

### Step 4: Publish Public Key

For public verification, publish the public key:

#### Option A: GitHub Repository

```bash
# Commit public key to repository
cp public.key governance/keys/cicd-public.key
git add governance/keys/cicd-public.key
git commit -m "chore: add CI/CD GPG public key"
git push
```

#### Option B: Public Key Server

```bash
# Upload to key server
gpg --send-keys ABCD1234ABCD1234 --keyserver keys.openpgp.org

# Users can import with:
gpg --recv-keys ABCD1234ABCD1234 --keyserver keys.openpgp.org
```

#### Option C: Both (Recommended)

Use both methods for redundancy and discoverability.

---

## Verification Procedures

### Verify Signature Locally

```bash
# Import public key (if not already done)
gpg --import governance/keys/cicd-public.key

# Verify signature
gpg --verify governance/ledger/2025-10-19-v1.0.0.json.asc

# Expected output:
# gpg: assuming signed data in 'governance/ledger/2025-10-19-v1.0.0.json'
# gpg: Signature made Sat Oct 19 12:34:56 2025 UTC
# gpg:                using RSA key ABCD1234ABCD1234
# gpg: Good signature from "QuantumPoly CI/CD <cicd@quantumpoly.ai>" [unknown]
```

### Automated Verification

```bash
# Verify all ledger signatures
for sig in governance/ledger/*.json.asc; do
  echo "Verifying: $sig"
  gpg --verify "$sig" || echo "FAILED: $sig"
done
```

### CI/CD Verification

Add to governance job in `ci.yml`:

```yaml
- name: Verify ledger signatures
  run: |
    gpg --import governance/keys/cicd-public.key
    for sig in governance/ledger/*.json.asc; do
      gpg --verify "$sig" || exit 1
    done
```

---

## Signature Workflow

### Production Deployment Flow with GPG

```
1. Tag v1.0.0 pushed
   ↓
2. validate-release job (verify tag format)
   ↓
3. deploy-production job (manual approval, then deploy)
   ↓
4. update-ledger job:
   a. Run npm run ethics:ledger-update
      → Script reads GPG_PRIVATE_KEY from env
      → Generates ledger JSON
      → Signs JSON with GPG key
      → Creates .json.asc signature file
   b. Commit ledger JSON + signature to main
   c. Push to repository
   ↓
5. Ledger entry now cryptographically verifiable
```

### Ledger Entry Structure

**File:** `governance/ledger/2025-10-19-v1.0.0.json`

```json
{
  "version": "1.0.0",
  "tag": "v1.0.0",
  "timestamp": "2025-10-19T12:34:56Z",
  "commit": "abc123def456...",
  "deploymentUrl": "https://quantumpoly-xyz.vercel.app",
  "productionUrl": "https://www.quantumpoly.ai",
  "approver": "github-username",
  "eiiScore": 92.5,
  "qualityGates": {
    "lint": "passed",
    "typecheck": "passed",
    "tests": "passed",
    "accessibility": "passed",
    "performance": "passed",
    "governance": "passed"
  }
}
```

**Signature:** `governance/ledger/2025-10-19-v1.0.0.json.asc`

```
-----BEGIN PGP SIGNATURE-----

iQIzBAABCAAdFiEE...
[Base64-encoded signature data]
...
=ABCD
-----END PGP SIGNATURE-----
```

---

## Security Considerations

### Key Management Best Practices

| Practice                  | Rationale                                    |
| ------------------------- | -------------------------------------------- |
| **Use dedicated key**     | Separate CI/CD key from personal keys        |
| **No passphrase for CI**  | GitHub Secrets provides encryption at rest   |
| **Rotate every 2 years**  | Limits exposure window if key compromised    |
| **Backup key securely**   | Store encrypted offline backup               |
| **Revoke if compromised** | Generate new key, rotate secrets immediately |

### Threat Mitigation

| Threat                     | Mitigation                                         |
| -------------------------- | -------------------------------------------------- |
| **Private key leak**       | GitHub Secrets encryption + audit logging          |
| **Compromised CI/CD**      | Require manual approval before signing             |
| **Signature forgery**      | Public key verification detects invalid signatures |
| **Timestamp manipulation** | GitHub Actions logs provide independent timestamp  |
| **Key compromise**         | Key rotation procedure + revocation certificate    |

### Revocation Certificate

Generate during key creation:

```bash
# Generate revocation certificate
gpg --output revoke.asc --gen-revoke ABCD1234ABCD1234

# Store securely (encrypted USB, password manager)
# Use only if private key compromised
```

---

## Compliance Use Cases

### SOC 2 Type II Compliance

**Requirement:** Demonstrate integrity of audit logs

**How GPG Helps:**

- Cryptographic proof that ledger entries are authentic
- Tamper-evident audit trail for SOC 2 auditors
- Verifiable chain of custody for deployments

**Audit Evidence:**

```bash
# Auditor verifies all signatures
gpg --import governance/keys/cicd-public.key
gpg --verify governance/ledger/2025-01-15-v1.0.0.json.asc

# Shows:
# - Signature is valid
# - Signed by authorized CI/CD key
# - Timestamp matches deployment records
```

### ISO 27001 Compliance

**Requirement:** A.12.4.1 - Event logging and monitoring

**How GPG Helps:**

- Immutable, cryptographically signed event logs
- Non-repudiation of security events (deployments)
- Protection against log tampering

### HIPAA Compliance (Healthcare)

**Requirement:** § 164.312(b) - Audit controls

**How GPG Helps:**

- Cryptographic integrity verification of audit trails
- Detect unauthorized modifications to deployment records
- Supports "reasonable and appropriate" safeguards requirement

### Financial Services (SOX, PCI DSS)

**Requirement:** Change management and audit trails

**How GPG Helps:**

- Cryptographic proof of deployment approvals
- Immutable record of production changes
- Supports segregation of duties (approval + signature)

---

## Troubleshooting

### Issue 1: Signature Verification Fails

**Symptom:**

```
gpg: BAD signature from "QuantumPoly CI/CD"
```

**Causes & Solutions:**

1. **Ledger JSON modified after signing**
   - Solution: Don't manually edit signed files; regenerate signature
2. **Wrong public key imported**
   - Solution: `gpg --delete-keys ABCD1234ABCD1234` then re-import correct key
3. **Signature file corrupted**
   - Solution: Re-run deployment to regenerate signature

### Issue 2: GPG Not Found in CI

**Symptom:**

```
gpg: command not found
```

**Solution:**

```yaml
# Add to workflow before signing step
- name: Install GPG
  run: |
    apt-get update
    apt-get install -y gnupg
```

### Issue 3: "No Secret Key" Error

**Symptom:**

```
gpg: signing failed: No secret key
```

**Causes & Solutions:**

1. **GPG_PRIVATE_KEY secret not set**
   - Solution: Add secret in GitHub repository settings
2. **Private key import failed**
   - Solution: Verify key format (should include `-----BEGIN PGP PRIVATE KEY BLOCK-----`)
3. **Key ID mismatch**
   - Solution: Ensure GPG_KEY_ID matches the key in GPG_PRIVATE_KEY

---

## Cost-Benefit Analysis

### Benefits

| Benefit                     | Impact                             |
| --------------------------- | ---------------------------------- |
| **Cryptographic assurance** | High (tamper-evident audit trail)  |
| **Compliance readiness**    | High (SOC 2, ISO 27001, HIPAA)     |
| **Public trust**            | Medium (transparent verification)  |
| **Incident forensics**      | High (detect unauthorized changes) |

### Costs

| Cost                     | Impact                            |
| ------------------------ | --------------------------------- |
| **Initial setup time**   | Low (30-60 minutes one-time)      |
| **Maintenance overhead** | Low (key rotation every 2 years)  |
| **Complexity**           | Low (automated after setup)       |
| **Storage**              | Negligible (signatures ~1KB each) |

### Recommendation

| Project Type                      | Recommendation                                                |
| --------------------------------- | ------------------------------------------------------------- |
| **Enterprise / Regulated**        | ✅ **Implement** - Compliance benefits justify minimal cost   |
| **Publicly funded / Open source** | ✅ **Implement** - Transparency and trust benefits            |
| **Early-stage startup**           | ⚠️ **Consider** - Evaluate based on industry/compliance needs |
| **Internal tools / prototypes**   | ❌ **Skip** - Focus on core features first                    |

---

## Testing GPG Integration

### Manual Test (Local)

```bash
# 1. Generate test key
gpg --quick-generate-key "Test Key <test@example.com>" rsa4096 default 1y

# 2. Export for testing
export GPG_PRIVATE_KEY=$(gpg --armor --export-secret-keys "Test Key")
export GPG_KEY_ID="<KEY_ID>"

# 3. Run ledger update locally
npm run ethics:ledger-update

# 4. Verify signature generated
ls governance/ledger/*.json.asc

# 5. Verify signature
gpg --verify governance/ledger/<latest>.json.asc
```

### CI/CD Test

```bash
# 1. Add test GPG secrets to GitHub
# 2. Create test tag
git tag v0.0.1-gpg-test
git push origin v0.0.1-gpg-test

# 3. Approve deployment
# 4. Verify signature in committed ledger entry
git pull
gpg --verify governance/ledger/*-v0.0.1-gpg-test.json.asc
```

---

## Migration Path

### Adding GPG to Existing Pipeline

If you already have unsigned ledger entries:

```bash
# Step 1: Set up GPG keys (follow setup instructions)

# Step 2: Ledger script auto-detects GPG availability
# No code changes needed; signatures added automatically when secrets present

# Step 3: Historical entries remain unsigned (acceptable)
# New deployments will be signed

# Step 4: (Optional) Retroactively sign historical entries
for json in governance/ledger/*.json; do
  if [ ! -f "$json.asc" ]; then
    gpg --armor --detach-sign "$json"
  fi
done
```

### Disabling GPG Signatures

If you need to disable GPG signing:

```bash
# Option 1: Remove GitHub secrets
# Repository → Settings → Secrets → Delete GPG_PRIVATE_KEY and GPG_KEY_ID

# Option 2: Conditional in script
# Ledger update script checks if secrets exist; signatures optional
```

---

## Related Documentation

### GPG Signing (New Modular Architecture)

- **[Workflow Implementation](../.github/workflows/snippets/gpg-sign-ledger.yml)** - Reusable GPG signing workflow snippet
- **[Integration Guide](./governance/GPG_SIGNING_WORKFLOW.md)** - Comprehensive setup and integration instructions
- **[Validation Scenarios](./governance/GPG_SIGNING_VALIDATION.md)** - Test scenarios and acceptance criteria
- **[Example Integration](./examples/release-with-gpg-signing.yml)** - Complete release workflow with GPG signing

### CI/CD Architecture

- [CI/CD Implementation Summary](../BLOCK07.0_CICD_IMPLEMENTATION_SUMMARY.md) - Overall architecture
- [CI/CD Prompt Compliance Matrix](./CICD_PROMPT_COMPLIANCE_MATRIX.md) - Requirements coverage
- [CI/CD Testing Guide](./CICD_TESTING_GUIDE.md) - Validation procedures
- [CICD Review Checklist](../.github/CICD_REVIEW_CHECKLIST.md) - Deployment verification

---

## Support & References

### GPG Resources

- **Official documentation**: https://gnupg.org/documentation/
- **Best practices**: https://riseup.net/en/security/message-security/openpgp/best-practices
- **Key servers**: https://keys.openpgp.org

### QuantumPoly Governance

- **Public key location**: `governance/keys/cicd-public.key`
- **Ledger location**: `governance/ledger/`
- **Verification script**: `scripts/verify-ledger.mjs`

### Questions?

For implementation questions or issues:

1. Review this documentation
2. Check troubleshooting section
3. Verify setup instructions followed correctly
4. Consult team lead or security officer

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintained By:** CASP Lead Architect
