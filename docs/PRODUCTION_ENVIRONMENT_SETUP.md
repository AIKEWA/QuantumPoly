# Production Environment Setup Guide

## Overview

This guide provides step-by-step instructions for configuring the GitHub "production" environment with required reviewers and deployment branch policies. This setup enforces human-in-the-loop approval for all production deployments, ensuring governance compliance.

## Prerequisites

- Repository admin access
- At least 2 team members who will serve as production reviewers
- Understanding of the deployment workflow (see `../README.md` CI/CD section)

---

## Setup Instructions

### 1. Navigate to Environment Settings

1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Environments**
4. If "production" environment doesn't exist, click **New environment**
5. Enter name: `production`
6. Click **Configure environment**

### 2. Configure Protection Rules

#### Required Reviewers

1. Under **Environment protection rules**, check ✅ **Required reviewers**
2. Click the search box under "Required reviewers"
3. Add at least **2 team members** who will approve production deployments
4. Recommended reviewers:
   - Engineering Lead
   - DevOps Lead
   - Product Owner
   - Security Lead (optional)

**Note:** Only the specified reviewers can approve production deployments. Choose team members who:

- Understand the deployment process
- Are available during deployment windows
- Have authority to approve production changes

#### Wait Timer

1. Under **Wait timer**, enter: `0` minutes
2. This means reviewers are prompted immediately without delay
3. Click **Save protection rules**

### 3. Configure Deployment Branches

1. Under **Deployment branches**, select **Selected branches**
2. Click **Add deployment branch rule**
3. Add pattern: `main`
4. Click **Add deployment branch rule** again
5. Add pattern: `refs/tags/v*`
6. This restricts production deployments to:
   - Direct pushes to `main` branch (staging)
   - Tagged releases matching `v*.*.*` pattern (production)

### 4. Set Environment URL

1. Under **Environment URL**, enter: `https://www.quantumpoly.ai`
2. This URL will be displayed in deployment summaries
3. Click **Save protection rules**

### 5. Final Configuration

Your configuration should look like:

```
Environment: production
├─ Environment URL: https://www.quantumpoly.ai
├─ Protection Rules:
│  ├─ Required reviewers: 2+ team members
│  └─ Wait timer: 0 minutes
└─ Deployment branches:
   ├─ main
   └─ refs/tags/v*
```

---

## Verification

### Using GitHub CLI

Run the following command to verify configuration:

```bash
gh api repos/:owner/:repo/environments/production | jq '{
  reviewers: .protection_rules[].reviewers | length,
  wait_timer: .protection_rules[].wait_timer,
  deployment_branch_policy: .deployment_branch_policy
}'
```

**Expected output:**

```json
{
  "reviewers": 2,
  "wait_timer": 0,
  "deployment_branch_policy": {
    "protected_branches": false,
    "custom_branch_policies": true
  }
}
```

### Manual Verification

1. Navigate to: Repository → Settings → Environments → production
2. Confirm:
   - ✅ At least 2 reviewers listed
   - ✅ Wait timer: 0 minutes
   - ✅ Deployment branches: `main` and `refs/tags/v*`
   - ✅ Environment URL: `https://www.quantumpoly.ai`

---

## Testing the Approval Flow

To test that the approval gate works correctly:

1. Create a test tag:

   ```bash
   git tag v0.0.1-test
   git push origin v0.0.1-test
   ```

2. Create a GitHub Release for the tag (in GitHub UI)

3. Monitor the workflow:

   ```bash
   gh run list --workflow=release.yml
   ```

4. The `deploy-production` job should pause and wait for approval

5. Designated reviewers will receive a notification

6. Reviewer approves in GitHub Actions → Deployment proceeds

7. Clean up test tag:
   ```bash
   git tag -d v0.0.1-test
   git push origin :refs/tags/v0.0.1-test
   gh release delete v0.0.1-test --yes
   ```

---

## Troubleshooting

### No Approval Prompt Appears

**Problem:** Production deployment starts immediately without approval.

**Solutions:**

1. Verify environment name is exactly `production` (case-sensitive)
2. Confirm `.github/workflows/release.yml` specifies: `environment: production`
3. Check that required reviewers are configured (≥1)
4. Ensure you're deploying via tag + release (not direct push to main)

### Reviewers Not Receiving Notifications

**Problem:** Reviewers don't get notified when approval is needed.

**Solutions:**

1. Check GitHub notification settings (Settings → Notifications)
2. Ensure reviewers have "Watch" enabled for the repository
3. Verify reviewers have correct email addresses in GitHub profile
4. Check spam/junk folders for GitHub emails

### Deployment Branch Policy Not Working

**Problem:** Deployments work from unauthorized branches.

**Solutions:**

1. Verify deployment branch patterns: `main` and `refs/tags/v*`
2. Ensure "Selected branches" is chosen (not "All branches")
3. Check for typos in branch patterns (e.g., `refs/tags/v*` not `refs/tag/v*`)

### Changing Reviewers

To update the reviewer list:

1. Navigate to: Repository → Settings → Environments → production
2. Under "Required reviewers", click the (X) next to any reviewer to remove
3. Click the search box to add new reviewers
4. Click **Save protection rules**

**Note:** Changes take effect immediately for new deployments.

---

## Security Considerations

### Reviewer Selection

Choose reviewers who:

- ✅ Have production access authority
- ✅ Understand the application architecture
- ✅ Can verify quality gates passed (coverage, accessibility, performance)
- ✅ Are available during deployment windows
- ❌ Are not the same person who authored the changes (separation of duties)

### Reviewer Responsibilities

Before approving a production deployment, reviewers should verify:

- [ ] All CI quality gates passed (lint, typecheck, test, build, SBOM)
- [ ] Staging deployment tested and validated
- [ ] Coverage thresholds met (≥85%)
- [ ] SBOM generated and artifact present
- [ ] No critical linter warnings
- [ ] Changelog/release notes reviewed
- [ ] Rollback plan documented (if high-risk change)

### Approval Audit Trail

Every production deployment records:

- Approver name and GitHub username
- Approval timestamp
- Deployment tag and commit SHA
- Governance ledger entry (see `governance/ledger/`)

To view approval history:

```bash
gh run list --workflow=release.yml --json conclusion,createdAt,headSha
```

---

## Compliance Mapping

| Requirement              | Implementation                | Verification                  |
| ------------------------ | ----------------------------- | ----------------------------- |
| **SOC 2 CC6.1**          | Human approval for production | GitHub Environment reviewers  |
| **ISO 27001 A.9.2.3**    | Privileged access management  | ≥2 reviewers configured       |
| **EWA-HIL-02**           | Human-in-the-loop gate        | Manual approval required      |
| **Separation of Duties** | Reviewer ≠ Committer          | GitHub enforces automatically |

---

## Related Documentation

- **[CI/CD Pipeline Overview](../README.md#cicd-pipeline---governance-first-deployment)** - Complete CI/CD architecture
- **[Release Workflow](../.github/workflows/release.yml)** - Production deployment workflow
- **[Deployment Process](../README.md#deployment-process)** - Step-by-step deployment guide
- **[Governance Ledger](../governance/ledger/)** - Deployment audit trail

---

## Support

For issues with environment configuration:

- Check GitHub documentation: https://docs.github.com/en/actions/deployment/targeting-different-environments
- Open an issue in the repository with label `deployment`
- Contact DevOps team

---

**Last Updated:** 2025-10-23  
**Version:** 1.0  
**Owner:** DevOps Team
