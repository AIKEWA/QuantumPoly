# Governance Integration Template

**Purpose:** Generic template for adding governance features (ledger updates, ethics validation, policy reviews) to CI/CD pipelines

**Customization Required:** Replace all `${VARIABLE}` placeholders with your project-specific values

---

## Template: Governance Validation Job

```yaml
governance:
  name: Governance Validation
  runs-on: ubuntu-latest
  timeout-minutes: ${TIMEOUT_MINUTES} # e.g., 10

  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0 # Full history for ledger verification

    - uses: actions/setup-node@v4
      with:
        node-version: '${NODE_VERSION}'
        cache: '${PACKAGE_MANAGER}'

    - name: Install dependencies
      run: ${INSTALL_COMMAND}

    # Validation 1: Translation/Locale Integrity
    - name: Validate translations
      run: ${TRANSLATION_VALIDATION_COMMAND} # e.g., npm run validate:translations

    # Validation 2: Policy Reviews
    - name: Validate policy reviews
      run: ${POLICY_VALIDATION_COMMAND} # e.g., npm run validate:policy-reviews

    # Validation 3: Ethics Metrics (Optional)
    - name: Validate ethics metrics
      run: ${ETHICS_VALIDATION_COMMAND} # e.g., npm run ethics:validate
      continue-on-error: ${ETHICS_OPTIONAL} # true if optional, false if required

    # Validation 4: Ledger Integrity
    - name: Verify ledger integrity
      run: ${LEDGER_VERIFICATION_COMMAND} # e.g., npm run verify:ledger

    # Upload governance artifacts for compliance
    - name: Upload governance reports
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: governance-reports
        path: ${GOVERNANCE_REPORTS_PATH} # e.g., reports/governance/
        if-no-files-found: ignore
        retention-days: ${GOVERNANCE_RETENTION} # e.g., 90 for compliance
```

---

## Template: Ledger Update Job (Post-Deployment)

```yaml
update-ledger:
  name: Update Governance Ledger
  needs: [deploy-production] # Run after successful production deployment
  runs-on: ubuntu-latest
  timeout-minutes: 10

  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
        token: ${{ secrets.GITHUB_TOKEN }}

    - uses: actions/setup-node@v4
      with:
        node-version: '${NODE_VERSION}'
        cache: '${PACKAGE_MANAGER}'

    - name: Install dependencies
      run: ${INSTALL_COMMAND}

    - name: Configure Git
      run: |
        git config user.name "github-actions[bot]"
        git config user.email "github-actions[bot]@users.noreply.github.com"

    # Update ledger with deployment metadata
    - name: Update ledger
      run: ${LEDGER_UPDATE_COMMAND} # e.g., npm run ledger:update
      env:
        CI: 'true'
        DEPLOYMENT_TAG: ${{ needs.validate-release.outputs.tag }}
        DEPLOYMENT_URL: ${{ needs.deploy-production.outputs.production_url }}
        DEPLOYMENT_ENVIRONMENT: production
        DEPLOYMENT_TIMESTAMP: ${{ github.event.head_commit.timestamp }}
        # Optional: GPG signing
        GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY || '' }}
        GPG_KEY_ID: ${{ secrets.GPG_KEY_ID || '' }}

    # Verify ledger integrity after update
    - name: Verify ledger integrity
      run: ${LEDGER_VERIFICATION_COMMAND}

    # Commit ledger changes to repository
    - name: Commit ledger updates
      run: |
        git add ${LEDGER_PATH}/  # e.g., governance/ledger/
        git add ${REPORTS_PATH}/  # e.g., reports/governance/

        if git diff --staged --quiet; then
          echo "No ledger changes to commit"
        else
          git commit -m "chore: update ledger for ${{ needs.validate-release.outputs.tag }} [skip ci]"
          git push origin ${MAIN_BRANCH}
          echo "✅ Ledger updated and committed"
        fi

    # Upload ledger artifacts for audit trail
    - name: Upload ledger artifacts
      uses: actions/upload-artifact@v4
      with:
        name: governance-ledger-${{ needs.validate-release.outputs.tag }}
        path: |
          ${LEDGER_PATH}/
          ${REPORTS_PATH}/
        retention-days: ${LEDGER_RETENTION} # e.g., 90 for compliance
```

---

## Customization Variables

### General Configuration

| Variable             | Description        | Example Values                             |
| -------------------- | ------------------ | ------------------------------------------ |
| `${TIMEOUT_MINUTES}` | Job timeout        | `10`, `15`                                 |
| `${NODE_VERSION}`    | Node.js version    | `'20'`, `'18'`                             |
| `${PACKAGE_MANAGER}` | Package manager    | `'npm'`, `'yarn'`, `'pnpm'`                |
| `${INSTALL_COMMAND}` | Dependency install | `npm ci`, `yarn install --frozen-lockfile` |
| `${MAIN_BRANCH}`     | Main branch name   | `main`, `master`                           |

### Validation Commands

| Variable                            | Description                 | Example Values                                          |
| ----------------------------------- | --------------------------- | ------------------------------------------------------- |
| `${TRANSLATION_VALIDATION_COMMAND}` | Translation validation      | `npm run validate:translations`, `yarn validate:i18n`   |
| `${POLICY_VALIDATION_COMMAND}`      | Policy review validation    | `npm run validate:policy-reviews`, Custom script        |
| `${ETHICS_VALIDATION_COMMAND}`      | Ethics metrics validation   | `npm run ethics:validate`, Custom script                |
| `${ETHICS_OPTIONAL}`                | Ethics validation optional? | `true`, `false`                                         |
| `${LEDGER_VERIFICATION_COMMAND}`    | Ledger integrity check      | `npm run verify:ledger`, `npm run ethics:verify-ledger` |
| `${LEDGER_UPDATE_COMMAND}`          | Ledger update command       | `npm run ledger:update`, `npm run ethics:ledger-update` |

### Paths & Retention

| Variable                     | Description                   | Example Values                            |
| ---------------------------- | ----------------------------- | ----------------------------------------- |
| `${GOVERNANCE_REPORTS_PATH}` | Governance reports directory  | `reports/governance/`, `docs/governance/` |
| `${LEDGER_PATH}`             | Ledger directory              | `governance/ledger/`, `audit-trail/`      |
| `${REPORTS_PATH}`            | Reports directory             | `reports/governance/`, `reports/`         |
| `${GOVERNANCE_RETENTION}`    | Governance artifact retention | `90`, `180`, `365` (days)                 |
| `${LEDGER_RETENTION}`        | Ledger artifact retention     | `90`, `180`, `365` (days)                 |

---

## QuantumPoly Example

```yaml
# Real values used in QuantumPoly implementation
${TIMEOUT_MINUTES}                  = 10
${NODE_VERSION}                     = '20'
${PACKAGE_MANAGER}                  = 'npm'
${INSTALL_COMMAND}                  = npm ci --legacy-peer-deps
${MAIN_BRANCH}                      = main

${TRANSLATION_VALIDATION_COMMAND}   = npm run validate:translations
${POLICY_VALIDATION_COMMAND}        = npm run validate:policy-reviews
${ETHICS_VALIDATION_COMMAND}        = npm run ethics:validate
${ETHICS_OPTIONAL}                  = true
${LEDGER_VERIFICATION_COMMAND}      = npm run ethics:verify-ledger
${LEDGER_UPDATE_COMMAND}            = npm run ethics:ledger-update

${GOVERNANCE_REPORTS_PATH}          = reports/governance/
${LEDGER_PATH}                      = governance/ledger/
${REPORTS_PATH}                     = reports/governance/
${GOVERNANCE_RETENTION}             = 90
${LEDGER_RETENTION}                 = 90
```

---

## Optional Enhancements

### 1. Add Ethical Integrity Index (EII) Scoring

```yaml
- name: Calculate EII score
  id: eii
  run: |
    SCORE=$(${EII_CALCULATION_COMMAND})  # e.g., npm run ethics:aggregate
    echo "score=$SCORE" >> "$GITHUB_OUTPUT"

    if [ "$SCORE" -lt ${EII_THRESHOLD} ]; then
      echo "❌ EII score ($SCORE) below threshold (${EII_THRESHOLD})"
      exit 1
    fi

- name: Comment EII score on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const comment = `## 🏅 Ethical Integrity Index: ${{ steps.eii.outputs.score }}/100

      **Status:** ${{ steps.eii.outputs.score >= ${EII_THRESHOLD} ? '✅ Pass' : '❌ Fail' }}
      **Threshold:** ${EII_THRESHOLD}/100`;

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

### 2. Add GPG Signature Verification

```yaml
- name: Verify GPG signatures
  if: ${{ secrets.GPG_PUBLIC_KEY != '' }}
  run: |
    echo "${{ secrets.GPG_PUBLIC_KEY }}" | gpg --import
    for sig in ${LEDGER_PATH}/*.asc; do
      gpg --verify "$sig" || exit 1
    done
```

### 3. Add Automated Policy Review Checks

```yaml
- name: Check policy review status
  run: |
    PENDING=$(${POLICY_CHECK_COMMAND})  # e.g., npm run policy:check-pending
    if [ "$PENDING" -gt 0 ]; then
      echo "⚠️ $PENDING policies pending review"
      exit 1
    fi
```

---

## Ledger Entry Structure (Example)

```json
{
  "version": "${VERSION}",
  "tag": "${TAG}",
  "timestamp": "${TIMESTAMP}",
  "commit": "${COMMIT_SHA}",
  "deploymentUrl": "${DEPLOYMENT_URL}",
  "productionUrl": "${PRODUCTION_URL}",
  "approver": "${APPROVER}",
  "eiiScore": ${EII_SCORE},
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

---

## Compliance Use Cases

### SOC 2 Type II

**Requirements:**

- Audit trail of all deployments
- Evidence of code reviews and approvals
- Retention: 90+ days

**Implementation:**

- Ledger updates with deployment metadata
- Governance artifact retention: 90 days
- GPG signatures for non-repudiation

### ISO 27001

**Requirements:**

- Event logging and monitoring
- Change management audit trail
- Protection against log tampering

**Implementation:**

- Ledger integrity verification
- Git-based immutable audit trail
- Optional GPG signatures

### WCAG 2.2 AA Compliance

**Requirements:**

- Evidence of continuous accessibility testing
- Audit trail of accessibility scores
- Long-term evidence retention

**Implementation:**

- Governance validation includes a11y checks
- Lighthouse evidence retention: 90 days
- Accessibility artifacts uploaded

---

## Security Considerations

**Best Practices:**

- Never echo secrets in logs
- Use `--legacy-peer-deps` only if needed (security implications)
- Rotate GPG keys every 2 years
- Restrict ledger write access (use bot account)

**Permissions:**

- `contents: write` only in ledger update job
- `contents: read` in validation job
- Separate workflows for different permission levels

---

## Related Prompts

- **Block 7.1 (Architecture)** - Overall governance integration design
- **Block 7.7 (GPG Signing)** - Cryptographic signature setup

---

**Template Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintained By:** CASP Lead Architect
