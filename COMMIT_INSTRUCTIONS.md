# Block C Commit Instructions

## Summary

All Block C files have been staged and are ready for a GPG-signed governance commit. The commit message has been prepared according to CASP governance principles.

## Staged Files (14 total)

### Modified Workflows (6)

- `.github/workflows/autonomous-monitoring.yml`
- `.github/workflows/daily-governance-report.yml`
- `.github/workflows/ewa-postlaunch.yml`
- `.github/workflows/governance.yml`
- `.github/workflows/integrity-verification.yml`
- `.github/workflows/stage-vi-integrity.yml` ← YAML corrections applied

### New Documentation (4)

- `BLOCK10.10_COMPLETION_REPORT.md` (500+ lines)
- `BLOCK10.10_IMPLEMENTATION_SUMMARY.md` (3,000+ words)
- `BLOCK10.10_VALIDATION_SUMMARY.md` (comprehensive GPG guide)
- `BLOCK10.10_YAML_VALIDATION_REPORT.md` (audit results)

### New Infrastructure (4)

- `docs/governance/BLOCK10.10_AUTONOMOUS_OPS.md` (6,500+ words)
- `governance/feedback/aggregates/trust-trend.json` (trust baseline)
- `scripts/verify-block-c-bootstrap.mjs` (19 automated checks)
- `package.json` (verify:block-c script added)

## YAML Corrections Applied

**File:** `.github/workflows/stage-vi-integrity.yml`

**Changes:**

- Line 151: Removed trailing `---` marker from JavaScript template literal
- Line 207: Removed trailing `---` marker from GitHub issue body

**Impact:** Eliminates potential YAML parser conflicts in future GitHub Runner updates while maintaining backward compatibility.

## Commit Instructions

### Option 1: GPG-Signed Commit (Recommended)

```bash
# Verify your GPG key is configured
gpg --list-secret-keys --keyid-format=long

# Make GPG-signed commit with prepared message
git commit -S -F .git/COMMIT_MSG_BLOCK_C.txt

# Verify the signature
git log --show-signature -1
```

### Option 2: Standard Commit (If GPG Not Configured)

```bash
# Standard commit with prepared message
git commit -F .git/COMMIT_MSG_BLOCK_C.txt

# Note: GPG signing recommended for governance commits
```

### Option 3: Custom Commit Message

If you prefer to customize the message:

```bash
# Use the prepared message as a template
git commit -S

# Your editor will open with the prepared message
# Edit as needed, save and close
```

## Verification Before Push

```bash
# Verify the commit was created
git log -1 --stat

# Check commit signature (if GPG-signed)
git log --show-signature -1

# Review all changes
git show HEAD

# Verify Block C readiness
npm run verify:block-c
```

## Expected Output

After commit, you should see:

```
[main abc1234] 🧩 Governance Technical Fix — Block C YAML Validation
 14 files changed, 2500+ insertions(+), 50 deletions(-)
 create mode 100644 BLOCK10.10_COMPLETION_REPORT.md
 create mode 100644 BLOCK10.10_IMPLEMENTATION_SUMMARY.md
 create mode 100644 BLOCK10.10_VALIDATION_SUMMARY.md
 create mode 100644 BLOCK10.10_YAML_VALIDATION_REPORT.md
 create mode 100644 docs/governance/BLOCK10.10_AUTONOMOUS_OPS.md
 create mode 100644 governance/feedback/aggregates/trust-trend.json
 create mode 100644 scripts/verify-block-c-bootstrap.mjs
```

## Push Instructions

```bash
# Push to main branch
git push origin main

# Or create a governance branch (recommended for review)
git checkout -b block-c-yaml-validation
git push origin block-c-yaml-validation

# Then create PR for review before merging to main
```

## Post-Commit Actions

### 1. Verify Workflows on GitHub

```bash
# List all workflows
gh workflow list

# Expected: 19 workflows should be listed including Block C workflows
```

### 2. Day 0 Bootstrap Test

```bash
# Manual trigger first workflow
gh workflow run daily-governance-report.yml

# Wait 2-3 minutes
sleep 180

# Check execution status
gh run list --workflow=daily-governance-report.yml --limit 1

# View logs
gh run view --log
```

### 3. Download and Inspect Artifacts

```bash
# Get the run ID
RUN_ID=$(gh run list --workflow=daily-governance-report.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Download artifacts
gh run download $RUN_ID --dir ./artifacts/day-0

# Inspect generated report
cat ./artifacts/day-0/daily-governance-report-*/reports/monitoring-*.json | jq '.'
```

### 4. Configure GPG Secrets (Administrator)

If not already configured:

```bash
# Add GPG secrets to repository
gh secret set GPG_KEY_ID --body "YOUR_KEY_ID"
gh secret set GPG_PRIVATE_KEY < private.key.b64

# Verify secrets
gh secret list
```

## Success Criteria

✅ Commit created successfully  
✅ All 14 files included in commit  
✅ Commit message follows governance format  
✅ GPG signature present (if -S flag used)  
✅ Push successful to remote  
✅ Workflows visible on GitHub  
✅ Ready for Day 0 Bootstrap

## Rollback (If Needed)

```bash
# If you need to undo the commit (before push)
git reset --soft HEAD~1

# Files remain staged, you can re-commit
```

## Troubleshooting

### Issue: GPG Signing Failed

```bash
# Check GPG configuration
git config --global user.signingkey

# If not set, configure it
git config --global user.signingkey YOUR_KEY_ID

# Try commit again
git commit -S -F .git/COMMIT_MSG_BLOCK_C.txt
```

### Issue: "No GPG Secret Key"

```bash
# List available keys
gpg --list-secret-keys

# If empty, generate a new key
gpg --full-generate-key

# Export and configure
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey YOUR_KEY_ID
```

### Issue: Merge Conflict (Branch Behind)

```bash
# Your branch is behind origin/main by 1 commit
# Pull and rebase before pushing

git pull --rebase origin main

# If conflicts, resolve them
git status
# ... resolve conflicts ...
git add .
git rebase --continue

# Then push
git push origin main
```

## Next Steps After Commit

1. **Tag the Release (Optional)**

   ```bash
   git tag -a v6.0.1 -m "Block C: Autonomous Operations - Stage VI→VII"
   git push origin v6.0.1
   ```

2. **Update Project Board**
   - Mark Block C as complete
   - Update Stage VII roadmap
   - Document Day 0 Bootstrap date

3. **Notify Team**
   - Share completion report
   - Schedule Day 0 Bootstrap coordination
   - Assign GPG configuration if needed

4. **Documentation Update**
   - Update MASTERPLAN.md with Stage VII entry
   - Add Block C reference to main README
   - Update CHANGELOG.md

## References

- Prepared commit message: `.git/COMMIT_MSG_BLOCK_C.txt`
- Validation summary: `BLOCK10.10_VALIDATION_SUMMARY.md`
- Completion report: `BLOCK10.10_COMPLETION_REPORT.md`
- Operations guide: `docs/governance/BLOCK10.10_AUTONOMOUS_OPS.md`

---

**Prepared:** 2025-11-07  
**Status:** Ready for commit  
**Stage:** VI → VII Transition  
**Autonomy Level:** I (Self-Reporting & Verification)
