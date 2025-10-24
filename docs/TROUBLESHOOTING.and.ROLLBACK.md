<!-- FILE: TROUBLESHOOTING.and.ROLLBACK.md -->

# CI/CD Troubleshooting & Rollback Procedures

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Audience:** DevOps Engineers, SREs, On-Call Engineers  
**Classification:** Operational Runbook

---

## Purpose

This runbook provides diagnostic procedures, remediation steps, and rollback options for common CI/CD pipeline failures. Use this document during incident response and routine troubleshooting.

---

## Table of Contents

1. [Common Failures](#common-failures)
2. [Diagnostic Procedures](#diagnostic-procedures)
3. [Rollback Options](#rollback-options)
4. [Post-Fix Verification](#post-fix-verification)
5. [Incident Templates](#incident-templates)

---

## Common Failures

### Failure 1: Secrets Missing or Invalid

**Symptoms:**

- Workflow fails with error: `Error: Invalid token`
- Deployment step shows: `Error: Missing required secret: VERCEL_TOKEN`
- Vercel CLI returns: `Error: No token specified`

**Diagnosis:**

| Check                      | Command                                   | Expected Result                            |
| -------------------------- | ----------------------------------------- | ------------------------------------------ |
| Verify secret exists       | Repository → Settings → Secrets → Actions | Secret name appears in list                |
| Check secret name spelling | Review `.github/workflows/*.yml`          | Exact match: `${{ secrets.VERCEL_TOKEN }}` |
| Validate token format      | N/A (secret masked)                       | Token should start with `vercel_`          |
| Test token locally         | `vercel whoami --token=[TOKEN]`           | Shows organization/user name               |

**Fix:**

```bash
# Step 1: Verify Vercel token validity
vercel whoami --token=[YOUR_TOKEN]
# If error: Token expired or invalid

# Step 2: Generate new token
# Navigate to: https://vercel.com/account/tokens
# Create new token with scope: "Deploy & Read"

# Step 3: Update GitHub Secret
# Repository → Settings → Secrets and variables → Actions
# Edit VERCEL_TOKEN → Paste new token → Update secret

# Step 4: Trigger workflow retry
gh workflow run release.yml --ref main
# Or: Re-push tag or create new release
```

**Prevention:**

- Set calendar reminder 7 days before token expiration
- Implement automated secret rotation (see `SECRETS.inventory.md`)
- Use Vercel CLI in local testing to catch issues early

---

### Failure 2: Coverage Threshold Not Met

**Symptoms:**

- CI workflow fails at "Test & Coverage" job
- Error: `Jest: Coverage for statements (XX%) does not meet global threshold (82%)`
- Coverage report shows specific files below threshold

**Diagnosis:**

| Check                        | Command                          | Expected Result                                  |
| ---------------------------- | -------------------------------- | ------------------------------------------------ |
| View coverage report locally | `npm run test:coverage`          | HTML report at `coverage/lcov-report/index.html` |
| Identify uncovered files     | Open report → Sort by coverage % | Files with red/orange highlights                 |
| Check threshold config       | Review `jest.config.js`          | Global: 80-85%, API: 90%                         |

**Fix:**

```bash
# Step 1: Generate coverage report
npm run test:coverage

# Step 2: Open HTML report
open coverage/lcov-report/index.html
# Identify files with low coverage

# Step 3: Add missing tests
# Example: If src/components/Hero.tsx is at 65%
touch __tests__/Hero.test.tsx
# Write tests to cover untested branches/lines

# Step 4: Verify coverage improvement
npm run test:coverage
# Check that all thresholds now pass

# Step 5: Commit and push
git add __tests/Hero.test.tsx
git commit -m "test: improve Hero component coverage to meet threshold"
git push
```

**Temporary Threshold Adjustment (Emergency Only):**

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 75,  // Temporarily reduced from 80
    // ...
  },
}
```

**Warning:** Document threshold reduction in PR description and create follow-up issue to restore threshold.

**Prevention:**

- Run `npm run test:coverage` locally before pushing
- Configure Git pre-commit hook to check coverage
- Set up coverage trending dashboard (e.g., Codecov)

---

### Failure 3: Accessibility Violations Detected

**Symptoms:**

- CI workflow fails at "Accessibility Tests" job
- Error: `Expected page to have no accessibility violations`
- Playwright report shows axe-core violations

**Diagnosis:**

| Check                  | Command                                                              | Expected Result                      |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| Run a11y tests locally | `npm run test:e2e:a11y`                                              | Test failures with violation details |
| View Playwright report | `npx playwright show-report`                                         | HTML report with screenshots         |
| Download CI artifact   | GitHub Actions → Workflow run → Artifacts → `playwright-a11y-report` | Download and open `index.html`       |

**Fix:**

```bash
# Step 1: Run accessibility tests locally
npm run test:e2e:a11y

# Step 2: View detailed violation report
npx playwright show-report
# Review violations: impact level, WCAG criteria, affected elements

# Step 3: Fix violations
# Example: Missing alt text on image
# src/components/Hero.tsx
# <img src="/logo.svg" /> ❌
# <img src="/logo.svg" alt="QuantumPoly Logo" /> ✅

# Step 4: Re-run tests to verify fix
npm run test:e11y

# Step 5: Commit fix
git add src/components/Hero.tsx
git commit -m "fix(a11y): add alt text to Hero logo (WCAG 1.1.1)"
git push
```

**Common Violations & Fixes:**

| Violation        | WCAG Criterion               | Fix                                                |
| ---------------- | ---------------------------- | -------------------------------------------------- |
| `image-alt`      | 1.1.1 Non-text Content       | Add descriptive `alt` attribute to images          |
| `color-contrast` | 1.4.3 Contrast (Minimum)     | Increase contrast ratio to ≥4.5:1 for text         |
| `button-name`    | 4.1.2 Name, Role, Value      | Add `aria-label` or visible text to buttons        |
| `link-name`      | 2.4.4 Link Purpose           | Ensure links have descriptive text or `aria-label` |
| `label`          | 3.3.2 Labels or Instructions | Associate `<label>` with form inputs via `htmlFor` |

**Prevention:**

- Use `eslint-plugin-jsx-a11y` (already configured)
- Run `npm run lint` before committing
- Test with screen reader (VoiceOver, NVDA) during development

---

### Failure 4: Vercel Deployment Error

**Symptoms:**

- Release workflow fails at "Deploy to production" step
- Error: `Error: Failed to create deployment`
- Vercel dashboard shows deployment in "Error" state

**Diagnosis:**

| Check                  | Command / Location                                          | Expected Result                          |
| ---------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| Vercel build logs      | Vercel dashboard → Deployments → [Failed deployment] → Logs | Error message in build output            |
| Check build locally    | `npm run build`                                             | Successful build with `.next/` directory |
| Verify Vercel config   | Review `vercel.json`                                        | Valid JSON, correct `buildCommand`       |
| Check project settings | Vercel dashboard → Project Settings                         | Correct framework, Node version          |

**Fix:**

```bash
# Step 1: Reproduce build locally
npm ci --legacy-peer-deps
npm run build

# If build fails locally:
# Fix build errors, commit, and push

# If build succeeds locally but fails on Vercel:

# Step 2: Check Node version parity
# vercel.json or package.json
{
  "engines": {
    "node": "20.x"  // Must match Vercel runtime
  }
}

# Step 3: Check environment variables
# Vercel dashboard → Project → Settings → Environment Variables
# Ensure production environment has required variables

# Step 4: Redeploy manually (if workflow stuck)
vercel --prod --token=$VERCEL_TOKEN
# Or: Create new release/tag to trigger workflow again

# Step 5: Check Vercel status page
# https://www.vercel-status.com/
# Verify no ongoing Vercel platform incidents
```

**Common Vercel Errors:**

| Error                                          | Cause                                  | Fix                                                                 |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| `Error: No Output Directory`                   | Build didn't create `.next/` or `out/` | Fix `next build` command, check `next.config.js`                    |
| `Error: Command "npm run build" exited with 1` | Build script failed                    | Check build logs, fix TypeScript/ESLint errors                      |
| `Error: Missing environment variable`          | Required env var not set in Vercel     | Add variable in Vercel dashboard → Settings → Environment Variables |
| `Error: Project not found`                     | `VERCEL_PROJECT_ID` incorrect          | Verify secret matches `vercel link` output                          |

**Prevention:**

- Run `vercel build` locally before tagging release
- Monitor Vercel status page during deployments
- Set up Vercel integration notifications (Slack, email)

---

### Failure 5: Ledger Update Failure

**Symptoms:**

- Release workflow fails at "Update Governance Ledger" job
- Error: `Error: Ledger verification failed`
- Ledger commit not appearing in repository

**Diagnosis:**

| Check                      | Command                                          | Expected Result          |
| -------------------------- | ------------------------------------------------ | ------------------------ |
| Verify ledger file exists  | `ls governance/ledger/ledger.jsonl`              | File exists              |
| Check ledger JSON validity | `cat governance/ledger/ledger.jsonl \| jq empty` | No JSON parse errors     |
| Run verification locally   | `npm run ethics:verify-ledger`                   | All checks pass          |
| Check Git config           | Workflow logs → "Configure Git" step             | Name/email set correctly |

**Fix:**

```bash
# Step 1: Verify ledger integrity locally
npm run ethics:verify-ledger

# If verification fails:
# Error: "Invalid JSON on line X"
# Manually fix JSON syntax in governance/ledger/ledger.jsonl

# Step 2: Run ledger update manually
npm run ethics:ledger-update

# Step 3: Verify entry was added
tail -n 1 governance/ledger/ledger.jsonl | jq

# Step 4: Commit ledger update
git add governance/ledger/
git commit -m "chore: manual ledger update for v1.0.0 [skip ci]"
git push origin main

# Step 5: Create ledger tag manually
git tag v1.0.0-ledger -m "Governance ledger entry for v1.0.0"
git push origin v1.0.0-ledger
```

**GPG Signature Issues:**

If GPG signing fails (optional feature):

```bash
# Check if GPG secrets are set
# Repository → Settings → Secrets → GPG_PRIVATE_KEY, GPG_KEY_ID

# Test GPG signing locally
echo "test" | gpg --clearsign --local-user [KEY_ID]

# If GPG not critical, deployment can proceed without signature
# Ledger will have null signature field (still valid)
```

**Prevention:**

- Run `npm run ethics:verify-ledger` in CI before ledger update
- Add JSON schema validation for ledger entries
- Set up alerts for ledger commit failures

---

### Failure 6: Manual Approval Timeout

**Symptoms:**

- Production deployment workflow waiting indefinitely
- No approver available to approve deployment
- Time-sensitive deployment blocked

**Diagnosis:**

| Check                       | Action                                              | Expected Result                    |
| --------------------------- | --------------------------------------------------- | ---------------------------------- |
| Verify reviewers configured | Repository → Settings → Environments → `production` | At least 2 reviewers listed        |
| Check reviewer availability | Contact reviewers via Slack/email                   | At least 1 available               |
| Review deployment urgency   | Assess incident priority (P0/P1/P2)                 | Determine if break-glass warranted |

**Fix:**

**Option 1: Standard Approval (Preferred)**

```bash
# Contact designated reviewers:
# - DevOps Lead
# - Product Owner
# - Compliance Officer

# Reviewer actions:
# 1. GitHub → Actions → release workflow run
# 2. Click "Review deployments"
# 3. Select "production" environment
# 4. Click "Approve and deploy"
```

**Option 2: Add Temporary Reviewer (Emergency)**

```bash
# Repository administrator actions:
# 1. Repository → Settings → Environments → production
# 2. Required reviewers → Add available team member
# 3. Save protection rules
# 4. New reviewer approves deployment
# 5. Remove temporary reviewer after deployment

# Document emergency reviewer addition in incident report
```

**Option 3: Break-Glass Approval (P0 Incidents Only)**

```bash
# Prerequisites:
# - Production outage (P0) or critical security patch
# - No designated reviewers available within SLA
# - CTO or Engineering Director approval obtained

# Steps:
# 1. Obtain verbal/Slack approval from CTO
# 2. Repository admin temporarily removes protection rules
# 3. Manually trigger deployment via workflow_dispatch
# 4. Restore protection rules immediately after
# 5. Document in incident report + governance ledger

# Post-incident:
# - Conduct retrospective within 24 hours
# - Update reviewer roster for better coverage
```

**Prevention:**

- Maintain at least 3 designated reviewers in different time zones
- Set up reviewer rotation schedule
- Configure backup reviewers in GitHub Environment settings
- Document escalation path in runbook

---

## Diagnostic Procedures

### Procedure 1: Workflow Log Analysis

```bash
# View workflow run logs via GitHub CLI
gh run list --workflow=ci.yml --limit=5
gh run view [RUN_ID] --log

# Search for specific errors
gh run view [RUN_ID] --log | grep -i "error"

# Download full logs for offline analysis
gh run view [RUN_ID] --log > workflow-logs.txt
```

---

### Procedure 2: Artifact Inspection

```bash
# List artifacts for a workflow run
gh run view [RUN_ID]

# Download specific artifact
gh run download [RUN_ID] -n coverage-report-node-20.x

# Extract and review
unzip coverage-report-node-20.x.zip
open coverage/lcov-report/index.html
```

---

### Procedure 3: Local Reproduction

```bash
# Simulate CI environment locally

# Step 1: Clean install dependencies
rm -rf node_modules package-lock.json
npm ci --legacy-peer-deps

# Step 2: Run quality gates in order
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e:a11y

# Step 3: Build production bundle
npm run build

# Step 4: Verify bundle budget
npm run budget

# Step 5: Run governance validation
npm run ci:validate
```

---

## Rollback Options

### Option 1: Redeploy Previous Release (Recommended)

**Use Case:** Current production deployment has critical bug, previous version was stable

**Procedure:**

```bash
# Step 1: Identify previous stable release
gh release list --limit=10
# Example: Previous stable version is v1.0.0 (current broken version is v1.0.1)

# Step 2: Create rollback tag
git checkout v1.0.0
git tag v1.0.1-rollback -m "Rollback to v1.0.0 due to [INCIDENT_ID]"
git push origin v1.0.1-rollback

# Step 3: Create GitHub Release for rollback tag
gh release create v1.0.1-rollback \
  --title "v1.0.1-rollback (Rollback to v1.0.0)" \
  --notes "**Rollback Release**\n\nRolling back to v1.0.0 due to critical issue in v1.0.1.\n\n**Issue:** [Description]\n**Incident:** [INCIDENT_ID]\n**Approver:** [NAME]"

# Step 4: Wait for manual approval
# Reviewer approves rollback deployment in GitHub Actions

# Step 5: Verify rollback successful
curl -I https://www.quantumpoly.ai
# Check X-Vercel-Id header or content version

# Step 6: Document rollback in ledger
# Automatic via update-ledger job

# Step 7: Create hotfix branch for forward fix
git checkout -b hotfix/v1.0.2 v1.0.0
# Fix issue, test, then create v1.0.2 release
```

**Time to Complete:** ~10-15 minutes (includes manual approval)

**Advantages:**

- Full CI/CD pipeline validation
- Governance ledger automatically updated
- Same approval process as forward deployment

**Disadvantages:**

- Requires manual approval (may delay rollback)
- Creates additional release tag

---

### Option 2: Promote Previous Vercel Deployment

**Use Case:** Emergency rollback needed immediately, bypass CI/CD pipeline

**Procedure:**

```bash
# Step 1: List recent Vercel deployments
vercel ls quantumpoly --token=$VERCEL_TOKEN

# Step 2: Identify previous production deployment
# Look for deployment with "PRODUCTION" status before current

# Step 3: Promote previous deployment to production
vercel promote [DEPLOYMENT_URL] --token=$VERCEL_TOKEN

# Example:
vercel promote https://quantumpoly-abc123.vercel.app --token=$VERCEL_TOKEN

# Step 4: Verify promotion
curl -I https://www.quantumpoly.ai

# Step 5: Alias to custom domain (if needed)
vercel alias set [DEPLOYMENT_URL] www.quantumpoly.ai --token=$VERCEL_TOKEN

# Step 6: Document manual rollback
# Create GitHub Issue:
gh issue create \
  --title "[INCIDENT] Manual rollback performed on $(date -u +%Y-%m-%d)" \
  --body "**Deployment URL promoted:** [URL]\n**Reason:** [DESCRIPTION]\n**Approver:** [NAME]\n\n**Post-incident actions:**\n- [ ] Conduct retrospective\n- [ ] Update governance ledger manually\n- [ ] Create forward fix"

# Step 7: Manual ledger entry (post-incident)
# Run ledger update with incident tag
DEPLOYMENT_TAG="v1.0.1-manual-rollback-$(date +%Y%m%d)" \
DEPLOYMENT_URL="[PROMOTED_URL]" \
npm run ethics:ledger-update
```

**Time to Complete:** ~2-5 minutes

**Advantages:**

- Immediate rollback (no approval delay)
- No additional Git tags
- Uses existing stable deployment

**Disadvantages:**

- Bypasses CI/CD pipeline validation
- Manual governance ledger update required
- Requires Vercel token with promote permissions

**When to Use:** P0 incidents only (production outage, critical security vulnerability)

---

### Option 3: Git Revert + Emergency Deploy

**Use Case:** Bad commit merged to main, need to undo changes and redeploy

**Procedure:**

```bash
# Step 1: Identify problematic commit
git log --oneline -n 10
# Example: abc1234 is the bad commit

# Step 2: Create revert commit
git checkout main
git pull
git revert abc1234
# Or for multiple commits:
git revert abc1234..def5678

# Step 3: Push revert to main
git push origin main

# Step 4: Staging deployment triggers automatically
# Validate staging deployment

# Step 5: Create emergency release tag
git tag v1.0.2-hotfix -m "Emergency revert of [ISSUE_DESCRIPTION]"
git push origin v1.0.2-hotfix

# Step 6: Create GitHub Release
gh release create v1.0.2-hotfix \
  --title "v1.0.2-hotfix (Emergency Revert)" \
  --notes "**Emergency Hotfix**\n\nReverts changes from commit abc1234.\n\n**Issue:** [DESCRIPTION]\n**Reverted Commit:** abc1234\n**Incident:** [INCIDENT_ID]"

# Step 7: Approve deployment (expedited)
# Designated reviewer approves in GitHub Actions

# Step 8: Verify deployment
curl -I https://www.quantumpoly.ai
```

**Time to Complete:** ~15-20 minutes (includes CI validation)

**Advantages:**

- Permanent fix (revert commit in history)
- Full CI/CD validation
- Clean Git history

**Disadvantages:**

- Slower than Vercel promotion
- Requires manual approval
- May conflict with other pending changes

**When to Use:** Non-urgent incidents where proper validation is important

---

### Option 4: Disable Workflow (Stop Deployments)

**Use Case:** Prevent further deployments while investigating incident

**Procedure:**

```bash
# Via GitHub UI:
# 1. Repository → Actions → Workflows
# 2. Select "Release - Staging & Production Deployment"
# 3. Click "..." menu → Disable workflow

# Via GitHub CLI:
gh workflow disable release.yml

# Re-enable after incident resolved:
gh workflow enable release.yml

# Document workflow disable/enable
gh issue comment [INCIDENT_ISSUE] \
  --body "Deployment workflow disabled at $(date -u) by [NAME]. Will re-enable after investigation."
```

**Time to Complete:** ~1 minute

**Advantages:**

- Immediate stop of all deployments
- Prevents compounding issues
- Simple to execute

**Disadvantages:**

- Blocks all deployments (staging + production)
- Must remember to re-enable
- Doesn't fix current production state

**When to Use:**

- Active incident with unknown root cause
- Multiple failed deployments in succession
- Suspected malicious activity

---

## Post-Fix Verification

### Verification Checklist

After any rollback or fix deployment:

**1. DNS & Connectivity**

- [ ] `dig www.quantumpoly.ai` resolves to Vercel CNAME
- [ ] `curl -I https://www.quantumpoly.ai` returns 200 OK
- [ ] SSL certificate valid (not expired, correct domain)

**2. Application Health**

- [ ] Homepage loads without errors
- [ ] Critical user paths functional (navigation, forms)
- [ ] No console errors in browser dev tools

**3. Deployment Metadata**

- [ ] Correct version deployed (check footer, `/_next/static/version.txt`, etc.)
- [ ] Vercel deployment shows "READY" status
- [ ] Custom domain aliased correctly

**4. Governance**

- [ ] Governance ledger entry exists for deployment
- [ ] Ledger entry has correct tag, timestamp, approver
- [ ] EII score recorded (if applicable)

**5. Monitoring**

- [ ] No active alerts in monitoring dashboard
- [ ] Error rate returned to baseline
- [ ] Performance metrics acceptable (Lighthouse, Web Vitals)

**6. Communication**

- [ ] Incident status updated (GitHub Issue or incident tracker)
- [ ] Stakeholders notified (team Slack, status page)
- [ ] Post-incident review scheduled (within 24 hours)

---

### Verification Commands

```bash
# DNS verification
dig www.quantumpoly.ai CNAME +short
# Expected: cname.vercel-dns.com

# SSL verification
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -dates

# HTTP headers
curl -I https://www.quantumpoly.ai

# Application health
curl -s https://www.quantumpoly.ai | grep -i "quantumpoly"

# Vercel deployment status
vercel ls quantumpoly --token=$VERCEL_TOKEN | head

# Ledger verification
npm run ethics:verify-ledger
tail -n 1 governance/ledger/ledger.jsonl | jq
```

---

## Incident Templates

### Template 1: Post-Incident Report

```markdown
# Post-Incident Report: [INCIDENT_ID]

**Date:** YYYY-MM-DD  
**Severity:** P0 / P1 / P2  
**Duration:** [START_TIME] - [END_TIME] (HH:MM)  
**Status:** Resolved

## Summary

[Brief description of incident]

## Impact

- **Users Affected:** [Number or percentage]
- **Services Affected:** [Production / Staging / Preview]
- **Revenue Impact:** [If applicable]

## Timeline

- **HH:MM** - Incident detected ([How detected])
- **HH:MM** - Investigation started
- **HH:MM** - Root cause identified
- **HH:MM** - Fix deployed
- **HH:MM** - Incident resolved

## Root Cause

[Detailed explanation of what caused the incident]

## Resolution

[What was done to resolve the incident]

**Rollback Method Used:** [Option 1/2/3/4 from runbook]

## Lessons Learned

- **What Went Well:**
  - [Item 1]
  - [Item 2]

- **What Needs Improvement:**
  - [Item 1]
  - [Item 2]

## Action Items

- [ ] [Action item 1] - Assigned to: [NAME] - Due: [DATE]
- [ ] [Action item 2] - Assigned to: [NAME] - Due: [DATE]

## Related Documentation

- Incident Issue: #XXX
- Deployment: [Vercel URL or GitHub release]
- Ledger Entry: [Link to ledger entry]
```

---

### Template 2: Emergency Deployment Justification

```markdown
# Emergency Deployment Justification

**Deployment Tag:** v1.0.X  
**Requested By:** [NAME]  
**Requested Date:** YYYY-MM-DD HH:MM UTC  
**Incident:** [INCIDENT_ID or P0/P1/P2]

## Justification

[Why emergency deployment is necessary]

## Standard Process Bypasses

- [ ] CI quality gates (specify which): [GATES]
- [ ] Staging validation
- [ ] Standard approval time (expedited)

## Approval

**Approver:** [NAME]  
**Approval Method:** [GitHub UI / Verbal / Slack]  
**Approval Time:** YYYY-MM-DD HH:MM UTC

## Post-Deployment

- [ ] Conduct retrospective within 24 hours
- [ ] Update governance ledger with justification
- [ ] Review bypass appropriateness

## Notes

[Additional context]
```

---

## Related Documentation

| Document                           | Relevance                                         |
| ---------------------------------- | ------------------------------------------------- |
| `README.CI-CD.md`                  | Pipeline architecture and normal operation        |
| `SECRETS.inventory.md`             | Secret rotation and break-glass procedures        |
| `GOVERNANCE.rationale.md`          | Change categories and approval requirements       |
| `DNS.and.Environments.md`          | DNS troubleshooting and environment configuration |
| `.github/CICD_REVIEW_CHECKLIST.md` | Pre-deployment validation checklist               |

---

## Support & Escalation

**First Response:** On-call DevOps Engineer  
**Escalation Path:** DevOps Lead → Engineering Manager → CTO

**Emergency Contact:** [Internal communication channel]  
**Incident Tracking:** GitHub Issues with label `incident`

**External Status Page:** [To be configured]

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-10-21  
**Next Review:** 2026-01-21 (Quarterly)  
**Maintained By:** DevOps Team & SRE
