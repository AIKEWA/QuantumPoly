# GPG Signing Validation Test Scenarios

**Date:** 2025-10-23  
**Author:** CASP Lead Architect  
**Status:** Validation Reference  
**Classification:** Quality Assurance

---

## Overview

This document provides comprehensive test scenarios for validating the GPG ledger signing workflow. Each scenario includes setup steps, expected behavior, log excerpts, and pass/fail criteria. These scenarios serve as acceptance tests for the workflow and troubleshooting references for operators.

### Purpose

The validation scenarios ensure:

1. **Functional correctness**: Workflow operates as designed under normal conditions
2. **Error handling**: Graceful degradation when prerequisites are missing
3. **Security validation**: Tamper detection functions correctly
4. **Idempotency**: Re-running produces consistent, deterministic results
5. **Compliance verification**: Audit trail meets regulatory requirements

### Test Environment Setup

All scenarios assume:

- GitHub Actions runner: `ubuntu-latest`
- Workflow file: `.github/workflows/snippets/gpg-sign-ledger.yml`
- GPG version: ≥ 2.2.0
- Test ledger file: `governance/ledger/releases/2025-10-23-v1.0.0.json`

---

## Scenario 1: Valid Key - Successful Signing

### Description

Standard success case where all prerequisites are met and signing completes successfully.

### Setup Steps

1. Generate test GPG key:

   ```bash
   gpg --batch --passphrase '' --quick-gen-key "Test CI/CD <test@example.com>" rsa4096 default 2y
   ```

2. Export and configure secrets:

   ```bash
   KEY_ID=$(gpg --list-keys --with-colons "Test CI/CD" | awk -F: '/^pub:/ {print $5}')
   PRIVATE_KEY=$(gpg --armor --export-secret-keys "$KEY_ID")

   # Add to GitHub Secrets:
   # GPG_PRIVATE_KEY: $PRIVATE_KEY
   # GPG_KEY_ID: $KEY_ID
   ```

3. Create test ledger file:

   ```bash
   mkdir -p governance/ledger/releases
   cat > governance/ledger/releases/2025-10-23-v1.0.0.json << EOF
   {
     "version": "1.0.0",
     "tag": "v1.0.0",
     "timestamp": "2025-10-23T12:34:56Z",
     "commit": "abc123def456",
     "eiiScore": 92.5
   }
   EOF
   ```

4. Trigger workflow with:
   ```yaml
   with:
     ledger_file_path: governance/ledger/releases/2025-10-23-v1.0.0.json
     sign_enabled: true
   ```

### Expected Behavior

1. Prerequisites validation passes
2. GPG keyring setup succeeds
3. Private key imports successfully
4. Ledger file is clearsigned
5. Signature verification passes
6. `.asc` file uploaded as artifact
7. Job completes with success status

### Expected Log Excerpts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Ledger Signing - Prerequisites Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Ledger file: governance/ledger/releases/2025-10-23-v1.0.0.json
✅ GPG secrets configured
✅ Prerequisites validated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Environment Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created temporary keyring: /tmp/gnupg
📥 Importing GPG private key...
✅ Key imported successfully
   Key ID: ABCD1234ABCD1234
   Fingerprint (last 8): ********12345678

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Clearsign Operation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Input:  governance/ledger/releases/2025-10-23-v1.0.0.json
🔏 Output: governance/ledger/releases/2025-10-23-v1.0.0.json.asc

🔐 Signing with key: ABCD1234ABCD1234
✅ Signature created successfully
   File: governance/ledger/releases/2025-10-23-v1.0.0.json.asc
   Size: 1234 bytes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Signature Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verifying: governance/ledger/releases/2025-10-23-v1.0.0.json.asc

gpg: Signature made Thu Oct 23 12:34:56 2025 UTC
gpg:                using RSA key ABCD1234ABCD1234
gpg: Good signature from "Test CI/CD <test@example.com>"

✅ Signature verification PASSED
   Ledger integrity confirmed
   Signature is cryptographically valid
```

### Pass Criteria

- [x] Job status: `success`
- [x] Artifact `ledger-signatures` uploaded
- [x] File `2025-10-23-v1.0.0.json.asc` exists in artifact
- [x] No errors in workflow logs
- [x] Summary shows "✅ Signing Successful"

### Verification Commands

```bash
# Download artifact from workflow run
# Verify signature locally
gpg --import governance/keys/cicd-public.key
gpg --verify governance/ledger/releases/2025-10-23-v1.0.0.json.asc

# Expected output: "Good signature"
```

---

## Scenario 2: Missing Secrets - Graceful Skip

### Description

Workflow behavior when `GPG_PRIVATE_KEY` or `GPG_KEY_ID` secrets are not configured.

### Setup Steps

1. **Do not configure** GitHub Secrets (or delete existing secrets):
   - `GPG_PRIVATE_KEY`: not set
   - `GPG_KEY_ID`: not set

2. Create test ledger file (same as Scenario 1)

3. Trigger workflow with:
   ```yaml
   with:
     ledger_file_path: governance/ledger/releases/2025-10-23-v1.0.0.json
     sign_enabled: true
   ```

### Expected Behavior

1. Prerequisites validation detects missing secrets
2. Workflow sets status output to `skip`
3. Subsequent signing steps are skipped
4. Job completes with success status (not failure)
5. Summary shows "⏭️ Signing Skipped" message

### Expected Log Excerpts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Ledger Signing - Prerequisites Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ ERROR: GPG secrets not configured

Required GitHub Secrets:
  - GPG_PRIVATE_KEY: ASCII-armored private key
  - GPG_KEY_ID: Key identifier

See: docs/governance/GPG_SIGNING_WORKFLOW.md
```

### Expected Summary Output

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔐 GPG Ledger Signing Report

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ⏭️ Signing Skipped

**Reason:** GPG secrets not configured or signing disabled

To enable GPG signing:

1. Configure `GPG_PRIVATE_KEY` and `GPG_KEY_ID` secrets
2. Set `sign_enabled: true` in workflow call
3. See: `docs/governance/GPG_SIGNING_WORKFLOW.md`
```

### Pass Criteria

- [x] Job status: `success` (not `failure`)
- [x] No artifact uploaded (expected behavior)
- [x] Log shows "GPG secrets not configured"
- [x] Summary shows "⏭️ Signing Skipped"
- [x] No subsequent steps executed

### Verification Commands

```bash
# Check workflow run status via GitHub CLI
gh run view <run-id> --json conclusion
# Expected: "conclusion": "success"

# Verify no artifacts uploaded
gh run view <run-id> --json artifacts
# Expected: "artifacts": []
```

---

## Scenario 3: Tampered Ledger - Verification Failure

### Description

Demonstrates that signature verification detects post-signing modifications to ledger content.

### Setup Steps

1. Complete Scenario 1 (successful signing)

2. Manually modify the signed `.asc` file to tamper with ledger content:

   ```bash
   # Edit the clearsigned file, changing JSON content between signature blocks
   sed -i 's/"eiiScore": 92.5/"eiiScore": 95.0/' \
     governance/ledger/releases/2025-10-23-v1.0.0.json.asc
   ```

3. Re-trigger workflow verification step (or run locally):
   ```bash
   gpg --verify governance/ledger/releases/2025-10-23-v1.0.0.json.asc
   ```

### Expected Behavior

1. GPG verification detects signature mismatch
2. `gpg --verify` returns non-zero exit code
3. Workflow step fails with clear error message
4. Job status: `failure`
5. Summary shows "❌ Signing Failed"

### Expected Log Excerpts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Signature Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verifying: governance/ledger/releases/2025-10-23-v1.0.0.json.asc

gpg: Signature made Thu Oct 23 12:34:56 2025 UTC
gpg:                using RSA key ABCD1234ABCD1234
gpg: BAD signature from "Test CI/CD <test@example.com>"

❌ ERROR: Signature verification failed

Possible causes:
  - Ledger file was modified after signing
  - Wrong GPG key used
  - Signature file corrupted

Remediation:
  1. Verify ledger file integrity
  2. Check GPG_KEY_ID matches the signing key
  3. Re-run signing workflow
```

### Pass Criteria

- [x] Job status: `failure` (expected)
- [x] Log shows "BAD signature"
- [x] Error message includes remediation steps
- [x] Workflow exits with non-zero code
- [x] Summary shows "❌ Signing Failed"

### Verification Commands

```bash
# Verify locally (should fail)
gpg --verify governance/ledger/releases/2025-10-23-v1.0.0.json.asc
echo $?
# Expected exit code: 1 (failure)

# Compare with original (should succeed)
git checkout governance/ledger/releases/2025-10-23-v1.0.0.json.asc
gpg --verify governance/ledger/releases/2025-10-23-v1.0.0.json.asc
echo $?
# Expected exit code: 0 (success)
```

---

## Scenario 4: Wrong Key ID - Import Failure

### Description

Workflow behavior when `GPG_KEY_ID` does not match the key in `GPG_PRIVATE_KEY`.

### Setup Steps

1. Generate test GPG key (same as Scenario 1)

2. Configure secrets with **mismatched key ID**:

   ```bash
   # Export correct private key
   PRIVATE_KEY=$(gpg --armor --export-secret-keys "Test CI/CD")

   # Use WRONG key ID
   WRONG_KEY_ID="0000000000000000"

   # Add to GitHub Secrets:
   # GPG_PRIVATE_KEY: $PRIVATE_KEY (correct)
   # GPG_KEY_ID: $WRONG_KEY_ID (incorrect)
   ```

3. Trigger workflow with valid ledger file

### Expected Behavior

1. Prerequisites validation passes (secrets exist)
2. GPG keyring setup succeeds
3. Private key import succeeds (imports all keys in keyring)
4. Key listing with wrong ID fails
5. Setup step fails with clear error message
6. Job status: `failure`

### Expected Log Excerpts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Environment Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Created temporary keyring: /tmp/gnupg
📥 Importing GPG private key...
❌ ERROR: Failed to import GPG key with ID: 0000000000000000
```

### Pass Criteria

- [x] Job status: `failure` (expected)
- [x] Log shows "Failed to import GPG key"
- [x] Error includes the wrong key ID
- [x] No signature file created
- [x] Clear remediation guidance provided

### Verification Commands

```bash
# Verify key ID matches private key
gpg --import private.key
gpg --list-secret-keys --with-colons | grep "^sec" | cut -d: -f5
# Compare output with configured GPG_KEY_ID secret
```

---

## Scenario 5: Re-run - Idempotency Test

### Description

Verifies that re-running the workflow on the same ledger file produces deterministic results.

### Setup Steps

1. Complete Scenario 1 (successful signing)

2. Note signature file details:

   ```bash
   sha256sum governance/ledger/releases/2025-10-23-v1.0.0.json.asc
   # Record hash: <hash-1>
   ```

3. Re-trigger workflow with identical inputs

4. Compare new signature:
   ```bash
   sha256sum governance/ledger/releases/2025-10-23-v1.0.0.json.asc
   # Record hash: <hash-2>
   ```

### Expected Behavior

1. Workflow detects existing signature file
2. Log shows "⚠️ Removing existing signature (re-signing)"
3. New signature created successfully
4. New signature replaces old signature
5. **Note:** Hash may differ due to timestamp in signature, but verification succeeds for both

### Expected Log Excerpts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GPG Clearsign Operation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Input:  governance/ledger/releases/2025-10-23-v1.0.0.json
🔏 Output: governance/ledger/releases/2025-10-23-v1.0.0.json.asc

⚠️  Removing existing signature (re-signing)
🔐 Signing with key: ABCD1234ABCD1234
✅ Signature created successfully
   File: governance/ledger/releases/2025-10-23-v1.0.0.json.asc
   Size: 1234 bytes
```

### Pass Criteria

- [x] Job status: `success` (both runs)
- [x] Log shows "Removing existing signature"
- [x] New signature file created
- [x] Both signatures verify successfully
- [x] No errors during re-run

### Verification Commands

```bash
# Verify both signatures (before and after re-run)
# Save first signature
cp governance/ledger/releases/2025-10-23-v1.0.0.json.asc /tmp/signature-v1.asc

# Re-run workflow

# Save second signature
cp governance/ledger/releases/2025-10-23-v1.0.0.json.asc /tmp/signature-v2.asc

# Verify both
gpg --verify /tmp/signature-v1.asc  # Should pass
gpg --verify /tmp/signature-v2.asc  # Should pass

# Signatures may differ in timestamp but both are valid
diff /tmp/signature-v1.asc /tmp/signature-v2.asc
# Expected: Differences in signature block timestamps
```

---

## Scenario 6: Disabled Signing - Input Toggle

### Description

Verifies graceful skip when `sign_enabled: false` is explicitly set.

### Setup Steps

1. Configure GitHub Secrets correctly (same as Scenario 1)

2. Create test ledger file

3. Trigger workflow with **signing disabled**:
   ```yaml
   with:
     ledger_file_path: governance/ledger/releases/2025-10-23-v1.0.0.json
     sign_enabled: false
   ```

### Expected Behavior

1. Job-level conditional prevents job execution
2. Job shows as "skipped" in workflow visualization
3. No steps execute
4. Workflow completes successfully
5. No artifacts uploaded

### Expected Workflow UI

```
sign-and-verify ⏭️  Skipped
  Condition: inputs.sign_enabled == true
  Result: false
```

### Pass Criteria

- [x] Job status: `skipped`
- [x] No logs generated (job didn't run)
- [x] No artifacts uploaded
- [x] Workflow overall status: `success`
- [x] Subsequent jobs execute normally (if any)

### Verification Commands

```bash
# Check job status via GitHub CLI
gh run view <run-id> --json jobs --jq '.jobs[] | select(.name == "Sign & Verify Ledger") | .conclusion'
# Expected output: "skipped"
```

---

## Scenario 7: Expired Key - Warning but Valid

### Description

Behavior when signing with an expired GPG key (signature still valid, but warning shown).

### Setup Steps

1. Generate test GPG key with **short expiration**:

   ```bash
   gpg --batch --passphrase '' --quick-gen-key "Expired Test <expired@example.com>" rsa4096 default 1d
   ```

2. Wait 1 day for key to expire

3. Configure secrets with expired key

4. Trigger workflow

### Expected Behavior

1. Key imports successfully (expired keys can still sign)
2. Signing succeeds (signature is technically valid)
3. Verification shows **warning** about expired key
4. Job status: `success` (warning, not error)
5. Operator should rotate key soon

### Expected Log Excerpts

```
gpg: Signature made Thu Oct 23 12:34:56 2025 UTC
gpg:                using RSA key ABCD1234ABCD1234
gpg: Good signature from "Expired Test <expired@example.com>"
gpg: Note: This key has expired!
Primary key fingerprint: ABCD 1234 ABCD 1234 ABCD  1234 ABCD 1234 ABCD 1234

✅ Signature verification PASSED
   ⚠️  WARNING: Signing key has expired
   Ledger integrity confirmed
   Signature is cryptographically valid
```

### Pass Criteria

- [x] Job status: `success` (signature still valid)
- [x] Warning shown about expired key
- [x] Signature verifies successfully
- [x] Recommendation to rotate key logged

### Verification Commands

```bash
# Check key expiration
gpg --list-keys "Expired Test"
# Output shows: [expired: 2025-10-24]

# Signature still verifies (with warning)
gpg --verify governance/ledger/releases/2025-10-23-v1.0.0.json.asc
# Exit code: 0 (success, despite warning)
```

---

## Compliance Validation Matrix

### SOC 2 CC6.1 - Audit Log Integrity

| Test Scenario | Validates                    | Pass Criteria                |
| ------------- | ---------------------------- | ---------------------------- |
| Scenario 1    | Cryptographic proof creation | ✅ Valid signature generated |
| Scenario 3    | Tamper detection             | ✅ Modified content detected |
| Scenario 5    | Deterministic re-signing     | ✅ Idempotent operations     |

### ISO 27001 A.12.4.2 - Log Protection

| Test Scenario | Validates                | Pass Criteria                          |
| ------------- | ------------------------ | -------------------------------------- |
| Scenario 1    | Signature creation       | ✅ Tamper-evident artifact created     |
| Scenario 3    | Integrity verification   | ✅ BAD signature detected on tampering |
| Scenario 7    | Key lifecycle management | ⚠️ Expired key warning shown           |

### EWA-GOV Control 7.4 - Cryptographic Proof

| Test Scenario | Validates                     | Pass Criteria              |
| ------------- | ----------------------------- | -------------------------- |
| Scenario 1    | Clearsign + verify operations | ✅ Both operations succeed |
| Scenario 3    | Cryptographic verification    | ✅ Tamper detection works  |
| Scenario 4    | Key management                | ✅ Wrong key rejected      |

### EWA-HIL-02 - Manual Override Governance

| Test Scenario | Validates             | Pass Criteria           |
| ------------- | --------------------- | ----------------------- |
| Scenario 2    | Graceful degradation  | ✅ Skip without failure |
| Scenario 6    | Manual toggle control | ✅ Respects input flag  |

---

## Automated Test Suite

### Integration Test Script

```bash
#!/bin/bash
# GPG Signing Workflow Integration Tests
# Run locally before committing workflow changes

set -euo pipefail

TEST_DIR="/tmp/gpg-signing-tests"
PASSED=0
FAILED=0

# Cleanup and setup
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GPG Signing Workflow - Integration Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Generate key and sign
test_successful_signing() {
  echo "Test 1: Successful Signing"

  # Generate test key
  gpg --batch --passphrase '' --quick-gen-key "Test <test@example.com>" rsa4096 default 1y 2>/dev/null

  # Create test file
  echo '{"test": "data"}' > "$TEST_DIR/test.json"

  # Sign
  gpg --batch --yes --local-user "Test" --output "$TEST_DIR/test.json.asc" --clearsign "$TEST_DIR/test.json"

  # Verify
  if gpg --verify "$TEST_DIR/test.json.asc" 2>&1 | grep -q "Good signature"; then
    echo "  ✅ PASSED"
    ((PASSED++))
  else
    echo "  ❌ FAILED"
    ((FAILED++))
  fi
  echo ""
}

# Test 2: Tamper detection
test_tamper_detection() {
  echo "Test 2: Tamper Detection"

  # Copy signed file
  cp "$TEST_DIR/test.json.asc" "$TEST_DIR/tampered.json.asc"

  # Tamper with content
  sed -i 's/test/tampered/' "$TEST_DIR/tampered.json.asc"

  # Verify should fail
  if gpg --verify "$TEST_DIR/tampered.json.asc" 2>&1 | grep -q "BAD signature"; then
    echo "  ✅ PASSED (tampering detected)"
    ((PASSED++))
  else
    echo "  ❌ FAILED (tampering not detected)"
    ((FAILED++))
  fi
  echo ""
}

# Test 3: Idempotency
test_idempotency() {
  echo "Test 3: Idempotency"

  # Sign twice
  gpg --batch --yes --local-user "Test" --output "$TEST_DIR/sign1.asc" --clearsign "$TEST_DIR/test.json"
  gpg --batch --yes --local-user "Test" --output "$TEST_DIR/sign2.asc" --clearsign "$TEST_DIR/test.json"

  # Both should verify
  if gpg --verify "$TEST_DIR/sign1.asc" 2>&1 | grep -q "Good signature" && \
     gpg --verify "$TEST_DIR/sign2.asc" 2>&1 | grep -q "Good signature"; then
    echo "  ✅ PASSED (both signatures valid)"
    ((PASSED++))
  else
    echo "  ❌ FAILED (signatures not valid)"
    ((FAILED++))
  fi
  echo ""
}

# Run tests
test_successful_signing
test_tamper_detection
test_idempotency

# Cleanup
gpg --batch --yes --delete-secret-keys "Test" 2>/dev/null || true
gpg --batch --yes --delete-keys "Test" 2>/dev/null || true
rm -rf "$TEST_DIR"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary: $PASSED passed, $FAILED failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -gt 0 ]; then
  exit 1
fi
```

---

## Acceptance Test Checklist

Before approving the GPG signing workflow for production use:

- [ ] **Scenario 1** passes: Valid key produces good signature
- [ ] **Scenario 2** passes: Missing secrets skip gracefully
- [ ] **Scenario 3** passes: Tampered content detected
- [ ] **Scenario 4** passes: Wrong key ID rejected
- [ ] **Scenario 5** passes: Re-run is idempotent
- [ ] **Scenario 6** passes: Manual toggle works
- [ ] **Scenario 7** passes: Expired key warning shown
- [ ] No secrets exposed in workflow logs
- [ ] Artifacts retained for 90 days (compliance requirement)
- [ ] Documentation references accurate

---

## Related Documentation

- **Workflow Implementation:** `/.github/workflows/snippets/gpg-sign-ledger.yml`
- **Integration Guide:** `/docs/governance/GPG_SIGNING_WORKFLOW.md`
- **Example Usage:** `/docs/examples/release-with-gpg-signing.yml`
- **CI/CD Architecture:** `/docs/CICD_GPG_LEDGER_INTEGRATION.md`

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-23  
**Maintained By:** CASP Lead Architect  
**Review Cycle:** After each workflow modification
