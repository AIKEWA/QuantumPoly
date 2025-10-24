<!-- FILE: SECRETS.inventory.md -->

# CI/CD Secrets Inventory

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Classification:** Internal Documentation  
**Owner:** DevOps Team / CASP Lead Architect

---

## Purpose

This document catalogs all secrets required for CI/CD pipeline execution, including storage location, rotation policies, ownership, and usage context. All secret values are redacted in this documentation.

**Security Notice:** This inventory is for reference only. Never commit actual secret values to version control.

---

## Secret Inventory

| Name                | Used By (Workflow/Job)                                                  | Rotation Policy                     | Storage Location            | Owner              | Notes                                                                                                               |
| ------------------- | ----------------------------------------------------------------------- | ----------------------------------- | --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | `release.yml` (all deployment jobs), `preview.yml` (preview deployment) | 90 days or on compromise            | GitHub Secrets (Repository) | DevOps Lead        | Vercel deployment token with project-level scope. Required for all Vercel CLI operations.                           |
| `VERCEL_ORG_ID`     | `release.yml` (all deployment jobs), `preview.yml` (preview deployment) | Never (immutable identifier)        | GitHub Secrets (Repository) | DevOps Lead        | Vercel organization identifier. Found in `.vercel/project.json` after running `vercel link`.                        |
| `VERCEL_PROJECT_ID` | `release.yml` (all deployment jobs), `preview.yml` (preview deployment) | Never (immutable identifier)        | GitHub Secrets (Repository) | DevOps Lead        | Vercel project identifier. Found in `.vercel/project.json` after running `vercel link`.                             |
| `GPG_PRIVATE_KEY`   | `release.yml` (update-ledger job)                                       | 365 days or on compromise           | GitHub Secrets (Repository) | Compliance Officer | Optional. GPG private key for signing governance ledger entries. Enables cryptographic verification of audit trail. |
| `GPG_KEY_ID`        | `release.yml` (update-ledger job)                                       | Never (paired with GPG_PRIVATE_KEY) | GitHub Secrets (Repository) | Compliance Officer | Optional. GPG key identifier for signature operations. Must match `GPG_PRIVATE_KEY`.                                |

---

## Detailed Secret Descriptions

### 1. VERCEL_TOKEN

**Purpose:** Authentication token for Vercel CLI deployment operations

**Scope:**

- Vercel API access for the QuantumPoly project
- Deployment creation and management
- Environment variable retrieval

**Obtaining the Token:**

```bash
# Method 1: Vercel Dashboard
# Navigate to: https://vercel.com/account/tokens
# Create new token with scope: Deploy & Read

# Method 2: Vercel CLI
vercel login
# Token stored in ~/.vercel/auth.json
```

**Rotation Procedure:**

1. Generate new token in Vercel dashboard
2. Update GitHub Secret `VERCEL_TOKEN`
3. Verify deployment workflow succeeds with new token
4. Revoke old token in Vercel dashboard
5. Document rotation in change log

**Rotation Cadence:** Every 90 days (automated reminder recommended)

**Compromise Response:**

1. Immediately revoke token in Vercel dashboard
2. Generate new token
3. Update GitHub Secret
4. Review deployment logs for unauthorized access (last 90 days)
5. Notify security team

**Storage Format:** Plaintext string (e.g., `vercel_abc123...xyz789`)

**Permissions Required:** Repository administrator or organization owner

---

### 2. VERCEL_ORG_ID

**Purpose:** Identifies the Vercel organization/team for deployment targeting

**Scope:**

- Organization context for Vercel CLI commands
- Scopes deployments to correct billing account

**Obtaining the ID:**

```bash
# Method 1: Link project
cd /path/to/project
vercel link

# Method 2: Read from project config
cat .vercel/project.json | jq -r '.orgId'

# Method 3: Vercel Dashboard
# Navigate to: Organization Settings → General
# Copy "Organization ID"
```

**Example Format:** `team_abc123xyz789` or `user_abc123xyz789`

**Rotation Policy:** Never (immutable identifier assigned by Vercel)

**Notes:**

- Not sensitive like a password, but should not be public
- Required for all `vercel` CLI commands in CI/CD
- Verify matches production organization before deployment

---

### 3. VERCEL_PROJECT_ID

**Purpose:** Identifies the specific Vercel project for deployment

**Scope:**

- Project context for Vercel CLI commands
- Routes deployments to correct project/domain

**Obtaining the ID:**

```bash
# Method 1: Link project
cd /path/to/project
vercel link

# Method 2: Read from project config
cat .vercel/project.json | jq -r '.projectId'

# Method 3: Vercel Dashboard
# Navigate to: Project Settings → General
# Copy "Project ID"
```

**Example Format:** `prj_abc123xyz789abcdef`

**Rotation Policy:** Never (immutable identifier assigned by Vercel)

**Notes:**

- Not sensitive, but should not be public
- Required for all `vercel` CLI commands in CI/CD
- Verify matches production project before deployment

---

### 4. GPG_PRIVATE_KEY (Optional)

**Purpose:** Cryptographic signing of governance ledger entries for audit trail verification

**Scope:**

- Sign ledger commits
- Sign ledger entry data
- Enable third-party verification of governance records

**Obtaining the Key:**

```bash
# Generate new GPG key pair
gpg --full-generate-key
# Select: RSA and RSA (default)
# Key size: 4096 bits
# Expiration: 1 year
# Name: QuantumPoly Governance Bot
# Email: governance@quantumpoly.ai

# Export private key (ASCII armored)
gpg --armor --export-secret-keys governance@quantumpoly.ai > private.key

# Export public key (for verification)
gpg --armor --export governance@quantumpoly.ai > governance/keys/ethical.pub
```

**Rotation Procedure:**

1. Generate new GPG key pair
2. Export private key (ASCII armored)
3. Update GitHub Secret `GPG_PRIVATE_KEY`
4. Update corresponding `GPG_KEY_ID`
5. Export public key to `governance/keys/ethical.pub`
6. Commit public key to repository
7. Document rotation in governance ledger
8. Keep old key for historical verification (90 days)
9. Update key management documentation

**Rotation Cadence:** Every 365 days or immediately on compromise

**Compromise Response:**

1. Immediately revoke key: `gpg --revoke [KEY_ID]`
2. Generate new key pair
3. Update GitHub Secrets
4. Publish revocation certificate
5. Notify governance team
6. Audit all ledger entries signed with compromised key
7. Document incident in governance ledger

**Storage Format:** ASCII-armored private key block

**Example Format:**

```
-----BEGIN PGP PRIVATE KEY BLOCK-----

[REDACTED - Never store actual key in documentation]

-----END PGP PRIVATE KEY BLOCK-----
```

**Notes:**

- Optional: Pipeline functions without GPG signing
- Recommended for production deployments requiring audit compliance
- Public key stored in `governance/keys/ethical.pub` (version controlled)
- Passphrase-protected keys not supported in GitHub Actions (use unencrypted key)

---

### 5. GPG_KEY_ID (Optional)

**Purpose:** Identifier for GPG key used in signing operations

**Scope:**

- Specifies which GPG key to use for signing
- Required when multiple keys exist in keyring

**Obtaining the Key ID:**

```bash
# List GPG keys
gpg --list-keys

# Output example:
# pub   rsa4096 2025-10-21 [SC] [expires: 2026-10-21]
#       ABCD1234EFGH5678IJKL9012MNOP3456QRST7890
# uid   QuantumPoly Governance Bot <governance@quantumpoly.ai>

# Key ID is the 40-character fingerprint
KEY_ID="ABCD1234EFGH5678IJKL9012MNOP3456QRST7890"
```

**Example Format:** `ABCD1234EFGH5678IJKL9012MNOP3456QRST7890` (40-character hex string)

**Rotation Policy:** Rotates with `GPG_PRIVATE_KEY` (same lifecycle)

**Notes:**

- Must correspond to the private key in `GPG_PRIVATE_KEY`
- Used by signing scripts to select correct key
- Optional: Pipeline functions without GPG signing

---

## Secret Storage & Access Control

### GitHub Secrets Repository Settings

**Location:** Repository → Settings → Secrets and variables → Actions

**Access Control:**

- Only repository administrators can view/modify secrets
- Secrets are masked in workflow logs
- Secret values never appear in step summaries or PR comments

**Environment-Specific Secrets:**
Currently, all secrets are stored at the repository level. Future enhancement: migrate to environment-specific secrets for production isolation.

**Recommended Future Enhancement:**

```
Environments:
  - production:
      VERCEL_TOKEN: [production-specific token]
      GPG_PRIVATE_KEY: [production signing key]

  - staging:
      VERCEL_TOKEN: [staging-specific token]
```

---

## Rotation Schedule & Reminders

| Secret              | Rotation Frequency          | Next Rotation Due | Reminder Method                        |
| ------------------- | --------------------------- | ----------------- | -------------------------------------- |
| `VERCEL_TOKEN`      | 90 days                     | 2026-01-20        | Calendar reminder (DevOps Lead)        |
| `VERCEL_ORG_ID`     | Never                       | N/A               | N/A                                    |
| `VERCEL_PROJECT_ID` | Never                       | N/A               | N/A                                    |
| `GPG_PRIVATE_KEY`   | 365 days                    | 2026-10-21        | Calendar reminder (Compliance Officer) |
| `GPG_KEY_ID`        | Paired with GPG_PRIVATE_KEY | 2026-10-21        | Paired rotation                        |

**Automation Recommendation:**
Implement automated rotation reminders via GitHub Issues scheduled workflow:

```yaml
# .github/workflows/secret-rotation-reminder.yml
on:
  schedule:
    - cron: '0 0 1 * *' # Monthly check
```

---

## Break-Glass Procedure

### Emergency Access to Secrets

**Scenario:** Production deployment required, but secret owner unavailable

**Procedure:**

1. **Assess Urgency:** Confirm deployment is time-critical (P0/P1 incident)
2. **Identify Backup Owner:** Consult secret ownership matrix below
3. **Obtain Approval:** Secure approval from one of:
   - CTO / Engineering Director
   - Security Team Lead
   - On-call DevOps Engineer
4. **Access Secret:**
   - Via GitHub: Repository administrator can view secrets
   - Via Vercel: Organization owner can regenerate tokens
5. **Document Access:** Log break-glass access in incident report
6. **Post-Incident Review:**
   - Rotate accessed secret within 24 hours
   - Update ownership matrix
   - Review and improve redundancy

---

## Secret Ownership Matrix

| Secret              | Primary Owner      | Backup Owner 1      | Backup Owner 2 |
| ------------------- | ------------------ | ------------------- | -------------- |
| `VERCEL_TOKEN`      | DevOps Lead        | Engineering Manager | CTO            |
| `VERCEL_ORG_ID`     | DevOps Lead        | Engineering Manager | CTO            |
| `VERCEL_PROJECT_ID` | DevOps Lead        | Engineering Manager | CTO            |
| `GPG_PRIVATE_KEY`   | Compliance Officer | CASP Lead Architect | CTO            |
| `GPG_KEY_ID`        | Compliance Officer | CASP Lead Architect | CTO            |

**Contact Information:** Stored in internal team directory (not public)

---

## Secret Verification Checklist

Before deploying with new/rotated secrets:

- [ ] Secret value is correct format (no extra whitespace, newlines)
- [ ] Secret is stored in correct GitHub location (Repository Secrets)
- [ ] Secret name exactly matches workflow file references
- [ ] Test deployment succeeds in staging environment
- [ ] Old secret (if rotated) is revoked/disabled
- [ ] Rotation documented in change log
- [ ] Backup owners notified of rotation

---

## Compliance & Audit Requirements

### Audit Trail

All secret rotations must be documented with:

- Date of rotation
- Reason for rotation (scheduled vs. compromise)
- Approver identity
- Verification that old secret was revoked

**Storage Location:** `governance/ledger/secret-rotation-log.jsonl` (proposed)

### Regulatory Requirements

**SOC 2 Type II:**

- Secrets rotated on defined schedule
- Access logs reviewed quarterly
- Break-glass access documented

**ISO 27001:**

- Secret inventory maintained (this document)
- Rotation procedures documented
- Compromise response plan defined

**EU GDPR (Article 32 - Security):**

- Secrets encrypted at rest (GitHub provides)
- Access control enforced (repository permissions)
- Breach notification plan defined

---

## Related Documentation

| Document                          | Relevance                                     |
| --------------------------------- | --------------------------------------------- |
| `README.CI-CD.md`                 | How secrets are used in workflows             |
| `GOVERNANCE.rationale.md`         | Compliance requirements for secret management |
| `TROUBLESHOOTING.and.ROLLBACK.md` | Diagnosing secret-related deployment failures |
| `DNS.and.Environments.md`         | Environment-specific secret configuration     |
| `governance/keys/README.md`       | GPG key management procedures                 |

---

## Frequently Asked Questions

### Q: Why are VERCEL_ORG_ID and VERCEL_PROJECT_ID stored as secrets?

**A:** While not sensitive like passwords, these identifiers prevent:

- Accidental deployment to wrong project
- Enumeration of organizational structure
- Exposure of deployment topology

They are stored as secrets for defense-in-depth, not strict security necessity.

---

### Q: Can I use a passphrase-protected GPG key?

**A:** No. GitHub Actions cannot interactively enter passphrases. Export the private key without a passphrase:

```bash
gpg --export-secret-keys --armor --no-passphrase [KEY_ID] > private.key
```

Ensure the secret is stored securely in GitHub Secrets to compensate for lack of passphrase.

---

### Q: What happens if VERCEL_TOKEN expires?

**A:**

- All deployments (preview, staging, production) will fail
- Workflow logs show: `Error: Invalid token`
- Resolution: Regenerate token in Vercel dashboard, update GitHub Secret

**Prevention:** Set calendar reminder 7 days before expiration

---

### Q: How do I verify GPG signatures in the ledger?

**A:**

```bash
# Import public key
gpg --import governance/keys/ethical.pub

# Verify ledger integrity
npm run ethics:verify-ledger

# Manual verification (if needed)
gpg --verify signature.asc ledger-entry.json
```

---

### Q: Should I store secrets in Vercel environment variables instead?

**A:**

- **Runtime secrets** (e.g., API keys used by application): Store in Vercel
- **Deployment secrets** (e.g., VERCEL_TOKEN): Store in GitHub Secrets
- **Never** store `VERCEL_TOKEN` in Vercel (circular dependency)

---

## Secret Security Best Practices

1. **Never Echo Secrets in Logs**

   ```yaml
   # ❌ BAD
   - run: echo "Token: ${{ secrets.VERCEL_TOKEN }}"

   # ✅ GOOD
   - run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
   ```

2. **Use Secrets in Environment Variables**

   ```yaml
   # ✅ GOOD
   - run: vercel deploy
     env:
       VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
   ```

3. **Mask Derived Values**

   ```yaml
   # If you must log a derived value
   - run: |
       echo "::add-mask::$DERIVED_VALUE"
       echo "Value: $DERIVED_VALUE"
   ```

4. **Minimize Secret Scope**
   - Use environment-specific secrets when possible
   - Apply least-privilege principle to token scopes
   - Prefer short-lived tokens (90 days vs. never-expire)

5. **Regular Audits**
   - Review secret usage quarterly
   - Remove unused secrets
   - Verify rotation schedule compliance

---

## Change Log

| Date       | Change                           | Approver            |
| ---------- | -------------------------------- | ------------------- |
| 2025-10-21 | Initial secret inventory created | CASP Lead Architect |

**Next Review Date:** 2026-01-21 (Quarterly)

---

**Document Owner:** DevOps Team  
**Classification:** Internal  
**Distribution:** Engineering team, security team, compliance team  
**Revision:** 1.0
