# CI/CD Testing Guide

**Date:** 2025-10-19  
**Author:** CASP Lead Architect  
**Purpose:** Comprehensive manual validation procedures for CI/CD pipeline

---

## Overview

This guide provides step-by-step procedures for validating the QuantumPoly CI/CD pipeline. Use this guide when:

- **Initial setup** - First-time pipeline deployment
- **After changes** - Modifications to workflows or infrastructure
- **Regular audits** - Quarterly validation for compliance
- **Incident response** - Verifying pipeline integrity after security events

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Environment Setup](#test-environment-setup)
3. [Pull Request Flow Testing](#pull-request-flow-testing)
4. [Staging Deployment Testing](#staging-deployment-testing)
5. [Production Deployment Testing](#production-deployment-testing)
6. [Failure Scenario Testing](#failure-scenario-testing)
7. [Ledger Integrity Verification](#ledger-integrity-verification)
8. [Performance & Timing Validation](#performance--timing-validation)
9. [Security Validation](#security-validation)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Prerequisites

### Required Access

- [ ] **GitHub repository**: Write access (create branches, PRs)
- [ ] **GitHub Actions**: View workflow runs and logs
- [ ] **GitHub Environment**: Production reviewer (for approval testing)
- [ ] **Vercel project**: View deployments (optional, for URL verification)

### Required Tools

```bash
# Git (≥ 2.30)
git --version

# Node.js 20.x LTS
node --version

# npm (≥ 9.0)
npm --version

# GitHub CLI (optional, but helpful)
gh --version

# curl (for endpoint testing)
curl --version

# GPG (optional, for signature verification)
gpg --version
```

### Required Knowledge

- Git branching and PR workflow
- GitHub Actions basics
- Command-line proficiency
- Next.js application structure (basic)

---

## Test Environment Setup

### Step 1: Clone Repository

```bash
# Clone repository
git clone https://github.com/your-org/quantumpoly.git
cd quantumpoly

# Verify remote
git remote -v

# Fetch all branches
git fetch --all
```

### Step 2: Verify Local Development

```bash
# Install dependencies
npm ci

# Verify quality gates locally
npm run lint
npm run typecheck
npm run test

# Verify build succeeds
npm run build

# Optional: Run dev server
npm run dev
# Visit http://localhost:3000
```

### Step 3: Create Test Branch

```bash
# Create test branch from main
git checkout main
git pull
git checkout -b test/cicd-validation-$(date +%Y%m%d)

# Verify branch
git branch
```

---

## Pull Request Flow Testing

### Test 1: Successful PR with All Gates Passing

**Objective:** Verify quality gates execute and pass for clean code

**Steps:**

1. **Make trivial valid change**

   ```bash
   echo "\n## CI/CD Test - $(date)" >> README.md
   git add README.md
   git commit -m "test: CI/CD validation - clean code"
   git push origin test/cicd-validation-$(date +%Y%m%d)
   ```

2. **Create PR via GitHub UI**
   - Navigate to repository on GitHub
   - Click "Compare & pull request"
   - Title: "Test: CI/CD Validation - Clean Code"
   - Description: "Testing all quality gates with valid code"
   - Click "Create pull request"

3. **Monitor workflow execution**
   - Go to "Actions" tab
   - Find "CI - Unified Quality Gates" workflow
   - Watch jobs execute in real-time

4. **Verify expected results**
   - [ ] Quality job: ✅ PASSED (lint, typecheck, tests)
   - [ ] Accessibility job: ✅ PASSED
   - [ ] Performance job: ✅ PASSED
   - [ ] Governance job: ✅ PASSED
   - [ ] Build job: ✅ PASSED
   - [ ] E2E job: ✅ PASSED
   - [ ] CI report job: ✅ POSTED (check PR comments)
   - [ ] Deploy gate job: ✅ PASSED

5. **Verify artifacts uploaded**
   - Click on workflow run
   - Scroll to "Artifacts" section
   - Verify presence:
     - `coverage-report` (30-day retention)
     - `junit-report` (30-day retention)
     - `lighthouse-accessibility-evidence` (90-day retention)
     - `governance-reports` (90-day retention)
     - `build-output` (7-day retention)
     - `playwright-e2e-report` (30-day retention)

6. **Verify CI summary comment**
   - Return to PR page
   - Find bot comment "🚦 CI Quality Gates Summary"
   - Verify contains:
     - Gate status table (all passed)
     - Lighthouse scores (A11y ≥95, Perf ≥90)
     - EII score (if available)
     - Artifact links

7. **Verify merge readiness**
   - PR status: "All checks have passed"
   - Merge button: Enabled (green)

**Success Criteria:** All jobs pass, artifacts uploaded, PR ready to merge

---

### Test 2: PR with Lint Errors

**Objective:** Verify linting errors block merge

**Steps:**

1. **Introduce lint error**

   ```bash
   # Create file with ESLint violation
   echo "const unused = 123; export {};" > src/lib/test-lint-error.ts
   git add src/lib/test-lint-error.ts
   git commit -m "test: introduce lint error"
   git push
   ```

2. **Monitor workflow**
   - Quality job should fail at "Run linter" step

3. **Verify expected results**
   - [ ] Quality job: ❌ FAILED (lint step)
   - [ ] Subsequent jobs: ⏭️ SKIPPED (build, e2e depend on quality)
   - [ ] PR status: "Some checks were not successful"
   - [ ] Merge button: Disabled (gray)

4. **Verify error clarity**
   - Click on failed Quality job
   - Find "Run linter" step
   - Verify actionable error message shows:
     - File path with error
     - Line number
     - Rule violated
     - How to fix

5. **Fix and verify recovery**

   ```bash
   # Remove test file
   git rm src/lib/test-lint-error.ts
   git commit -m "fix: remove lint error"
   git push

   # Workflow re-runs automatically
   # Verify Quality job now passes
   ```

**Success Criteria:** Lint error blocks merge; fix unblocks merge

---

### Test 3: PR with TypeScript Errors

**Objective:** Verify type errors block merge

**Steps:**

1. **Introduce type error**

   ```bash
   echo "const x: string = 123; export {};" > src/lib/test-type-error.ts
   git add src/lib/test-type-error.ts
   git commit -m "test: introduce type error"
   git push
   ```

2. **Verify expected results**
   - [ ] Quality job: ❌ FAILED (typecheck step)
   - [ ] TypeScript error visible in logs:
     ```
     src/lib/test-type-error.ts:1:7 - error TS2322:
     Type 'number' is not assignable to type 'string'.
     ```

3. **Fix and verify**
   ```bash
   git rm src/lib/test-type-error.ts
   git commit -m "fix: remove type error"
   git push
   ```

**Success Criteria:** Type error blocks merge; TypeScript output is actionable

---

### Test 4: PR with Test Failures

**Objective:** Verify test failures block merge

**Steps:**

1. **Create failing test**

   ```bash
   mkdir -p __tests__/temp
   cat > __tests__/temp/fail.test.ts << 'EOF'
   describe('Intentional Failure', () => {
     test('should fail', () => {
       expect(true).toBe(false);
     });
   });
   EOF
   git add __tests__/temp/fail.test.ts
   git commit -m "test: introduce test failure"
   git push
   ```

2. **Verify expected results**
   - [ ] Quality job: ❌ FAILED (test step)
   - [ ] Test output shows specific failure
   - [ ] Coverage artifact still uploaded (if-always)

3. **Fix and verify**
   ```bash
   git rm -r __tests__/temp
   git commit -m "fix: remove failing test"
   git push
   ```

**Success Criteria:** Test failure blocks merge; Jest output shows failure details

---

### Test 5: Cleanup Test Branch

```bash
# After all PR tests complete, merge or close test PR
# Via GitHub UI: Close PR without merging

# Delete local branch
git checkout main
git branch -D test/cicd-validation-$(date +%Y%m%d)

# Delete remote branch (if desired)
git push origin --delete test/cicd-validation-$(date +%Y%m%d)
```

---

## Staging Deployment Testing

### Test 6: Merge to Main → Staging Deployment

**Objective:** Verify staging auto-deploys on main merge

**Prerequisites:** PR with all checks passing

**Steps:**

1. **Create clean PR for staging test**

   ```bash
   git checkout main
   git pull
   git checkout -b test/staging-deploy
   echo "\n## Staging Test - $(date)" >> README.md
   git add README.md
   git commit -m "test: staging deployment"
   git push origin test/staging-deploy

   # Create PR via gh CLI or GitHub UI
   gh pr create --title "Test: Staging Deployment" --body "Testing staging auto-deploy"
   ```

2. **Wait for CI to pass**
   - Verify all quality gates pass

3. **Merge PR**
   - Click "Squash and merge" or "Merge pull request"
   - Confirm merge

4. **Monitor staging deployment**
   - Navigate to Actions → "Release - Staging & Production Deployment"
   - Find workflow triggered by push to main
   - Watch `deploy-staging` job

5. **Verify expected results**
   - [ ] CI workflow re-runs on main: ✅ PASSED
   - [ ] Release workflow triggers
   - [ ] `deploy-staging` job runs (not waiting for approval)
   - [ ] Vercel CLI steps complete:
     - `vercel pull --environment=preview`
     - `vercel build`
     - `vercel deploy --prebuilt`
   - [ ] Staging URL logged in output

6. **Extract staging URL**

   ```bash
   # From workflow logs, find line:
   # 🚀 Staging deployed: https://quantumpoly-xyz-staging.vercel.app

   # Copy URL for testing
   export STAGING_URL="<URL from logs>"
   ```

7. **Test staging deployment**

   ```bash
   # Verify staging accessible
   curl -I $STAGING_URL
   # Expected: HTTP/2 200

   # Verify latest code deployed
   curl $STAGING_URL | grep "Staging Test - $(date +%Y-%m-%d)"
   # Should find the test comment added

   # Manual verification (browser)
   open $STAGING_URL  # macOS
   # Verify site loads correctly
   # Check console for errors
   # Test navigation and key features
   ```

8. **Verify staging artifact**
   - Check workflow run artifacts
   - [ ] `vercel-staging-output` present (7-day retention)

**Success Criteria:** Staging auto-deploys after main merge; URL accessible; latest code visible

---

## Production Deployment Testing

### Test 7: Tag-Based Production Deployment with Approval

**Objective:** Verify production deployment flow end-to-end

**Prerequisites:**

- GitHub Environment "production" configured
- You are added as required reviewer

**Steps:**

1. **Prepare for production test**

   ```bash
   # Ensure main is clean and staging tested
   git checkout main
   git pull

   # Check last tag
   git tag -l | tail -5

   # Decide on test tag version
   export TEST_TAG="v0.1.0-cicd-test"
   ```

2. **Create and push tag**

   ```bash
   # Create annotated tag
   git tag -a $TEST_TAG -m "Test: CI/CD production deployment"

   # Push tag
   git push origin $TEST_TAG
   ```

3. **Create GitHub Release**

   ```bash
   # Using GitHub CLI
   gh release create $TEST_TAG \
     --title "$TEST_TAG - CI/CD Test" \
     --notes "Testing production deployment pipeline with manual approval gate."

   # OR via GitHub UI:
   # Repository → Releases → Draft a new release
   # - Tag: v0.1.0-cicd-test
   # - Title: v0.1.0-cicd-test - CI/CD Test
   # - Description: Testing production deployment...
   # - Click "Publish release"
   ```

4. **Monitor validation**
   - Navigate to Actions → "Release - Staging & Production Deployment"
   - Find workflow triggered by tag push
   - Watch `validate-release` job

5. **Verify validation job**
   - [ ] `validate-release` job: ✅ PASSED
   - [ ] Tag format validated (v*.*.\*)
   - [ ] GitHub Release exists

6. **Verify approval request**
   - [ ] `deploy-production` job: ⏸️ WAITING
   - [ ] Job shows "Waiting for approval" status
   - [ ] GitHub sends notification (email/UI)

7. **Review deployment**
   - Click "Review deployments" button in workflow UI
   - Verify checklist items:
     - [ ] Staging tested successfully
     - [ ] All quality gates passed on main
     - [ ] Governance requirements met
     - [ ] DNS configuration verified (if first deploy)
     - [ ] Rollback plan confirmed

8. **Approve deployment**
   - Check "production" environment
   - Click "Approve and deploy"
   - Add comment: "Approved for CI/CD testing - $(date)"

9. **Monitor production deployment**
   - [ ] `deploy-production` job resumes
   - [ ] Vercel production build completes
   - [ ] Production deployment succeeds
   - [ ] Domain alias attempted (may fail if not configured)

10. **Extract production URL**

    ```bash
    # From workflow logs:
    # 🚀 Production deployed: https://quantumpoly-xyz-prod.vercel.app

    export PROD_URL="<URL from logs>"
    ```

11. **Verify production deployment**

    ```bash
    # Check production URL
    curl -I $PROD_URL
    # Expected: HTTP/2 200

    # Check custom domain (if configured)
    curl -I https://www.quantumpoly.ai
    # Expected: HTTP/2 200

    # Verify DNS (if custom domain)
    dig www.quantumpoly.ai CNAME +short
    # Expected: cname.vercel-dns.com

    # SSL verification
    openssl s_client -connect www.quantumpoly.ai:443 -servername www.quantumpoly.ai < /dev/null
    # Should show valid SSL certificate
    ```

12. **Verify ledger update**
    - [ ] `update-ledger` job: ✅ PASSED
    - [ ] Ledger commit pushed to main

    ```bash
    # Pull ledger updates
    git pull

    # Find ledger entry
    ls governance/ledger/*$TEST_TAG*
    # Expected: governance/ledger/2025-10-19-v0.1.0-cicd-test.json

    # Verify ledger contents
    cat governance/ledger/2025-10-19-v0.1.0-cicd-test.json
    # Should contain:
    # - tag, timestamp, commit, deploymentUrl, productionUrl
    # - approver (your GitHub username)
    # - eiiScore, qualityGates

    # If GPG configured, verify signature
    gpg --verify governance/ledger/2025-10-19-v0.1.0-cicd-test.json.asc
    ```

13. **Verify release notification**
    - [ ] `notify-release` job: ✅ PASSED
    - Check GitHub Release page
    - [ ] Comment posted with deployment status
    - [ ] Post-deployment verification checklist included

14. **Verify artifacts**
    - [ ] `vercel-production-output` (90-day retention)
    - [ ] `governance-ledger-v0.1.0-cicd-test` (90-day retention)

**Success Criteria:**

- Approval required before production deploy
- Production deploys successfully after approval
- Ledger updated with deployment metadata
- Production URL accessible

---

### Test 8: Production Approval Rejection

**Objective:** Verify deployment stops if approval rejected

**Steps:**

1. **Create another test tag**

   ```bash
   export TEST_TAG2="v0.1.1-reject-test"
   git tag -a $TEST_TAG2 -m "Test: Approval rejection"
   git push origin $TEST_TAG2

   # Create release
   gh release create $TEST_TAG2 \
     --title "$TEST_TAG2 - Rejection Test" \
     --notes "Testing approval rejection"
   ```

2. **Wait for approval prompt**
   - Navigate to workflow run
   - Wait for `deploy-production` to show "Waiting"

3. **Reject deployment**
   - Click "Review deployments"
   - Click "Reject"
   - Add comment: "Testing rejection flow - CI/CD validation"

4. **Verify expected results**
   - [ ] `deploy-production` job: ❌ FAILED/CANCELLED
   - [ ] `update-ledger` job: ⏭️ SKIPPED
   - [ ] `notify-release` job: ⏭️ SKIPPED
   - [ ] Production unchanged (previous version still live)
   - [ ] No ledger entry created

5. **Cleanup**
   ```bash
   # Delete test tags and releases
   git tag -d $TEST_TAG2
   git push origin :refs/tags/$TEST_TAG2
   gh release delete $TEST_TAG2 --yes
   ```

**Success Criteria:** Rejection prevents deployment; no production changes

---

## Failure Scenario Testing

### Test 9: Invalid Tag Format

**Objective:** Verify invalid tags are rejected

**Steps:**

1. **Push invalid tag**

   ```bash
   # Wrong format (missing 'v' prefix)
   git tag 1.0.0
   git push origin 1.0.0
   ```

2. **Verify expected results**
   - [ ] `validate-release` job: ❌ FAILED
   - [ ] Error message: "Invalid tag format: 1.0.0"
   - [ ] Expected format documented: "v*.*.\*"
   - [ ] No deployment attempted

3. **Cleanup and fix**

   ```bash
   # Delete invalid tag
   git tag -d 1.0.0
   git push origin :refs/tags/1.0.0

   # Create valid tag if desired
   git tag v1.0.0
   git push origin v1.0.0
   ```

**Success Criteria:** Invalid tags rejected with clear error message

---

## Ledger Integrity Verification

### Test 10: Verify Ledger Integrity

**Objective:** Ensure governance ledger is valid and tamper-evident

**Steps:**

1. **Run ledger verification script**

   ```bash
   npm run ethics:verify-ledger
   ```

2. **Verify expected output**

   ```
   ✅ Ledger integrity verified
   ✅ All entries have valid structure
   ✅ Chronological order maintained
   ✅ No gaps in audit trail
   ✅ Checksums match
   ```

3. **Verify GPG signatures (if enabled)**

   ```bash
   # Import public key
   gpg --import governance/keys/cicd-public.key

   # Verify all signatures
   for sig in governance/ledger/*.json.asc; do
     echo "Verifying: $sig"
     gpg --verify "$sig" || echo "FAILED: $sig"
   done
   ```

4. **Test tampering detection**

   ```bash
   # Make temporary edit to ledger entry
   echo "tampered" >> governance/ledger/$(ls -t governance/ledger/*.json | head -1)

   # Verify detection
   gpg --verify governance/ledger/$(ls -t governance/ledger/*.json.asc | head -1)
   # Expected: BAD signature

   # Restore
   git checkout governance/ledger/
   ```

**Success Criteria:** Ledger validation passes; tampering detected

---

## Performance & Timing Validation

### Test 11: Measure CI Performance

**Objective:** Verify CI execution times meet performance targets

**Steps:**

1. **Collect timing data**
   - Review last 5 CI workflow runs
   - Record job durations:
     - Quality: target <10 min
     - Accessibility: target <15 min
     - Performance: target <15 min
     - Governance: target <10 min
     - Build: target <10 min
     - E2E: target <15 min

2. **Analyze caching effectiveness**

   ```bash
   # Compare run with cold cache vs warm cache
   # Cold cache: ~60s npm install
   # Warm cache: ~15s npm install (75% improvement)
   ```

3. **Verify parallel execution**
   - Confirm jobs 1-4 run in parallel (not sequential)
   - Total CI time should be ~max(job times), not sum

4. **Performance targets**
   - [ ] Total CI time: <20 min (parallel execution)
   - [ ] npm install (cached): <20s
   - [ ] Build time: <5 min
   - [ ] Test suite: <3 min

**Success Criteria:** CI completes within performance targets

---

## Security Validation

### Test 12: Verify Secrets Never Logged

**Objective:** Ensure no secrets appear in workflow logs

**Steps:**

1. **Review workflow logs**
   - Open any completed workflow run
   - Search logs for secret patterns:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - `GPG_PRIVATE_KEY`

2. **Verify expected results**
   - [ ] Secrets masked as `***` in logs
   - [ ] No base64-encoded secrets visible
   - [ ] Environment variables not echoed

3. **Test secret masking**

   ```yaml
   # Temporarily add to workflow (for testing only):
   - name: Test secret masking
     run: echo "Token: ${{ secrets.VERCEL_TOKEN }}"

   # Expected log output:
   # Token: ***
   ```

**Success Criteria:** All secrets properly masked; no leakage

### Test 13: Verify Minimal Permissions

**Objective:** Confirm least-privilege permission model

**Steps:**

1. **Review ci.yml permissions**

   ```yaml
   permissions:
     contents: read # ✅ Read-only
     pull-requests: write # ✅ Comment on PRs
   ```

   - [ ] CI has no write access to repository
   - [ ] Cannot push commits
   - [ ] Cannot create tags

2. **Review release.yml permissions**

   ```yaml
   permissions:
     contents: write # ⚠️ Required for ledger commits
     deployments: write # ⚠️ Required for GitHub deployments API
     pull-requests: write # ✅ Optional, for notifications
   ```

   - [ ] Release workflow elevated only when needed
   - [ ] Justification documented

**Success Criteria:** Permissions follow least-privilege principle

---

## Troubleshooting Guide

### Issue: CI Jobs Stuck "Queued"

**Symptoms:** Workflows show "Queued" indefinitely

**Diagnosis:**

```bash
# Check GitHub Actions status
curl https://www.githubstatus.com/api/v2/status.json | jq '.status'
```

**Solutions:**

1. Wait for GitHub Actions service restoration
2. Check repository Actions settings (not disabled)
3. Verify billing/plan limits not exceeded

---

### Issue: Vercel Deployment Fails

**Symptoms:** `vercel deploy` returns error

**Common Causes:**

1. **Invalid token:** `VERCEL_TOKEN` expired
2. **Project not found:** Wrong `VERCEL_PROJECT_ID`
3. **Quota exceeded:** Vercel plan limits
4. **Build error:** Code issue not caught by CI

**Diagnosis:**

```bash
# Test token locally
vercel whoami --token=$VERCEL_TOKEN
# Should show username, not "Error: Invalid token"

# Test project access
vercel ls --token=$VERCEL_TOKEN
# Should list projects including QuantumPoly
```

**Solutions:**

1. Regenerate `VERCEL_TOKEN` in Vercel dashboard
2. Run `vercel link` locally, update project ID secrets
3. Upgrade Vercel plan or wait for quota reset
4. Review Vercel build logs for code errors

---

### Issue: GPG Signature Verification Fails

**Symptoms:** `gpg: BAD signature`

**Diagnosis:**

```bash
# Verify public key imported correctly
gpg --list-keys
# Should show QuantumPoly CI/CD key

# Check signature file integrity
file governance/ledger/*.json.asc
# Should show "PGP signature"
```

**Solutions:**

1. Re-import public key: `gpg --import governance/keys/cicd-public.key`
2. Verify JSON file not modified after signing
3. Check GPG_PRIVATE_KEY secret matches public key

---

## Validation Checklist

Use this checklist for comprehensive CI/CD validation:

### Initial Setup Validation

- [ ] Repository cloned and dependencies installed
- [ ] Local quality gates pass (lint, typecheck, test, build)
- [ ] GitHub Secrets configured (Vercel tokens, GPG keys)
- [ ] GitHub Environment "production" configured with reviewers
- [ ] DNS configured (if custom domain)

### Pull Request Flow

- [ ] Clean code PR passes all 6 quality gates
- [ ] CI summary comment posted on PR
- [ ] Artifacts uploaded with correct retention periods
- [ ] Lint errors block merge
- [ ] Type errors block merge
- [ ] Test failures block merge

### Deployment Flow

- [ ] Main merge triggers staging deployment
- [ ] Staging URL accessible and shows latest code
- [ ] Production deployment requires tag + release + approval
- [ ] Invalid tag format rejected with clear error
- [ ] Approval rejection prevents deployment
- [ ] Production deployment succeeds after approval
- [ ] Custom domain accessible (if configured)

### Governance & Audit

- [ ] Ledger updated with deployment metadata
- [ ] Ledger integrity verification passes
- [ ] GPG signatures valid (if enabled)
- [ ] Artifacts retained per compliance policy

### Performance & Security

- [ ] CI completes within performance targets (<20 min)
- [ ] Caching reduces install time (60s → 15s)
- [ ] Secrets properly masked in logs
- [ ] Permissions follow least-privilege principle

---

## Related Documentation

- [CI/CD Prompt Compliance Matrix](./CICD_PROMPT_COMPLIANCE_MATRIX.md) - Requirements mapping
- [CI/CD Validation Scenarios](./CICD_VALIDATION_SCENARIOS.md) - Scenario descriptions
- [CICD Review Checklist](../.github/CICD_REVIEW_CHECKLIST.md) - Pre-deployment verification
- [GPG Ledger Integration](./CICD_GPG_LEDGER_INTEGRATION.md) - Signature setup and verification
- [DNS Configuration](./DNS_CONFIGURATION.md) - Production domain setup

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintained By:** CASP Lead Architect
