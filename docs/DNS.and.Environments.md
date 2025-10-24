<!-- FILE: DNS.and.Environments.md -->

# DNS Configuration & Environments

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Audience:** DevOps Engineers, Infrastructure Team  
**Classification:** Technical Configuration Guide

---

## Purpose

This document defines the three deployment environments (preview, staging, production), provides DNS configuration instructions for the production domain, and outlines safe rollout patterns for minimizing deployment risk.

---

## Environments Overview

| Environment    | Purpose                                  | Trigger                           | Approval                    | URL Pattern                                     | Persistence                       |
| -------------- | ---------------------------------------- | --------------------------------- | --------------------------- | ----------------------------------------------- | --------------------------------- |
| **Preview**    | Pull request validation, feature testing | PR opened/updated                 | None (automatic)            | `https://quantumpoly-[hash]-[scope].vercel.app` | Deleted 30 days after PR close    |
| **Staging**    | QA validation, pre-production testing    | Merge to `main`                   | None (automatic)            | `https://quantumpoly-[hash].vercel.app`         | Latest deployment persists        |
| **Production** | Public-facing website                    | Git tag `v*.*.*` + GitHub Release | ✅ Manual approval required | `https://www.quantumpoly.ai`                    | Permanent (until next deployment) |

---

## Environment 1: Preview

### Purpose

Provide isolated environment for each pull request to validate changes before merge.

### Configuration

**Workflow:** `.github/workflows/preview.yml`

**Trigger:**

```yaml
on:
  pull_request:
    branches: [main]
```

**Deployment Process:**

1. PR opened or updated
2. Vercel CLI pulls preview environment variables
3. Build executes with preview configuration
4. Deployment creates unique preview URL
5. Lighthouse CI validates preview
6. PR receives comment with preview URL

**Environment Variables:**

- Vercel Environment: `preview`
- Configure in: Vercel dashboard → Project → Settings → Environment Variables → Preview

**URL Format:**

- Standard: `https://quantumpoly-[git-hash]-[scope].vercel.app`
- Example: `https://quantumpoly-abc1234-quantumpolyai.vercel.app`

**Retention:**

- Active while PR is open
- Deleted 30 days after PR is closed or merged
- Manual deletion: Vercel dashboard → Deployments → Select deployment → Delete

**Access Control:**

- Public (no authentication required)
- Optional: Enable Vercel Protection for password-protected previews

---

## Environment 2: Staging

### Purpose

Validate merged changes in production-like environment before public release. QA team performs manual testing on staging.

### Configuration

**Workflow:** `.github/workflows/release.yml` (deploy-staging job)

**Trigger:**

```yaml
on:
  push:
    branches: [main]
```

**Deployment Process:**

1. PR merged to `main` branch
2. CI quality gates re-run on `main`
3. `deploy-staging` job triggers automatically
4. Vercel CLI pulls preview environment variables (same as preview)
5. Build executes with staging configuration
6. Deployment creates staging URL
7. QA team validates deployment

**Environment Variables:**

- Vercel Environment: `preview` (staging uses preview environment in Vercel)
- Configure in: Vercel dashboard → Project → Settings → Environment Variables → Preview

**URL Format:**

- Dynamic: `https://quantumpoly-[git-hash].vercel.app`
- Example: `https://quantumpoly-xyz7890.vercel.app`

**Retention:**

- Latest staging deployment persists indefinitely
- Previous staging deployments retained in Vercel history

**Access Control:**

- Public (no authentication required)
- Optional: Enable Vercel Protection for internal-only access

**Recommended Configuration:**

```bash
# Optional: Create custom staging alias
vercel alias set [STAGING_URL] staging.quantumpoly.ai --token=$VERCEL_TOKEN

# Requires DNS CNAME:
# staging.quantumpoly.ai → cname.vercel-dns.com
```

---

## Environment 3: Production

### Purpose

Public-facing website serving end users at custom domain `www.quantumpoly.ai`.

### Configuration

**Workflow:** `.github/workflows/release.yml` (deploy-production job)

**Trigger:**

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
  release:
    types: [published]
```

**Deployment Process:**

1. Git tag `v*.*.*` pushed to repository
2. GitHub Release created (or already exists)
3. `validate-release` job verifies tag format and release
4. `deploy-production` job waits for manual approval
5. Designated reviewer approves in GitHub Environment UI
6. Vercel CLI pulls production environment variables
7. Build executes with production optimizations (`--prod` flag)
8. Deployment creates production URL
9. Custom domain `www.quantumpoly.ai` aliased to deployment
10. `update-ledger` job records deployment in governance ledger

**Environment Variables:**

- Vercel Environment: `production`
- Configure in: Vercel dashboard → Project → Settings → Environment Variables → Production

**URL Format:**

- Primary (Custom Domain): `https://www.quantumpoly.ai`
- Vercel URL (Direct): `https://quantumpoly-[hash].vercel.app`

**Retention:**

- Current production deployment persists until next production deployment
- All production deployments retained in Vercel history (90 days via artifacts)

**Access Control:**

- Public (no authentication required)
- Domain: `www.quantumpoly.ai`

---

## DNS Configuration (Production)

### Prerequisites

- Access to DNS provider (e.g., Cloudflare, Route 53, Namecheap)
- Domain ownership: `quantumpoly.ai`
- Vercel project configured with custom domain

---

### Step 1: Add Domain in Vercel

```bash
# Via Vercel Dashboard:
# 1. Navigate to: Project → Settings → Domains
# 2. Click "Add Domain"
# 3. Enter: www.quantumpoly.ai
# 4. Click "Add"
# 5. Vercel provides DNS instructions

# Via Vercel CLI:
vercel domains add www.quantumpoly.ai --token=$VERCEL_TOKEN
```

---

### Step 2: Configure DNS Records

**Required Record (CNAME):**

| Type  | Name  | Value                  | TTL  |
| ----- | ----- | ---------------------- | ---- |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 |

**Configuration Examples:**

**Cloudflare:**

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
TTL: Auto
Proxy status: DNS only (gray cloud) ⚠️ Important: Disable Cloudflare proxy initially
```

**AWS Route 53:**

```
Record name: www
Record type: CNAME
Value: cname.vercel-dns.com
TTL: 3600
Routing policy: Simple
```

**Namecheap:**

```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com.  (note trailing dot)
TTL: 3600
```

---

### Step 3: Optional - Apex Domain Redirect

To redirect `quantumpoly.ai` → `www.quantumpoly.ai`:

**Option 1: A Record (Vercel IPs)**

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option 2: CNAME Flattening (Cloudflare)**

```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
TTL: Auto
Note: Cloudflare automatically flattens CNAME at apex
```

**Option 3: DNS Provider Redirect**

```
Most DNS providers offer URL redirect service:
@ (apex) → https://www.quantumpoly.ai (permanent/301)
```

---

### Step 4: Verify DNS Propagation

```bash
# Check CNAME record
dig www.quantumpoly.ai CNAME +short
# Expected output: cname.vercel-dns.com

# Check A record (after Vercel processes)
dig www.quantumpoly.ai A +short
# Expected output: Vercel IP addresses (e.g., 76.76.21.21)

# Check from multiple locations (DNS propagation)
# Use: https://www.whatsmydns.net/#CNAME/www.quantumpoly.ai

# Alternative check with nslookup
nslookup www.quantumpoly.ai
# Expected: CNAME cname.vercel-dns.com
```

**DNS Propagation Time:**

- Local ISP: 5-30 minutes
- Global: 24-48 hours (worst case)
- Cloudflare: 1-5 minutes (with low TTL)

---

### Step 5: SSL/TLS Certificate Provisioning

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Verification:**

```bash
# Check SSL certificate
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -subject -dates -issuer

# Expected output:
# subject=CN=www.quantumpoly.ai
# notBefore=... (recent date)
# notAfter=... (90 days from issuance)
# issuer=C=US, O=Let's Encrypt, CN=...

# Check SSL grade (optional)
# Use: https://www.ssllabs.com/ssltest/analyze.html?d=www.quantumpoly.ai
```

**Certificate Auto-Renewal:**

- Vercel automatically renews certificates 30 days before expiration
- No manual intervention required

**Troubleshooting SSL:**

- If certificate not provisioning within 10 minutes:
  1. Verify DNS CNAME is correct
  2. Check domain ownership in Vercel dashboard
  3. Review Vercel project settings → Domains → Status
  4. Contact Vercel support if issue persists

---

### Step 6: CAA Records (Optional, Recommended)

Certificate Authority Authorization (CAA) records specify which CAs can issue certificates for your domain.

**Recommended CAA Record:**

```
Type: CAA
Name: quantumpoly.ai
Value: 0 issue "letsencrypt.org"
TTL: 3600
```

**Additional CAA for Wildcard (if needed):**

```
Type: CAA
Name: quantumpoly.ai
Value: 0 issuewild "letsencrypt.org"
TTL: 3600
```

---

## Environment Variables Configuration

### Preview/Staging Environment Variables

**Configure in:** Vercel Dashboard → Project → Settings → Environment Variables → Preview

| Variable               | Example Value                            | Purpose                     |
| ---------------------- | ---------------------------------------- | --------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://quantumpoly-preview.vercel.app` | Canonical URL for previews  |
| `NEXT_PUBLIC_ENV`      | `preview`                                | Environment detection       |
| `VERCEL_ENV`           | `preview`                                | Automatically set by Vercel |

---

### Production Environment Variables

**Configure in:** Vercel Dashboard → Project → Settings → Environment Variables → Production

| Variable               | Example Value                | Purpose                     |
| ---------------------- | ---------------------------- | --------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.quantumpoly.ai` | Canonical URL for SEO       |
| `NEXT_PUBLIC_ENV`      | `production`                 | Environment detection       |
| `VERCEL_ENV`           | `production`                 | Automatically set by Vercel |
| `NODE_ENV`             | `production`                 | Node.js environment         |

**Note:** Sensitive secrets (API keys, tokens) should be stored in Vercel environment variables, NOT in code or `.env` files committed to Git.

---

### Accessing Environment Variables

**In Next.js Code:**

```typescript
// Public variables (client-side accessible)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const environment = process.env.NEXT_PUBLIC_ENV;

// Server-side only variables
const apiKey = process.env.SECRET_API_KEY; // Not exposed to client
```

**In CI/CD Workflows:**

```yaml
- name: Build project artifacts
  run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
  env:
    NEXT_PUBLIC_SITE_URL: https://www.quantumpoly.ai
```

---

## Safe Rollout Patterns

### Pattern 1: Preview → Staging → Production (Standard)

**Process:**

1. **Preview:** Deploy PR, validate feature in isolation
2. **Staging:** Merge to `main`, QA team validates on staging
3. **Production:** Create tag + release, manual approval, deploy to production

**Advantages:**

- Three validation checkpoints
- QA can test in production-like environment
- Rollback straightforward (redeploy previous release)

**Use Case:** All standard feature releases

---

### Pattern 2: Canary via Preview Links (Risk Mitigation)

**Process:**

1. Deploy to production with custom alias
2. Share production preview URL with limited users (beta testers)
3. Monitor metrics (errors, performance) for 24 hours
4. If stable, alias to `www.quantumpoly.ai`
5. If issues, roll back to previous deployment

**Implementation:**

```bash
# Step 1: Deploy to production (without aliasing to www)
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
# Output: https://quantumpoly-xyz789.vercel.app

# Step 2: Share canary URL with beta testers
# Monitor logs, error rates, user feedback

# Step 3: Promote to primary domain
vercel alias set https://quantumpoly-xyz789.vercel.app www.quantumpoly.ai --token=$VERCEL_TOKEN
```

**Advantages:**

- Reduce blast radius of issues
- Real production data, limited user exposure
- Easy rollback (don't alias, or alias previous deployment)

**Use Case:** High-risk changes (major refactoring, infrastructure changes)

---

### Pattern 3: Blue-Green Deployment (Future Enhancement)

**Concept:**

- Blue environment: Current production
- Green environment: New production deployment
- Instant cutover via DNS/CDN switch

**Implementation (Proposed):**

```bash
# Blue (current): www.quantumpoly.ai → deployment-blue.vercel.app
# Green (new): www-green.quantumpoly.ai → deployment-green.vercel.app

# After validation on green:
# Switch CNAME: www → deployment-green.vercel.app
# Rollback: Switch CNAME: www → deployment-blue.vercel.app
```

**Advantages:**

- Instant rollback (DNS switch)
- Zero downtime
- Full production validation before cutover

**Disadvantages:**

- Requires custom DNS management
- More complex configuration
- Higher cost (two production environments)

**Status:** Not currently implemented; proposed for future consideration

---

## DNS Troubleshooting

### Issue 1: DNS Not Resolving

**Symptoms:**

- `dig www.quantumpoly.ai` returns `NXDOMAIN` or no records
- Website not accessible via custom domain

**Diagnosis:**

```bash
dig www.quantumpoly.ai CNAME +short
# If empty: CNAME not configured or not propagated
```

**Fix:**

1. Verify CNAME record exists in DNS provider
2. Check record name is `www` (not `www.quantumpoly.ai`)
3. Check value is `cname.vercel-dns.com` (exact match)
4. Wait for DNS propagation (up to 48 hours, typically < 1 hour)
5. Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)

---

### Issue 2: SSL Certificate Not Provisioning

**Symptoms:**

- Browser shows "Certificate Error" or "Not Secure"
- `curl https://www.quantumpoly.ai` fails with SSL error

**Diagnosis:**

```bash
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -subject
# If error: Certificate not issued or invalid
```

**Fix:**

1. Verify DNS CNAME is correct (Vercel cannot issue cert without valid DNS)
2. Check domain status in Vercel dashboard → Domains
3. Wait up to 10 minutes for certificate issuance
4. Verify CAA records allow Let's Encrypt (if CAA configured)
5. Remove and re-add domain in Vercel (last resort)

---

### Issue 3: Wrong Environment Detected

**Symptoms:**

- Production shows "preview" or "staging" content
- `robots.txt` shows `Disallow: /` in production

**Diagnosis:**

```bash
# Check environment variable
curl https://www.quantumpoly.ai/api/env-check
# Or check <meta> tags in page source

# Check robots.txt
curl https://www.quantumpoly.ai/robots.txt
```

**Fix:**

1. Verify `NEXT_PUBLIC_ENV=production` in Vercel environment variables (Production)
2. Verify `NEXT_PUBLIC_SITE_URL=https://www.quantumpoly.ai`
3. Redeploy: Create new tag/release to trigger fresh production build
4. Check `src/app/robots.ts` logic for environment detection

---

### Issue 4: Redirect Loops

**Symptoms:**

- Browser shows "Too many redirects" error
- `curl -I https://www.quantumpoly.ai` shows `301 → 301 → 301 ...`

**Diagnosis:**

```bash
curl -I https://www.quantumpoly.ai
# Check Location header for redirect chain
```

**Common Causes:**

- Cloudflare proxy enabled with Vercel (double redirect)
- Apex domain redirect misconfigured
- `next.config.js` redirect rules conflict

**Fix:**

1. Disable Cloudflare proxy (set to DNS only)
2. Remove duplicate redirect rules in `next.config.js`
3. Verify only one redirect mechanism in use (Vercel or DNS provider)

---

## Environment Comparison Matrix

| Aspect                    | Preview                | Staging           | Production                   |
| ------------------------- | ---------------------- | ----------------- | ---------------------------- |
| **Trigger**               | PR opened/updated      | Merge to `main`   | Tag + Release + Approval     |
| **Approval**              | None                   | None              | ✅ Manual                    |
| **Environment Variables** | Preview                | Preview           | Production                   |
| **Domain**                | Vercel subdomain       | Vercel subdomain  | `www.quantumpoly.ai`         |
| **SSL**                   | Auto (Vercel)          | Auto (Vercel)     | Auto (Let's Encrypt)         |
| **Persistence**           | 30 days after PR close | Latest deployment | Until next production deploy |
| **Purpose**               | Feature validation     | QA testing        | Public production            |
| **Ledger Entry**          | No                     | No                | ✅ Yes                       |
| **Monitoring**            | Basic                  | Basic             | ✅ Enhanced (proposed)       |

---

## Related Documentation

| Document                          | Relevance                                   |
| --------------------------------- | ------------------------------------------- |
| `README.CI-CD.md`                 | Pipeline architecture and deployment flow   |
| `TROUBLESHOOTING.and.ROLLBACK.md` | DNS troubleshooting and rollback procedures |
| `GOVERNANCE.rationale.md`         | Environment approval requirements           |
| `DNS_CONFIGURATION.md`            | Comprehensive DNS setup guide (if exists)   |
| `vercel.json`                     | Vercel project configuration                |

---

## Verification Checklist (Production DNS)

Before considering production DNS configured:

- [ ] CNAME record `www → cname.vercel-dns.com` exists in DNS provider
- [ ] DNS propagation complete (verified via `dig` and https://whatsmydns.net)
- [ ] SSL certificate provisioned (verified via `openssl s_client`)
- [ ] `https://www.quantumpoly.ai` resolves and loads correctly
- [ ] SSL grade A or A+ (verified via SSL Labs)
- [ ] Apex domain redirects to `www` (if configured)
- [ ] CAA records allow Let's Encrypt (if configured)
- [ ] Environment variables set to production values in Vercel
- [ ] `robots.txt` allows crawling (not `Disallow: /`)
- [ ] Post-deployment verification checklist completed (see `TROUBLESHOOTING.and.ROLLBACK.md`)

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-10-21  
**Next Review:** 2026-01-21 (Quarterly)  
**Maintained By:** DevOps Team & Infrastructure Team
