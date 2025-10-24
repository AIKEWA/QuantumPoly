# DNS Configuration Guide

**Domain:** `quantumpoly.ai`  
**Production URL:** `https://www.quantumpoly.ai`  
**Staging URL:** Assigned dynamically by Vercel (branch-based)

---

## Summary

This document provides step-by-step instructions for configuring DNS records for QuantumPoly's production and staging environments on Vercel, along with post-deployment verification procedures.

---

## Production Setup (www.quantumpoly.ai)

### Prerequisites

- Access to your DNS provider's control panel (e.g., Cloudflare, AWS Route 53, Namecheap)
- Vercel account with project created
- Domain `quantumpoly.ai` registered

---

### Step 1: Add Domain to Vercel

1. Navigate to your Vercel project dashboard
2. Go to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `www.quantumpoly.ai`
5. Click **Add**

Vercel will provide verification instructions and target records.

---

### Step 2: Configure DNS Records

#### Option A: CNAME Configuration (Recommended)

Add the following CNAME record at your DNS provider:

| Type  | Name | Value                | TTL  |
| ----- | ---- | -------------------- | ---- |
| CNAME | www  | cname.vercel-dns.com | 3600 |

#### Option B: A/AAAA Configuration

If your DNS provider requires A records:

| Type | Name | Value       | TTL  |
| ---- | ---- | ----------- | ---- |
| A    | www  | 76.76.21.21 | 3600 |

**Note:** Vercel's IP addresses may change. Always verify current IPs in your Vercel domain settings.

---

### Step 3: Configure Apex Domain (Optional)

To redirect `quantumpoly.ai` → `www.quantumpoly.ai`:

#### At DNS Provider:

| Type  | Name | Value                | TTL  |
| ----- | ---- | -------------------- | ---- |
| CNAME | @    | cname.vercel-dns.com | 3600 |

**Or** use DNS provider's redirect/forwarding feature:

- Source: `quantumpoly.ai`
- Destination: `https://www.quantumpoly.ai`
- Type: 301 (Permanent)

---

### Step 4: Add TXT Verification Record

Vercel may require domain ownership verification:

| Type | Name     | Value                          | TTL  |
| ---- | -------- | ------------------------------ | ---- |
| TXT  | \_vercel | vc-domain-verify=XXXXXXXXXXXXX | 3600 |

**Replace `XXXXXXXXXXXXX`** with the value provided in Vercel's domain settings.

---

### Step 5: Configure CAA Records (Security)

Restrict SSL/TLS certificate issuance to Vercel's providers:

| Type | Name | Value                         | TTL  |
| ---- | ---- | ----------------------------- | ---- |
| CAA  | @    | 0 issue "letsencrypt.org"     | 3600 |
| CAA  | @    | 0 issuewild "letsencrypt.org" | 3600 |

---

### Step 6: SSL/TLS Configuration

Vercel automatically provisions SSL/TLS certificates via Let's Encrypt.

**Verification:**

1. Wait 5-10 minutes for DNS propagation
2. Check certificate status in Vercel: **Settings** → **Domains**
3. Look for **Valid** status next to `www.quantumpoly.ai`

If certificate fails:

- Verify DNS records are correct
- Check for conflicting CAA records
- Ensure domain is not redirecting before certificate issuance

---

## Staging Setup (Vercel Branch Deployment)

Staging deployments use Vercel's automatic branch-based URLs.

### Default Staging URL Pattern

```
https://quantumpoly-BRANCH-USERNAME.vercel.app
```

Example for `main` branch:

```
https://quantumpoly-main-username.vercel.app
```

---

### Custom Staging Domain (Optional)

To use `staging.quantumpoly.ai`:

#### Step 1: Add Domain to Vercel

1. In Vercel project settings → **Domains**
2. Add domain: `staging.quantumpoly.ai`
3. Assign to branch: `main` (or your staging branch)

#### Step 2: Configure DNS

| Type  | Name    | Value                | TTL  |
| ----- | ------- | -------------------- | ---- |
| CNAME | staging | cname.vercel-dns.com | 3600 |

#### Step 3: Environment Configuration

In Vercel project settings → **Environment Variables**:

| Key                  | Value (Staging)                | Environment |
| -------------------- | ------------------------------ | ----------- |
| NEXT_PUBLIC_SITE_URL | https://staging.quantumpoly.ai | Preview     |
| NODE_ENV             | production                     | Preview     |

---

## Environment Variable Configuration

### Production Environment

Navigate to Vercel: **Settings** → **Environment Variables**

| Variable             | Value                      | Environment |
| -------------------- | -------------------------- | ----------- |
| NEXT_PUBLIC_SITE_URL | https://www.quantumpoly.ai | Production  |
| NODE_ENV             | production                 | Production  |

### Preview Environment (PRs)

| Variable             | Value                | Environment |
| -------------------- | -------------------- | ----------- |
| NEXT_PUBLIC_SITE_URL | (Dynamic Vercel URL) | Preview     |
| NODE_ENV             | production           | Preview     |

---

## Post-Deployment Verification

### DNS Propagation Check

```bash
# Check CNAME resolution
dig www.quantumpoly.ai CNAME +short

# Expected output: cname.vercel-dns.com

# Check A record resolution
dig www.quantumpoly.ai A +short

# Expected output: 76.76.21.21 (or Vercel's current IP)
```

**Alternative using `nslookup`:**

```bash
nslookup www.quantumpoly.ai
```

---

### SSL/TLS Verification

```bash
# Check SSL certificate
openssl s_client -connect www.quantumpoly.ai:443 -servername www.quantumpoly.ai < /dev/null 2>/dev/null | openssl x509 -noout -text

# Or use online tool:
# https://www.ssllabs.com/ssltest/analyze.html?d=www.quantumpoly.ai
```

**Expected:**

- Issuer: Let's Encrypt
- Valid dates: Current + ~90 days
- Subject Alternative Names: www.quantumpoly.ai

---

### Canonical URL Verification

```bash
# Check canonical tag in HTML
curl -sL https://www.quantumpoly.ai | grep 'rel="canonical"'

# Expected output:
# <link rel="canonical" href="https://www.quantumpoly.ai/en" />
```

---

### Robots.txt Environment Detection

```bash
# Production should allow crawlers
curl -sL https://www.quantumpoly.ai/robots.txt

# Expected output:
# User-agent: *
# Allow: /
# Sitemap: https://www.quantumpoly.ai/sitemap.xml

# Staging/Preview should block crawlers
curl -sL https://staging.quantumpoly.ai/robots.txt

# Expected output:
# User-agent: *
# Disallow: /
```

---

### Sitemap Accessibility

```bash
# Verify sitemap is accessible
curl -sL https://www.quantumpoly.ai/sitemap.xml | head -20

# Expected: Valid XML with <urlset> and multiple <url> entries
```

---

### Headers Verification

```bash
# Check security headers
curl -sI https://www.quantumpoly.ai

# Verify presence of:
# - Strict-Transport-Security
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - Referrer-Policy
# - Content-Security-Policy
```

---

## Troubleshooting

### DNS Not Resolving

**Symptoms:**

- `dig` or `nslookup` returns no results
- Browser shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Solutions:**

1. Verify DNS records are saved at provider
2. Wait 5-60 minutes for propagation (TTL dependent)
3. Clear local DNS cache:

   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemd-resolve --flush-caches

   # Windows
   ipconfig /flushdns
   ```

4. Test with public DNS:
   ```bash
   dig @8.8.8.8 www.quantumpoly.ai
   ```

---

### SSL Certificate Not Provisioning

**Symptoms:**

- Vercel shows "Certificate Invalid" or "Pending"
- Browser shows SSL warning

**Solutions:**

1. Verify DNS records point to Vercel
2. Check CAA records allow Let's Encrypt
3. Ensure domain is not redirecting (301/302) before Vercel
4. Remove conflicting CAA records:
   ```bash
   dig quantumpoly.ai CAA +short
   ```
5. Wait 10-15 minutes and check again
6. If persistent, delete domain from Vercel and re-add

---

### Wrong Environment Detected

**Symptoms:**

- Production shows `robots.txt` with `Disallow: /`
- Staging shows `Allow: /`

**Solutions:**

1. Verify environment variables in Vercel
2. Check `VERCEL_ENV` is correctly set:
   - Production: `VERCEL_ENV=production`
   - Preview: `VERCEL_ENV=preview`
3. Rebuild and redeploy:
   ```bash
   vercel --prod
   ```

---

### Redirect Loops

**Symptoms:**

- Browser shows "Too many redirects"
- `curl -I` shows multiple 301/302 redirects

**Solutions:**

1. Check DNS provider's redirect settings
2. Verify only one redirect source:
   - Either DNS redirect OR Vercel redirect, not both
3. Check `next.config.js` redirects configuration
4. Clear browser cache and cookies

---

## Branch-Specific Domain Mapping

Vercel automatically assigns domains to branches:

| Branch       | Domain Pattern                                | Environment |
| ------------ | --------------------------------------------- | ----------- |
| `main`       | `quantumpoly-main-username.vercel.app`        | Preview     |
| `production` | `www.quantumpoly.ai`                          | Production  |
| `feat-*`     | `quantumpoly-feat-branch-username.vercel.app` | Preview     |

**Custom mapping** can be configured in Vercel: **Settings** → **Domains** → **Branch**

---

## Security Considerations

### HSTS Preload

After SSL/TLS is stable (30+ days), consider HSTS preload:

1. Ensure `Strict-Transport-Security` header includes `preload` directive
2. Submit domain to: https://hstspreload.org/
3. Monitor for 90 days before committing

**Header requirement:**

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

### DNSSEC

For enhanced DNS security, enable DNSSEC at your registrar/DNS provider.

**Verification:**

```bash
dig +dnssec quantumpoly.ai
```

---

## CI/CD Integration

### GitHub Secrets Configuration

Required secrets for automated deployments:

| Secret              | Description             | Where to Find                              |
| ------------------- | ----------------------- | ------------------------------------------ |
| `VERCEL_TOKEN`      | Vercel deployment token | Vercel → Settings → Tokens                 |
| `VERCEL_ORG_ID`     | Organization/team ID    | `.vercel/project.json` or Vercel API       |
| `VERCEL_PROJECT_ID` | Project ID              | `.vercel/project.json` or Project Settings |

### Obtaining Vercel Credentials

1. **VERCEL_TOKEN:**
   - Go to: https://vercel.com/account/tokens
   - Create token with scope: **Full Account**
   - Copy token (shown once)

2. **VERCEL_ORG_ID and VERCEL_PROJECT_ID:**

   ```bash
   # Run locally after linking project
   vercel link
   cat .vercel/project.json
   ```

   Output:

   ```json
   {
     "orgId": "team_xxxxxxxxxxxxxxxxx",
     "projectId": "prj_xxxxxxxxxxxxxxxxx"
   }
   ```

3. **Add to GitHub:**
   - Repository → Settings → Secrets and variables → Actions
   - New repository secret for each value

---

## Deployment Workflow Summary

### Pull Request (Preview)

1. PR opened → `.github/workflows/preview.yml` triggers
2. Vercel creates preview deployment
3. Comment posted on PR with preview URL
4. URL pattern: `https://quantumpoly-pr-123-username.vercel.app`

### Merge to Main (Staging)

1. PR merged → `.github/workflows/release.yml` triggers
2. `deploy-staging` job runs
3. Deployed to staging environment
4. URL: Dynamic Vercel staging URL

### Tag + Release (Production)

1. Create tag: `git tag v1.0.0 && git push origin v1.0.0`
2. Create GitHub Release for tag
3. `.github/workflows/release.yml` triggers
4. `validate-release` → `deploy-production` (requires approval) → `update-ledger`
5. Deployed to `https://www.quantumpoly.ai`
6. Governance ledger updated with deployment metadata

---

## Verification Checklist

After deploying to production, verify:

- [ ] DNS resolves: `dig www.quantumpoly.ai`
- [ ] SSL/TLS valid: `curl -I https://www.quantumpoly.ai`
- [ ] Canonical URL correct: View page source
- [ ] `robots.txt` allows crawlers
- [ ] `sitemap.xml` accessible and valid
- [ ] Security headers present: `curl -I`
- [ ] Performance: Run Lighthouse audit
- [ ] Accessibility: Run axe DevTools
- [ ] Smoke test: Critical user paths functional

---

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **DNS Propagation Checker:** https://www.whatsmydns.net/
- **SSL Labs Test:** https://www.ssllabs.com/ssltest/
- **Lighthouse CI:** Built into CI workflow
- **GitHub Actions:** `.github/workflows/`

---

## Maintenance

### Regular Checks

- **Weekly:** Verify SSL certificate expiry (Vercel auto-renews)
- **Monthly:** Review DNS records for accuracy
- **Quarterly:** Audit environment variables
- **Annually:** Review and update this documentation

### SSL Certificate Renewal

Vercel automatically renews Let's Encrypt certificates 30 days before expiry. No action required unless certificate provisioning fails.

**Manual renewal (if needed):**

1. Vercel → Settings → Domains
2. Click **Renew Certificate** next to domain
3. Wait 5-10 minutes for reissuance

---

## Changelog

| Date       | Author         | Changes                                 |
| ---------- | -------------- | --------------------------------------- |
| 2025-10-19 | CASP Architect | Initial DNS configuration documentation |

---

**For questions or issues, refer to:**

- `README.md` - CI/CD Architecture section
- `.github/CICD_REVIEW_CHECKLIST.md` - Deployment validation
- `docs/` - Additional technical documentation
