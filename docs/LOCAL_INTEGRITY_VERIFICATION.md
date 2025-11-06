---
title: Local Integrity & Hash Verification
author: QuantumPoly Governance Team
date: 2025-11-06
stage: Stage VI
tags:
  - Integrity
  - Verification
  - Governance
  - CI/CD
---

# Local Integrity & Hash Verification

**"Prove your build. Prove your chain."**

## Purpose

This document establishes the complete workflow for verifying that a local development codebase is **identical** to the canonical, governance-verified Stage VI state. Integrity is demonstrated through:

1. **Code quality gates** (linting, type-checking, testing)
2. **Deterministic build process** (reproducible artifacts)
3. **Cryptographic chain verification** (SHA-256 hash comparison)

The **Chain Checksum** is the single source of truth for Stage VI artifact integrity.

---

## Audience

- Engineers and contributors validating local changes
- Release managers preparing production deployments
- Governance and compliance reviewers
- CI/CD maintainers ensuring automated verification

---

## Prerequisites

### Environment Requirements

1. **Clean Git Working Tree**
   - No unstaged changes
   - No untracked files that could affect the build
   - Verify: `git status` should show "working tree clean"

2. **Node.js & npm Versions**
   - Node.js: `20.17.25` (or version specified in `package.json` engines)
   - npm: Compatible with Node version
   - Verify: `node -v && npm -v`
   - **Recommendation**: Use `.nvmrc` or `.tool-versions` for version pinning

3. **Dependency Lockfile Integrity**
   - Must use the same `package-lock.json` as the canonical branch
   - Install with: `npm ci` (not `npm install`)
   - This ensures deterministic dependency resolution

4. **System Information for Audit Trail**
   - Record OS version: `uname -a` (Linux/macOS) or `ver` (Windows)
   - Record git commit SHA: `git rev-parse HEAD`
   - Record timestamp: `date -u`

---

## Verification Workflow

### Step 1: Quality Gates

Run all code quality checks to ensure the codebase meets standards:

```bash
# Lint check (no errors allowed)
npm run lint

# TypeScript type check (zero errors)
npm run typecheck

# Test suite (all tests must pass)
npm run test
```

**Expected Result**: All three commands exit with code `0` (success).

**Common Failures**:
- **Linting errors**: Fix code style issues or add exceptions in ESLint config
- **TypeScript errors**: See [TypeScript Remediation](#typescript-remediation) below
- **Test failures**: Fix failing tests or update test expectations

---

### Step 2: Deterministic Build

Build the application with no warnings:

```bash
npm run build
```

**Expected Result**: 
- Build completes successfully
- No warnings in output
- `.next/` directory contains production artifacts

**Common Failures**:
- **Build warnings**: May indicate non-deterministic code paths
- **Environment variables**: Ensure no dynamic values leak into the build
- **Timestamps**: Check that no build artifacts contain embedded timestamps

---

### Step 3: Formatting Normalization

Normalize all code formatting to ensure stable hashes:

```bash
npm run format:write
```

**Purpose**: Prettier ensures consistent whitespace, indentation, and formatting across all files. This is **critical** because even a single space difference will change file hashes.

**Expected Result**: Command completes; files are formatted consistently.

---

### Step 4: Chain Checksum Computation

Compute the SHA-256 hash over all Stage VI artifacts:

```bash
node scripts/hash-stage-vi-artifacts.mjs
```

**Expected Output**:

```
🔐 Hashing Stage VI Artifacts (Blocks 10.2-10.9)

✅ 10.2: BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md
   [hash]

✅ 10.2: BLOCK10.2_IMPLEMENTATION_SUMMARY.md
   [hash]

[... additional artifacts ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Manifest Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Artifacts:   [N]/[N]
Missing:           0
Chain Checksum:    983eb29c2a75cb7ac51eb6b8524bde78554a755f45618c2329711b5db2b06b8e
Manifest Location: governance/ledger/stageVI-hashes.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Canonical Chain Checksum

**The canonical Stage VI chain checksum is:**

```
983eb29c2a75cb7ac51eb6b8524bde78554a755f45618c2329711b5db2b06b8e
```

This value is **fixed** and represents the governance-verified state of Stage VI (Blocks 10.2-10.9).

### Verification

**✅ PASS**: Your computed checksum **exactly matches** the canonical value above.

**❌ FAIL**: Any difference (even one character) indicates:
- Local modifications to Stage VI artifacts
- Missing or extra files in the artifact set
- Different formatting or line endings
- Dependency version mismatch affecting build outputs

---

## Acceptance Criteria

All criteria must be true for integrity verification to pass:

- [x] **No linter errors** (warnings optional but recommended 0)
- [x] **Typecheck passes** with zero errors
- [x] **All tests green**
- [x] **Build completes** with no warnings
- [x] **Chain Checksum matches exactly**:
  ```
  983eb29c2a75cb7ac51eb6b8524bde78554a755f45618c2329711b5db2b06b8e
  ```
  (Case-sensitive comparison; no spaces; full 64 hex characters)

---

## Failure Modes & Remediation

### TypeScript Remediation

The following files are known to require careful type handling:

#### `src/lib/monitoring/report-reader.ts`

**Issue**: Unsafe `any` types for ledger entry handling.

**Remediation**:
- Replace `any` with `Record<string, unknown>` for ledger entries
- Add type guards for runtime validation:
  ```typescript
  function isLedgerEntry(obj: unknown): obj is LedgerEntry {
    return typeof obj === 'object' && obj !== null;
  }
  ```
- Use type narrowing for `entry_id`, `id`, `documents` fields
- Prefer `unknown` over `any`; narrow with guards

**Re-verify**: `npm run typecheck`

#### `src/lib/trust/proof-verifier.ts`

**Issue**: Multiple `any` types for ledger entry parameters.

**Remediation**:
- Define `LedgerEntry` interface:
  ```typescript
  interface LedgerEntry {
    entry_id?: string;
    id?: string;
    hash?: string;
    pdf_hash?: string;
    documents?: string[];
    [key: string]: unknown;
  }
  ```
- Replace all `any` parameters with `LedgerEntry | null`
- Add runtime checks before accessing optional fields
- Use `hasOwnProperty` or `in` operator for safe property access

**Re-verify**: `npm run typecheck`

---

### Build Warnings

**Symptoms**: Build completes but with warnings about:
- Deprecated dependencies
- Large bundle sizes
- Unused exports

**Remediation**:
- Review and suppress expected warnings
- Update dependencies if needed
- Consider code-splitting for large bundles
- Ensure warnings don't indicate non-determinism

---

### Hash Mismatch

**Symptoms**: Computed chain checksum differs from canonical value.

**Diagnostic Steps**:

1. **Verify formatting was applied**:
   ```bash
   npm run format:write
   git diff --stat
   ```
   If files changed, formatting wasn't normalized before the prior hash.

2. **Check artifact set matches canonical**:
   - Review `scripts/hash-stage-vi-artifacts.mjs` line 20-58
   - Ensure all listed files exist
   - Verify no optional files are incorrectly present/absent

3. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm ci
   ```

4. **Try on clean clone**:
   ```bash
   git clone <repo-url> /tmp/integrity-check
   cd /tmp/integrity-check
   npm ci
   npm run integrity:full
   ```

5. **Capture environment details**:
   ```bash
   node -v > integrity-debug.txt
   npm -v >> integrity-debug.txt
   uname -a >> integrity-debug.txt
   git rev-parse HEAD >> integrity-debug.txt
   ```

If hash still diverges after these steps, **do not proceed**. This indicates:
- Potential tampering
- Non-deterministic build process
- Environmental dependency issues

**Report to governance team** with captured environment details.

---

## One-Click Verification

### Complete Check

Run the full integrity verification workflow with a single command:

```bash
npm run integrity:full
```

This executes:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`
5. `npm run format:write`
6. `node scripts/hash-stage-vi-artifacts.mjs`
7. Verification against canonical checksum

**Time**: Approximately 2-5 minutes depending on hardware.

### Quick Chain Verification

If quality gates already passed, verify just the chain checksum:

```bash
npm run integrity:verify-chain
```

This runs verification mode of the hashing script.

---

## Evidence Collection

For governance review and sign-off, attach the following:

### Required Evidence

1. **Command Transcript**
   - Full terminal output from `npm run integrity:full`
   - Or CI logs with complete run details

2. **Checksum Verification**
   - Final "Chain Checksum" line from script output
   - Must exactly match canonical value

3. **Environment Details**
   - Node version: `node -v`
   - npm version: `npm -v`
   - OS: `uname -a` or Windows version
   - Git commit SHA: `git rev-parse HEAD`

4. **Diff of Fixes** (if TypeScript errors were fixed)
   - `git diff` output showing changes to:
     - `src/lib/monitoring/report-reader.ts`
     - `src/lib/trust/proof-verifier.ts`
   - Commit message explaining type safety improvements

### Optional Evidence

- Test coverage report: `npm run test:coverage`
- Lighthouse audit results
- Bundle analysis output

---

## CI/CD Integration

### Automated Daily Verification

The integrity verification runs automatically via GitHub Actions:

**Schedule**: Daily at 00:00 UTC  
**Workflow**: `.github/workflows/integrity-verification.yml`

**Purpose**:
- Detect drift from canonical state
- Verify reproducible builds in clean environment
- Provide continuous integrity assurance

### Manual Trigger

Trigger verification workflow manually from GitHub Actions UI:

1. Navigate to **Actions** tab
2. Select **"Integrity Verification"** workflow
3. Click **"Run workflow"**
4. Select branch and run

### Local Pre-Commit Verification

For developers committing to protected branches:

```bash
# Before committing to main/production
npm run integrity:full

# If pass, commit
git add .
git commit -m "feat: [description]"

# Tag with integrity proof
git tag -a "integrity/stage-vi-$(date +%Y%m%d)" \
  -m "Integrity verified. Chain checksum: 983eb29c2a75cb7ac51eb6b8524bde78554a755f45618c2329711b5db2b06b8e"
```

---

## Quality & Ethics

### Governance Principles

1. **Transparency**: All verification steps are documented and auditable
2. **Determinism**: Same inputs always produce same outputs
3. **Immutability**: Canonical checksum never changes without governance approval
4. **Traceability**: Full audit trail from code to verification

### Prohibited Actions

**DO NOT**:
- Alter the hashing script's target artifact set without governance approval
- Commit changes that fail integrity verification
- Modify the canonical checksum value
- Skip verification steps to "save time"
- Use `npm install` instead of `npm ci` for verification runs

**ALWAYS**:
- Run complete verification before production deployments
- Document any deviations from expected results
- Escalate hash mismatches to governance team
- Maintain clean git history for audit trail

---

## Troubleshooting

### Common Issues

#### "Missing artifact" error

**Cause**: Expected Stage VI file not found.

**Solution**: Ensure you're on the correct branch with all Stage VI artifacts. Check `STAGE_VI_ARTIFACTS` array in hash script.

#### "TypeScript compilation failed"

**Cause**: Type errors in source code.

**Solution**: See [TypeScript Remediation](#typescript-remediation) above.

#### "Tests failing"

**Cause**: Code changes broke existing tests.

**Solution**: Fix tests or update test expectations. Never skip failing tests.

#### "Hash changes after every run"

**Cause**: Non-deterministic content in artifacts (timestamps, random values).

**Solution**: Review changed files, ensure no dynamic content, verify formatting is stable.

---

## Final Assertion

When integrity verification passes, include this statement in PR descriptions or deployment documentation:

```
✅ Integrity verified locally.

Chain Checksum: 983eb29c2a75cb7ac51eb6b8524bde78554a755f45618c2329711b5db2b06b8e

Matches canonical Stage VI governance hash.

Environment:
- Node: [version]
- npm: [version]
- OS: [system]
- Commit: [SHA]
- Date: [ISO 8601 timestamp]
```

---

## References

- **Hash Script**: `scripts/hash-stage-vi-artifacts.mjs`
- **Stage VI Artifacts**: Blocks 10.2-10.9 documentation and ledger entries
- **Governance Ledger**: `governance/ledger/stageVI-hashes.json`
- **CI Workflow**: `.github/workflows/integrity-verification.yml`

---

## Change Log

| Date       | Change                                      | Author                      |
|------------|---------------------------------------------|----------------------------|
| 2025-11-06 | Initial creation of verification framework  | QuantumPoly Governance Team |

---

**Last Updated**: 2025-11-06  
**Governance Stage**: VI (Blocks 10.2-10.9)  
**Verification Status**: ✅ Active

