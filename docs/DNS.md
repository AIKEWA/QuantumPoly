<!-- FILE: docs/DNS.md -->

# DNS Connection & Verification Runbook

**Version:** 1.1  
**Last Updated:** 2025-10-21  
**Audience:** Site Reliability Engineers, DevOps Engineers, Infrastructure Operators  
**Classification:** Operational Runbook  
**Domain Example:** `www.quantumpoly.ai` (with apex `quantumpoly.ai` notes)

---

## Table of Contents

1. [Overview & Prerequisites](#overview--prerequisites)
2. [Connection Procedures](#connection-procedures)
3. [SSL/TLS Verification](#ssltls-verification)
4. [Propagation Checks](#propagation-checks)
5. [Health & Cutover](#health--cutover)
6. [Rollback Procedures](#rollback-procedures)
   - [Audit Trail & Governance](#audit-trail--governance)
7. [Appendix](#appendix)
   - [K. Manual DNS Verification Steps](#k-manual-dns-verification-steps)
   - [L. Rollback Drill Procedure](#l-rollback-drill-procedure)

---

## Overview & Prerequisites

### Purpose

This runbook provides **tactical, copy-pastable procedures** for Site Reliability Engineers to connect custom domains to Vercel, verify SSL/TLS certificates, validate DNS propagation, and execute safe rollbacks. All operations are designed to be audit-friendly and reversible.

### Scope

- **Target Platform:** Vercel (Next.js deployments)
- **Target Domain:** `www.quantumpoly.ai` (subdomain) and `quantumpoly.ai` (apex)
- **DNS Providers:** External DNS (Cloudflare, Route 53, Namecheap, etc.) and Vercel-managed DNS
- **SSL Provider:** Let's Encrypt (automatic via Vercel)

### Prerequisites Checklist

Before proceeding with DNS changes, ensure:

- [ ] **Domain Ownership Verified:** Access to domain registrar account
- [ ] **DNS Provider Access:** Admin/editor permissions for DNS zone
- [ ] **Vercel Project Access:** Admin permissions on target Vercel project
- [ ] **Current DNS State Documented:** Existing A/AAAA/CNAME records recorded
- [ ] **Previous Origin Accessible:** Ability to revert to prior configuration
- [ ] **Maintenance Window Scheduled:** Communicate expected downtime (if any)
- [ ] **Rollback Plan Prepared:** Review [Rollback Procedures](#rollback-procedures)
- [ ] **Monitoring Ready:** Access to DNS monitoring and SSL validation tools

### TTL Guidance

**Time-to-Live (TTL) recommendations for operational phases:**

| Phase                              | TTL Value             | Rationale                                            |
| ---------------------------------- | --------------------- | ---------------------------------------------------- |
| **Pre-Change**                     | 300 seconds (5 min)   | Set 24-48 hours before change for faster propagation |
| **During Change**                  | 300 seconds (5 min)   | Enable rapid rollback if issues detected             |
| **Post-Verification** (24h stable) | 3600 seconds (1 hour) | Reduce DNS query load once stable                    |
| **Production Stable** (7d+)        | 7200-86400 seconds    | Balance caching vs change agility                    |

**Action:** Lower TTL to 300s at least 24 hours before scheduled DNS changes.

### Maintenance Window

**Recommended window characteristics:**

- **Duration:** 2-4 hours for full DNS + SSL propagation
- **Timing:** Off-peak hours (e.g., 02:00-06:00 UTC)
- **Communication:** Notify stakeholders 72 hours in advance
- **Rollback Threshold:** Define acceptable error rate before rollback trigger

---

## Connection Procedures

### Subdomain Configuration (`www.quantumpoly.ai`)

#### Step 1: Add Domain in Vercel

**Via Vercel Dashboard:**

1. Navigate to: **Vercel Dashboard** → **Project** → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `www.quantumpoly.ai`
4. Click **Add**
5. Note the DNS target provided (typically `cname.vercel-dns.com`)

**Via Vercel CLI:**

```bash
vercel domains add www.quantumpoly.ai --token=$VERCEL_TOKEN
```

**Expected Output:**

```
✓ Domain www.quantumpoly.ai added to project
> Verification: Add the following DNS record to your provider:

  Type:  CNAME
  Name:  www
  Value: cname.vercel-dns.com
```

---

#### Step 2: Configure CNAME Record (Recommended)

**Standard CNAME Record:**

| Type  | Name | Value                | TTL |
| ----- | ---- | -------------------- | --- |
| CNAME | www  | cname.vercel-dns.com | 300 |

**Provider-Specific Instructions:**

<details>
<summary><strong>Cloudflare</strong></summary>

```
1. Log in to Cloudflare Dashboard
2. Select domain: quantumpoly.ai
3. Navigate to: DNS → Records
4. Click: Add record

Configuration:
  Type: CNAME
  Name: www
  Target: cname.vercel-dns.com
  Proxy status: DNS only (gray cloud icon) ⚠️ CRITICAL: Must be DNS-only initially
  TTL: Auto (or 300 seconds)

5. Click: Save
```

**⚠️ Important:** Cloudflare proxy (orange cloud) **must be disabled** during initial SSL certificate issuance. Enable after certificate is active.

</details>

<details>
<summary><strong>AWS Route 53</strong></summary>

```bash
# Via AWS CLI
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.quantumpoly.ai",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "cname.vercel-dns.com"}]
      }
    }]
  }'
```

**Via Console:**

```
1. Navigate to: Route 53 → Hosted zones → quantumpoly.ai
2. Click: Create record
3. Configuration:
   - Record name: www
   - Record type: CNAME
   - Value: cname.vercel-dns.com
   - TTL: 300
   - Routing policy: Simple routing
4. Click: Create records
```

</details>

<details>
<summary><strong>Namecheap</strong></summary>

```
1. Log in to Namecheap account
2. Domain List → Manage → Advanced DNS
3. Add New Record

Configuration:
  Type: CNAME Record
  Host: www
  Value: cname.vercel-dns.com.  (note trailing dot)
  TTL: 5 min (300 seconds)

4. Save all changes
```

</details>

<details>
<summary><strong>GoDaddy</strong></summary>

```
1. Log in to GoDaddy account
2. My Products → DNS → Manage Zones
3. Select quantumpoly.ai
4. Add record

Configuration:
  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  TTL: 5 minutes

5. Save
```

</details>

---

### Apex Domain Configuration (`quantumpoly.ai`)

**⚠️ Note:** CNAME records are **not valid** at the DNS apex per RFC 1034. Use one of the following strategies:

#### Option 1: ALIAS/ANAME Record (Provider-Dependent)

**Supported Providers:** Cloudflare (CNAME flattening), Route 53 (ALIAS), DNSimple (ALIAS), NS1 (ALIAS)

**Cloudflare (Automatic CNAME Flattening):**

| Type  | Name | Value                | TTL  | Proxy Status         |
| ----- | ---- | -------------------- | ---- | -------------------- |
| CNAME | @    | cname.vercel-dns.com | Auto | DNS only (initially) |

Cloudflare automatically flattens the CNAME to A records at the apex.

**AWS Route 53 (ALIAS Record):**

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "quantumpoly.ai",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "cname.vercel-dns.com",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

**Note:** Route 53 ALIAS records are **not billed** for DNS queries.

---

#### Option 2: A Record (Static IPs)

**⚠️ Warning:** Vercel IPs may change. Verify current IPs in Vercel dashboard before use.

**Current Vercel IPv4 Addresses (as of 2025-10-21):**

| Type | Name | Value       | TTL |
| ---- | ---- | ----------- | --- |
| A    | @    | 76.76.21.21 | 300 |

**Vercel IPv6 (if supported):**

| Type | Name | Value                   | TTL |
| ---- | ---- | ----------------------- | --- |
| AAAA | @    | 2606:4700:10::6816:1515 | 300 |

**Verification Command:**

```bash
# Check current Vercel IPs
dig cname.vercel-dns.com A +short
dig cname.vercel-dns.com AAAA +short
```

**⚠️ Maintenance Risk:** Static A records require manual updates if Vercel changes IPs. Prefer ALIAS/ANAME if available.

---

#### Option 3: DNS Provider Redirect (301 Permanent)

**Alternative:** Configure apex → `www` redirect at DNS provider level.

**Cloudflare Page Rules:**

```
1. Page Rules → Create Page Rule
2. URL: quantumpoly.ai/*
3. Setting: Forwarding URL (301 Permanent Redirect)
4. Destination: https://www.quantumpoly.ai/$1
5. Save and Deploy
```

**Namecheap URL Redirect:**

```
1. Advanced DNS → URL Redirect Record
2. Host: @
3. Value: https://www.quantumpoly.ai
4. Type: Permanent (301)
5. Save
```

---

#### Option 4: Vercel-Managed DNS (Nameserver Delegation)

**When to use:** Simplest setup; delegates full DNS control to Vercel.

**Procedure:**

1. **Vercel Dashboard** → **Domains** → **www.quantumpoly.ai** → **Use Vercel Nameservers**
2. Note the assigned nameservers (e.g., `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
3. **At Domain Registrar:**
   - Navigate to nameserver settings
   - Replace existing nameservers with Vercel nameservers
   - Save changes

**Example Nameservers (verify in Vercel dashboard):**

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**⚠️ Impact:** All DNS records (MX, TXT, etc.) must be managed via Vercel. Existing email routing requires migration.

**Verification:**

```bash
dig quantumpoly.ai NS +short
# Expected: ns1.vercel-dns.com, ns2.vercel-dns.com
```

---

### External DNS vs Vercel DNS Comparison

| Aspect                | External DNS (CNAME)     | Vercel-Managed DNS (NS Delegation)    |
| --------------------- | ------------------------ | ------------------------------------- |
| **Setup Complexity**  | Low (single CNAME)       | Moderate (NS migration)               |
| **DNS Control**       | Retained at provider     | Transferred to Vercel                 |
| **Email (MX) Impact** | No change                | Requires migration to Vercel DNS      |
| **Apex Domain**       | Requires ALIAS/A record  | Automatic via Vercel                  |
| **Flexibility**       | High (multi-provider)    | Low (Vercel-only)                     |
| **Rollback**          | Immediate (revert CNAME) | Slow (revert NS, 24-48h propagation)  |
| **Recommended For**   | Most use cases           | Greenfield projects, Vercel-exclusive |

**Recommendation:** Use **External DNS with CNAME** for maximum flexibility and fast rollback capability.

---

## SSL/TLS Verification

### Automatic Certificate Issuance (Let's Encrypt)

Vercel automatically provisions SSL/TLS certificates via Let's Encrypt once DNS resolves to Vercel infrastructure.

**Typical Timeline:**

- **DNS Propagation:** 5-30 minutes (TTL-dependent)
- **Certificate Issuance:** 1-10 minutes after DNS resolves
- **Total Expected:** 10-40 minutes from DNS change

**Monitoring Certificate Status:**

**Via Vercel Dashboard:**

1. Navigate to: **Project** → **Settings** → **Domains**
2. Locate domain: `www.quantumpoly.ai`
3. Check status:
   - ✅ **Valid** (green check) = Certificate active
   - ⏳ **Pending** (yellow clock) = Issuance in progress
   - ❌ **Invalid** (red X) = Configuration error

**Via Vercel CLI:**

```bash
vercel domains ls --token=$VERCEL_TOKEN | grep www.quantumpoly.ai
```

**Expected Output:**

```
www.quantumpoly.ai    VERIFIED    Valid    https://www.quantumpoly.ai
```

---

### Manual Certificate Reissue

**When to use:** Certificate status stuck in "Pending" for >15 minutes, or certificate error after DNS change.

**Procedure:**

1. **Verify DNS Resolution:**

```bash
dig www.quantumpoly.ai A +short
# Must return Vercel IP (e.g., 76.76.21.21)
```

2. **Check CAA Records (if configured):**

```bash
dig quantumpoly.ai CAA +short
# Must allow letsencrypt.org or be empty
```

3. **Force Certificate Renewal (Vercel Dashboard):**
   - **Settings** → **Domains** → `www.quantumpoly.ai`
   - Click **Refresh** or **Remove and Re-add Domain**

4. **Wait 5-10 minutes** for reissuance.

5. **Verify Certificate:**

```bash
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -dates -issuer
```

**Expected Output:**

```
notBefore=Oct 21 00:00:00 2025 GMT
notAfter=Jan 19 23:59:59 2026 GMT
issuer=C=US, O=Let's Encrypt, CN=R3
```

---

### TXT Verification Record (If Requested)

**When Required:** Vercel may request domain ownership verification via TXT record for security validation.

**Vercel will provide:**

```
Type: TXT
Name: _vercel
Value: vc-domain-verify=abcdef1234567890abcdef1234567890
```

**Configuration:**

| Type | Name     | Value                                             | TTL |
| ---- | -------- | ------------------------------------------------- | --- |
| TXT  | \_vercel | vc-domain-verify=abcdef1234567890abcdef1234567890 | 300 |

**Verification:**

```bash
dig _vercel.quantumpoly.ai TXT +short
# Expected: "vc-domain-verify=abcdef1234567890abcdef1234567890"
```

**After Verification:**

- Vercel dashboard will show "Verified" status
- TXT record can remain in place (recommended) or be removed

---

### CAA Records Configuration

**Certificate Authority Authorization (CAA)** records restrict which CAs can issue certificates for your domain.

**Recommended Configuration for Let's Encrypt:**

| Type | Name           | Value                         | TTL  |
| ---- | -------------- | ----------------------------- | ---- |
| CAA  | quantumpoly.ai | 0 issue "letsencrypt.org"     | 3600 |
| CAA  | quantumpoly.ai | 0 issuewild "letsencrypt.org" | 3600 |

**Explanation:**

- `0 issue "letsencrypt.org"` = Allow Let's Encrypt to issue certificates for `quantumpoly.ai`
- `0 issuewild "letsencrypt.org"` = Allow Let's Encrypt to issue wildcard certificates for `*.quantumpoly.ai`

**Configuration Examples:**

**Cloudflare:**

```
Type: CAA
Name: @ (or quantumpoly.ai)
Tag: issue
Value: letsencrypt.org
TTL: 1 hour
```

**Route 53:**

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "quantumpoly.ai",
        "Type": "CAA",
        "TTL": 3600,
        "ResourceRecords": [
          {"Value": "0 issue \"letsencrypt.org\""},
          {"Value": "0 issuewild \"letsencrypt.org\""}
        ]
      }
    }]
  }'
```

**Verification:**

```bash
dig quantumpoly.ai CAA +short
# Expected output:
# 0 issue "letsencrypt.org"
# 0 issuewild "letsencrypt.org"
```

**⚠️ Critical:** If CAA records exist but do **not** include `letsencrypt.org`, certificate issuance will **fail**.

---

### CDN Proxy Caveats (Cloudflare Orange-Cloud)

**⚠️ Common Issue:** Cloudflare proxy (orange cloud) interferes with Let's Encrypt HTTP-01 challenge.

**Recommended Workflow:**

1. **Initial Setup:** Set Cloudflare proxy to **DNS only** (gray cloud)
2. **Add Domain to Vercel:** Complete DNS configuration
3. **Wait for SSL Certificate:** Verify "Valid" status in Vercel (10-15 minutes)
4. **Enable Proxy (Optional):** Switch to orange cloud **only if needed**

**⚠️ Warning:** Enabling Cloudflare proxy on top of Vercel creates **double-proxy** configuration:

- Request → Cloudflare Edge → Vercel Edge → Origin
- May cause SSL mismatch, redirect loops, or performance degradation

**Recommendation:** Use **gray cloud (DNS only)** for Vercel deployments. Vercel Edge Network provides CDN functionality.

**Verification (Proxy Disabled):**

```bash
dig www.quantumpoly.ai A +short
# Should return Vercel IPs directly, not Cloudflare proxy IPs (104.x.x.x range)
```

---

### SSL Troubleshooting Matrix

| Symptom                              | Probable Cause                          | Fix                                       |
| ------------------------------------ | --------------------------------------- | ----------------------------------------- |
| Certificate status "Pending" >15 min | DNS not resolving to Vercel             | Verify CNAME/A record, check propagation  |
| Certificate status "Invalid"         | CAA block or DNS mismatch               | Check CAA records, verify DNS target      |
| Browser shows "Not Secure"           | Certificate not issued                  | Wait 10 min, force reissue, check DNS     |
| SSL Labs shows wrong issuer          | Using wrong certificate                 | Remove and re-add domain in Vercel        |
| HTTP-01 challenge fails              | Cloudflare proxy enabled (orange cloud) | Disable proxy during cert issuance        |
| Certificate expired                  | Auto-renewal failed                     | Check Vercel status page, contact support |

---

## Propagation Checks

### DNS Resolution Verification

**Objective:** Confirm DNS changes have propagated globally and resolve to Vercel infrastructure.

---

#### Check 1: Local Resolver (dig)

```bash
# CNAME resolution (subdomain)
dig www.quantumpoly.ai CNAME +short
```

**Expected Output:**

```
cname.vercel-dns.com.
```

**Pass Criteria:** ✅ Returns `cname.vercel-dns.com` or Vercel IP addresses

**Fail Criteria:** ❌ Returns previous origin, NXDOMAIN, or empty response

---

```bash
# A record resolution (final IP)
dig www.quantumpoly.ai A +short
```

**Expected Output:**

```
76.76.21.21
```

**Pass Criteria:** ✅ Returns Vercel IP address (76.76.21.x range)

**Fail Criteria:** ❌ Returns non-Vercel IP or empty response

---

#### Check 2: Public Resolvers (Regional Diversity)

**Cloudflare DNS (1.1.1.1):**

```bash
dig @1.1.1.1 www.quantumpoly.ai A +short
```

**Google DNS (8.8.8.8):**

```bash
dig @8.8.8.8 www.quantumpoly.ai A +short
```

**Quad9 DNS (9.9.9.9):**

```bash
dig @9.9.9.9 www.quantumpoly.ai A +short
```

**Cisco OpenDNS (208.67.222.222):**

```bash
dig @208.67.222.222 www.quantumpoly.ai A +short
```

**Pass Criteria:** ✅ All resolvers return **same Vercel IP**

**Fail Criteria:** ❌ Inconsistent results across resolvers (indicates incomplete propagation)

---

#### Check 3: Authoritative Nameserver

**Identify Authoritative NS:**

```bash
dig quantumpoly.ai NS +short
```

**Query Authoritative NS Directly:**

```bash
# Replace ns1.example.com with actual authoritative nameserver
dig @ns1.example.com www.quantumpoly.ai A +short
```

**Pass Criteria:** ✅ Authoritative NS returns correct CNAME/A record

**Fail Criteria:** ❌ Authoritative NS shows old records (DNS provider update delay)

---

#### Check 4: nslookup (Alternative)

**macOS/Linux:**

```bash
nslookup www.quantumpoly.ai
```

**Expected Output:**

```
Server:		1.1.1.1
Address:	1.1.1.1#53

Non-authoritative answer:
www.quantumpoly.ai	canonical name = cname.vercel-dns.com.
Name:	cname.vercel-dns.com
Address: 76.76.21.21
```

**Windows (PowerShell):**

```powershell
Resolve-DnsName www.quantumpoly.ai
```

**Expected Output:**

```
Name                           Type   TTL   Section    NameHost
----                           ----   ---   -------    --------
www.quantumpoly.ai             CNAME  300   Answer     cname.vercel-dns.com

Name       : cname.vercel-dns.com
QueryType  : A
TTL        : 300
Section    : Answer
IP4Address : 76.76.21.21
```

---

### Propagation Success Criteria Table

| Check                   | Command                                             | Expected Result           | PASS/FAIL |
| ----------------------- | --------------------------------------------------- | ------------------------- | --------- |
| **CNAME Resolution**    | `dig www.quantumpoly.ai CNAME +short`               | `cname.vercel-dns.com.`   | ✅ PASS   |
| **A Record Resolution** | `dig www.quantumpoly.ai A +short`                   | `76.76.21.21` (Vercel IP) | ✅ PASS   |
| **Cloudflare DNS**      | `dig @1.1.1.1 www.quantumpoly.ai A +short`          | `76.76.21.21`             | ✅ PASS   |
| **Google DNS**          | `dig @8.8.8.8 www.quantumpoly.ai A +short`          | `76.76.21.21`             | ✅ PASS   |
| **Authoritative NS**    | `dig @ns1.provider.com www.quantumpoly.ai A +short` | `76.76.21.21`             | ✅ PASS   |
| **Reverse Consistency** | All resolvers return same IP                        | Match across all          | ✅ PASS   |

**Overall Propagation Status:**

- **✅ Complete:** All checks return Vercel IP consistently
- **⚠️ Partial:** Some resolvers show old IP (wait for full propagation)
- **❌ Failed:** No resolvers show Vercel IP (check DNS configuration)

---

### Global Propagation Tools (Web-Based)

**Recommended Tools:**

1. **WhatsMyDNS:** https://www.whatsmydns.net/#A/www.quantumpoly.ai
   - Shows propagation across 20+ global locations
   - Expected: All locations show Vercel IP (green checkmarks)

2. **DNS Checker:** https://dnschecker.org/#A/www.quantumpoly.ai
   - Regional DNS propagation status
   - Expected: Global green status within 1 hour

3. **Google Public DNS Cache Flush:** https://dns.google/cache
   - Query: `www.quantumpoly.ai`
   - Clear Google DNS cache if needed

---

### HTTP/HTTPS Connectivity Checks

**HTTP Redirect Test (HTTP → HTTPS):**

```bash
curl -I http://www.quantumpoly.ai
```

**Expected Output:**

```
HTTP/1.1 308 Permanent Redirect
Location: https://www.quantumpoly.ai/
```

**Pass Criteria:** ✅ Returns 301/308 redirect to HTTPS

---

**HTTPS Response Test:**

```bash
curl -I https://www.quantumpoly.ai
```

**Expected Output:**

```
HTTP/2 200
server: Vercel
strict-transport-security: max-age=63072000
x-vercel-id: sfo1::xxxxx-1234567890
```

**Pass Criteria:** ✅ Returns HTTP 200, includes `server: Vercel` header

---

**SSL Certificate Verification:**

```bash
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

**Expected Output:**

```
subject=CN=www.quantumpoly.ai
issuer=C=US, O=Let's Encrypt, CN=R3
notBefore=Oct 21 00:00:00 2025 GMT
notAfter=Jan 19 23:59:59 2026 GMT
```

**Pass Criteria:** ✅ Subject matches domain, issuer is Let's Encrypt, dates are valid

---

### Propagation Timeline Expectations

| Timeframe         | Expected Status          | Action                    |
| ----------------- | ------------------------ | ------------------------- |
| **0-5 minutes**   | Authoritative NS updated | Verify at DNS provider    |
| **5-30 minutes**  | TTL-based propagation    | Check public resolvers    |
| **30-60 minutes** | Global propagation ~80%  | Monitor web-based tools   |
| **1-2 hours**     | Global propagation ~95%  | Verify regional resolvers |
| **24-48 hours**   | Global propagation 100%  | Final verification        |

**⚠️ Note:** Low TTL (300s) accelerates propagation. Higher TTL may delay up to TTL value + propagation time.

---

## Health & Cutover

### Pre-Cutover Validation

**Before declaring DNS migration complete, validate:**

#### 1. Smoke Tests (Critical Paths)

**Homepage Load:**

```bash
curl -sS https://www.quantumpoly.ai | grep -o '<title>.*</title>'
```

**Expected Output:**

```
<title>QuantumPoly - Home</title>
```

**Pass Criteria:** ✅ Returns expected title (not error page)

---

**API Endpoint (if applicable):**

```bash
curl -sS https://www.quantumpoly.ai/api/health | jq .
```

**Expected Output:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-21T12:00:00Z"
}
```

**Pass Criteria:** ✅ Returns valid JSON with `status: ok`

---

**Static Assets (CDN):**

```bash
curl -I https://www.quantumpoly.ai/_next/static/css/app.css
```

**Expected Output:**

```
HTTP/2 200
cache-control: public, max-age=31536000, immutable
```

**Pass Criteria:** ✅ Returns 200, includes cache headers

---

#### 2. HSTS Header Validation

**Check Strict-Transport-Security:**

```bash
curl -sI https://www.quantumpoly.ai | grep -i strict-transport-security
```

**Expected Output:**

```
strict-transport-security: max-age=63072000; includeSubDomains
```

**Pass Criteria:** ✅ HSTS header present with `max-age >= 31536000` (1 year)

**⚠️ Warning:** HSTS locks browsers to HTTPS for `max-age` duration. Ensure SSL is stable before enabling.

**HSTS Preload (Optional, Future):**

- After 30+ days of stable HSTS, submit to: https://hstspreload.org/
- Requires: `max-age=63072000; includeSubDomains; preload`

---

#### 3. Security Headers Check

**Full Headers Inspection:**

```bash
curl -sI https://www.quantumpoly.ai
```

**Expected Headers:**

```
strict-transport-security: max-age=63072000
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
content-security-policy: default-src 'self'; ...
```

**Pass Criteria:** ✅ All security headers present

**Tool:** https://securityheaders.com/?q=https://www.quantumpoly.ai (Expected: A grade)

---

### Cache & TTL Backoff Strategy

**Objective:** Enable fast rollback by maintaining low TTL initially, then gradually increase after stability.

**Recommended Schedule:**

| Phase                 | Duration      | TTL            | Rollback Window |
| --------------------- | ------------- | -------------- | --------------- |
| **Initial Cutover**   | First 4 hours | 300s (5 min)   | 5-10 minutes    |
| **Monitoring Phase**  | 4-24 hours    | 600s (10 min)  | 10-20 minutes   |
| **Stability Phase**   | 1-7 days      | 1800s (30 min) | 30-60 minutes   |
| **Mature Phase**      | 7+ days       | 3600s (1 hour) | 1-2 hours       |
| **Production Stable** | 30+ days      | 7200-86400s    | 2-24 hours      |

**Manual TTL Update:**

```bash
# Update CNAME record TTL at DNS provider
# Example: Cloudflare API
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"ttl":3600}'
```

---

### Canary Deployment via Vercel Preview

**Strategy:** Test changes on production infrastructure with limited user exposure.

**Procedure:**

1. **Deploy to Production (without primary alias):**

```bash
vercel deploy --prod --token=$VERCEL_TOKEN
# Output: https://quantumpoly-abc123.vercel.app
```

2. **Create Canary Alias (subdomain):**

```bash
vercel alias set quantumpoly-abc123.vercel.app canary.quantumpoly.ai --token=$VERCEL_TOKEN
```

**DNS Requirement:**

| Type  | Name   | Value                | TTL |
| ----- | ------ | -------------------- | --- |
| CNAME | canary | cname.vercel-dns.com | 300 |

3. **Share Canary URL with beta users:**
   - Internal team: https://canary.quantumpoly.ai
   - Selected customers via email/Slack

4. **Monitor Metrics (24-48 hours):**
   - Error rate: <0.1% target
   - Latency: <500ms p95
   - User feedback: No critical issues

5. **Promote to Primary Domain:**

```bash
vercel alias set quantumpoly-abc123.vercel.app www.quantumpoly.ai --token=$VERCEL_TOKEN
```

6. **Rollback (if issues detected):**

```bash
# Revert to previous deployment
vercel alias set quantumpoly-xyz789.vercel.app www.quantumpoly.ai --token=$VERCEL_TOKEN
```

**Advantages:**

- Real production data
- Limited blast radius (only canary users affected)
- Fast rollback (Vercel alias switch, ~30 seconds)

---

### Go/No-Go Checklist

**Before declaring cutover complete:**

- [ ] DNS resolves to Vercel on all public resolvers
- [ ] SSL certificate valid and issued by Let's Encrypt
- [ ] Homepage returns HTTP 200 with expected content
- [ ] API endpoints functional (if applicable)
- [ ] Security headers present (HSTS, CSP, X-Frame-Options)
- [ ] Static assets load with cache headers
- [ ] Error rate <0.1% (monitor for 1 hour)
- [ ] Latency within acceptable range (p95 <1s)
- [ ] No critical user-reported issues
- [ ] Rollback procedure tested and documented
- [ ] Stakeholders notified of successful cutover

**⚠️ Production Release Checklist:**

For production releases (tagged versions), also complete the [Release Review Checklist](/docs/review-checklist.md) which includes:

- Stage C (Post-Deployment) verification
- Governance ledger updates
- Sign-off matrix requirements
- Audit gate validation

The release checklist is automatically validated in the CI/CD pipeline before production deployment.

**Decision Matrix:**

| Condition                               | Action                                                 |
| --------------------------------------- | ------------------------------------------------------ |
| All checks ✅ PASS                      | **GO** - Proceed with production traffic               |
| 1-2 non-critical checks ⚠️ WARN         | **CONDITIONAL GO** - Monitor closely, prepare rollback |
| ≥3 checks ❌ FAIL or 1 critical ❌ FAIL | **NO-GO** - Execute rollback immediately               |

---

## Rollback Procedures

**⚠️ Critical:** Test rollback procedures in staging **before** production cutover.

---

### Rollback Option 1: Revert DNS to Previous Origin

**Use Case:** Complete DNS rollback to prior hosting provider or configuration.

**Prerequisites:**

- [ ] Previous DNS records documented (A/AAAA/CNAME)
- [ ] Previous origin accessible and operational
- [ ] Access to DNS provider admin panel

**Procedure:**

#### Step 1: Identify Previous Configuration

**From Documentation (Pre-Change Record):**

```
Previous Configuration:
  Type: CNAME
  Name: www
  Value: old-cdn.example.com
  TTL: 3600
```

**Or Query DNS History (if available):**

```bash
# Some providers offer DNS history in admin panel
# Example: Cloudflare → DNS → www record → "Recent changes"
```

---

#### Step 2: Update DNS Records

**Cloudflare:**

```
1. DNS → Records → www (click Edit)
2. Change:
   - Target: cname.vercel-dns.com → old-cdn.example.com
   - TTL: 300 (low for fast propagation)
3. Save
```

**Route 53:**

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.quantumpoly.ai",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "old-cdn.example.com"}]
      }
    }]
  }'
```

---

#### Step 3: Verify Rollback Propagation

```bash
# Check DNS resolves to previous origin
dig www.quantumpoly.ai CNAME +short
# Expected: old-cdn.example.com

dig www.quantumpoly.ai A +short
# Expected: Previous origin IP (not Vercel IP)
```

**Timeline:**

- **Immediate:** Authoritative NS updated (0-2 minutes)
- **Fast Propagation:** Most resolvers updated (5-15 minutes with TTL 300)
- **Full Propagation:** Global rollback complete (30-60 minutes)

---

#### Step 4: Verify Application Accessibility

```bash
curl -I https://www.quantumpoly.ai
# Expected: HTTP 200 from previous origin
```

---

#### Step 5: Remove Domain from Vercel

```bash
vercel domains rm www.quantumpoly.ai --token=$VERCEL_TOKEN
```

**Or via Dashboard:**

- **Settings** → **Domains** → `www.quantumpoly.ai` → **Remove**

---

**Rollback Completion Checklist:**

- [ ] DNS resolves to previous origin (verified via dig)
- [ ] Website accessible at https://www.quantumpoly.ai
- [ ] SSL certificate valid (previous origin cert)
- [ ] Error rate returned to baseline
- [ ] Stakeholders notified of rollback
- [ ] Post-mortem scheduled to analyze failure

**Estimated Rollback Time:** 10-20 minutes (with TTL 300)

---

### Rollback Option 2: Disable CDN Proxy, Restore Previous Certificate

**Use Case:** Cloudflare-specific rollback for SSL/proxy issues.

**Scenario:** Cloudflare proxy (orange cloud) causing SSL mismatch or redirect loops with Vercel.

**Procedure:**

#### Step 1: Disable Cloudflare Proxy

```
Cloudflare Dashboard:
1. DNS → Records → www
2. Click orange cloud icon (Proxied)
3. Switch to gray cloud (DNS only)
4. Save
```

**CLI Alternative:**

```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"proxied":false}'
```

---

#### Step 2: Verify Direct DNS Resolution

```bash
dig www.quantumpoly.ai A +short
# Expected: Vercel IP (76.76.21.21), NOT Cloudflare proxy IP (104.x.x.x)
```

---

#### Step 3: Clear Cloudflare Cache

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**Or via Dashboard:**

- **Caching** → **Configuration** → **Purge Everything**

---

#### Step 4: Force Vercel SSL Reissue

```bash
# Remove and re-add domain to trigger fresh certificate
vercel domains rm www.quantumpoly.ai --token=$VERCEL_TOKEN
vercel domains add www.quantumpoly.ai --token=$VERCEL_TOKEN
```

**Wait 5-10 minutes for certificate issuance.**

---

#### Step 5: Verify SSL Certificate

```bash
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -issuer
# Expected: issuer=C=US, O=Let's Encrypt, CN=R3
```

---

**Rollback Completion Checklist:**

- [ ] Cloudflare proxy disabled (gray cloud)
- [ ] DNS resolves directly to Vercel IP
- [ ] Cloudflare cache cleared
- [ ] Vercel SSL certificate valid (Let's Encrypt)
- [ ] Website accessible via HTTPS
- [ ] No redirect loops or SSL errors

**Estimated Rollback Time:** 10-15 minutes

---

### Rollback Option 3: Temporary Maintenance Page with Low-TTL Toggle

**Use Case:** Graceful degradation during critical issues; buy time to diagnose/fix.

**Strategy:** Point DNS to static maintenance page with very low TTL (60s) for fast recovery.

**Prerequisites:**

- [ ] Maintenance page hosted on reliable CDN (e.g., S3 + CloudFront, Netlify, GitHub Pages)
- [ ] Maintenance page URL: `https://maintenance.example.com` or static IP

**Procedure:**

#### Step 1: Deploy Maintenance Page

**Example Static HTML (hosted on S3 + CloudFront):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuantumPoly - Scheduled Maintenance</title>
    <meta http-equiv="refresh" content="60" />
    <!-- Auto-refresh every 60s -->
    <style>
      body {
        font-family: sans-serif;
        text-align: center;
        padding: 50px;
      }
      h1 {
        color: #333;
      }
    </style>
  </head>
  <body>
    <h1>Scheduled Maintenance</h1>
    <p>QuantumPoly is currently undergoing scheduled maintenance.</p>
    <p>We'll be back shortly. Thank you for your patience.</p>
    <p>
      <small
        >Status updates: <a href="https://status.quantumpoly.ai">status.quantumpoly.ai</a></small
      >
    </p>
  </body>
</html>
```

**Host on S3:**

```bash
aws s3 cp maintenance.html s3://quantumpoly-maintenance/index.html --acl public-read
aws s3 website s3://quantumpoly-maintenance --index-document index.html
```

**CloudFront Distribution:**

```
Origin: quantumpoly-maintenance.s3-website-us-east-1.amazonaws.com
CNAME: maintenance.quantumpoly.ai
SSL: CloudFront default certificate
```

---

#### Step 2: Update DNS to Maintenance Page

**CNAME to Maintenance:**

| Type  | Name | Value                      | TTL |
| ----- | ---- | -------------------------- | --- |
| CNAME | www  | maintenance.quantumpoly.ai | 60  |

**Or A Record to Static IP:**

| Type | Name | Value       | TTL |
| ---- | ---- | ----------- | --- |
| A    | www  | 192.0.2.100 | 60  |

**⚠️ Critical:** Set TTL to **60 seconds** for fast recovery.

---

#### Step 3: Verify Maintenance Page

```bash
curl -sS https://www.quantumpoly.ai | grep -o '<title>.*</title>'
# Expected: <title>QuantumPoly - Scheduled Maintenance</title>
```

---

#### Step 4: Diagnose/Fix Underlying Issue

**While maintenance page is active:**

- Analyze logs, error rates, SSL issues
- Deploy fix to Vercel staging environment
- Validate fix on canary URL

---

#### Step 5: Restore Production DNS

**Revert to Vercel:**

| Type  | Name | Value                | TTL |
| ----- | ---- | -------------------- | --- |
| CNAME | www  | cname.vercel-dns.com | 300 |

**Fast Propagation Due to Low TTL (60s):**

- Most resolvers update within 2-5 minutes
- Clients auto-refresh (60s meta refresh in maintenance HTML)

---

#### Step 6: Verify Restoration

```bash
dig www.quantumpoly.ai CNAME +short
# Expected: cname.vercel-dns.com

curl -I https://www.quantumpoly.ai
# Expected: HTTP 200 from Vercel
```

---

**Rollback Completion Checklist:**

- [ ] Maintenance page displayed to users (verified)
- [ ] Underlying issue diagnosed and fixed
- [ ] Fix validated on staging/canary
- [ ] DNS restored to Vercel (CNAME updated)
- [ ] Production site accessible (HTTP 200)
- [ ] Maintenance page DNS record updated to high TTL (3600) for future use
- [ ] Post-incident review scheduled

**Estimated Rollback Time:** 2-5 minutes (DNS), + fix duration

---

### Post-Rollback Verification

**After any rollback, verify:**

1. **DNS Resolution:**

```bash
dig www.quantumpoly.ai A +short
# Expected: IP matches rollback target (not Vercel)
```

2. **Application Accessibility:**

```bash
curl -I https://www.quantumpoly.ai
# Expected: HTTP 200 from rolled-back origin
```

3. **SSL Certificate Validity:**

```bash
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -subject -issuer
# Expected: Valid certificate (may be from previous CA if rolled back)
```

4. **Error Rate Baseline:**
   - Monitor application logs for 30 minutes
   - Verify error rate returned to pre-cutover baseline

5. **User Impact Assessment:**
   - Check support tickets for DNS/SSL-related issues
   - Monitor social media for user-reported problems

6. **Stakeholder Communication:**
   - Notify team of rollback completion
   - Schedule post-mortem within 24-48 hours

---

### Audit Trail & Governance

**Purpose:** Maintain compliance and accountability for all production DNS changes through the governance ledger system.

#### Governance Ledger Integration

All production DNS changes **must** be documented in the QuantumPoly governance ledger for audit trail and compliance purposes.

**Ledger Location:** [Governance Ledger – Block 6](../../governance/ledger/README.md)

**When to Create Ledger Entry:**

- ✅ **Before** production DNS change (planned change entry)
- ✅ **After** successful DNS change (completion entry)
- ✅ **After** rollback execution (incident entry)

**⚠️ For Production Releases:**

DNS changes as part of production releases are tracked through the [Release Review Checklist](/docs/review-checklist.md). The checklist automatically:

- Validates DNS verification steps (Stage C, items 1-2)
- Synchronizes sign-off matrix to governance ledger
- Creates immutable audit trail at `/governance/ledger/releases/`
- Enforces compliance requirements via CI/CD automation

See: [scripts/audit-sync-ledger.sh](/scripts/audit-sync-ledger.sh) for automation details.

---

#### Required Ledger Entry Template

**For Planned DNS Changes:**

```json
{
  "id": "2025-10-22-dns-001",
  "timestamp": "2025-10-22T02:00:00Z",
  "type": "dns_change",
  "action": "planned",
  "domain": "www.quantumpoly.ai",
  "change": {
    "record_type": "CNAME",
    "from": "old-cdn.example.com",
    "to": "cname.vercel-dns.com",
    "ttl": 300
  },
  "approver": "alice.johnson@quantumpoly.ai",
  "operator": "jane.doe@quantumpoly.ai",
  "maintenance_window": {
    "start": "2025-10-22T02:00:00Z",
    "end": "2025-10-22T06:00:00Z"
  },
  "rollback_plan": "docs/DNS.md#rollback-option-1",
  "stakeholders_notified": true,
  "pre_change_baseline": "docs/baselines/2025-10-21-dns-baseline.md"
}
```

**For Successful Completion:**

```json
{
  "id": "2025-10-22-dns-002",
  "timestamp": "2025-10-22T03:45:00Z",
  "type": "dns_change",
  "action": "completed",
  "domain": "www.quantumpoly.ai",
  "propagation_time": "18 minutes",
  "ssl_status": "valid",
  "verification": {
    "dns_propagated": true,
    "ssl_certificate": "Let's Encrypt",
    "application_status": "HTTP 200",
    "error_rate": "0.02%"
  },
  "related_entry": "2025-10-22-dns-001"
}
```

**For Rollback (Incident):**

```json
{
  "id": "2025-10-22-dns-003",
  "timestamp": "2025-10-22T04:15:00Z",
  "type": "dns_change",
  "action": "rollback",
  "domain": "www.quantumpoly.ai",
  "reason": "High error rate detected (>2%)",
  "rollback_method": "Rollback Option 1: DNS Revert",
  "rollback_duration": "12 minutes",
  "recovery": {
    "dns_reverted": true,
    "application_status": "HTTP 200",
    "error_rate_baseline": "0.05%"
  },
  "post_mortem_scheduled": "2025-10-23T14:00:00Z",
  "related_entry": "2025-10-22-dns-001"
}
```

---

#### Ledger Entry Procedure

**Step 1: Access Governance Ledger**

```bash
# Navigate to governance directory
cd governance/ledger/

# Open ledger file (append-only)
vim ledger.jsonl
```

**Step 2: Append Entry (Manual)**

```bash
# Create entry JSON
cat > /tmp/dns-change-entry.json << 'EOF'
{
  "id": "2025-10-22-dns-001",
  "timestamp": "2025-10-22T02:00:00Z",
  ...
}
EOF

# Append to ledger (newline-delimited JSON)
cat /tmp/dns-change-entry.json >> governance/ledger/ledger.jsonl
echo "" >> governance/ledger/ledger.jsonl
```

**Step 3: Commit to Version Control**

```bash
git add governance/ledger/ledger.jsonl
git commit -m "chore(governance): DNS change ledger entry for www.quantumpoly.ai migration to Vercel"
git push origin main
```

**⚠️ Note:** Ledger is append-only. **Never** modify existing entries. Add correction entries if needed.

---

#### Automated Ledger Integration (CI/CD)

**For CI/CD-triggered DNS changes:**

Governance ledger updates can be automated via the `update-ledger` job in `.github/workflows/release.yml`.

**Example CI Integration:**

```yaml
- name: Update governance ledger (DNS change)
  run: |
    LEDGER_ENTRY=$(cat <<EOF
    {
      "id": "$(date +%Y-%m-%d)-dns-$(git rev-parse --short HEAD)",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "type": "dns_change",
      "action": "automated",
      "domain": "www.quantumpoly.ai",
      "deployment": "${{ github.sha }}",
      "vercel_url": "${{ steps.deploy.outputs.url }}"
    }
    EOF
    )

    echo "$LEDGER_ENTRY" >> governance/ledger/ledger.jsonl
    echo "" >> governance/ledger/ledger.jsonl
```

---

#### Compliance Requirements

**Regulatory Alignment:**

| Framework          | Requirement                            | Ledger Compliance                      |
| ------------------ | -------------------------------------- | -------------------------------------- |
| **GDPR (EU)**      | Right to access audit logs             | ✅ Ledger publicly accessible (no PII) |
| **ISO 27001**      | Change management documentation        | ✅ All changes logged with approver    |
| **SOC 2 Type II**  | Audit trail for infrastructure changes | ✅ Immutable append-only ledger        |
| **EU AI Act 2024** | Transparency and record-keeping        | ✅ Cryptographically signed entries    |

---

#### Audit Query Examples

**Find All DNS Changes:**

```bash
cat governance/ledger/ledger.jsonl | jq 'select(.type == "dns_change")'
```

**Find Rollback Events:**

```bash
cat governance/ledger/ledger.jsonl | jq 'select(.action == "rollback")'
```

**Find Changes by Operator:**

```bash
cat governance/ledger/ledger.jsonl | jq 'select(.operator == "jane.doe@quantumpoly.ai")'
```

**Generate Audit Report (Last 30 Days):**

```bash
cat governance/ledger/ledger.jsonl | jq -r 'select(.timestamp >= "'$(date -u -d '30 days ago' +%Y-%m-%d)'") | "\(.timestamp) | \(.type) | \(.action) | \(.domain)"'
```

---

#### Post-Mortem Integration

**After Rollback or Incident:**

1. **Create Post-Mortem Document:**
   - Location: `docs/postmortems/2025-10-22-dns-rollback.md`
   - Include: Timeline, root cause, remediation, action items

2. **Link Post-Mortem to Ledger Entry:**

```json
{
  "id": "2025-10-22-dns-004",
  "timestamp": "2025-10-23T16:00:00Z",
  "type": "post_mortem",
  "action": "published",
  "related_incident": "2025-10-22-dns-003",
  "post_mortem_url": "docs/postmortems/2025-10-22-dns-rollback.md",
  "action_items": [
    "Update SSL verification procedure",
    "Add pre-flight CAA check to runbook",
    "Schedule quarterly rollback drill"
  ]
}
```

3. **Distribute to Stakeholders:**
   - Engineering team
   - SRE leadership
   - Compliance officer

---

## Appendix

### A. Sample DNS Values Table

**Complete Configuration for `www.quantumpoly.ai` on Vercel:**

| Record Type | Name     | Value                         | TTL  | Purpose                                 |
| ----------- | -------- | ----------------------------- | ---- | --------------------------------------- |
| CNAME       | www      | cname.vercel-dns.com          | 300  | Primary domain routing to Vercel        |
| A           | @        | 76.76.21.21                   | 300  | Apex domain (if ALIAS unavailable)      |
| CAA         | @        | 0 issue "letsencrypt.org"     | 3600 | Restrict SSL issuance to Let's Encrypt  |
| CAA         | @        | 0 issuewild "letsencrypt.org" | 3600 | Allow wildcard certs from Let's Encrypt |
| TXT         | \_vercel | vc-domain-verify=abc123...    | 300  | Domain ownership verification           |
| CNAME       | staging  | cname.vercel-dns.com          | 300  | Staging environment (optional)          |
| CNAME       | canary   | cname.vercel-dns.com          | 300  | Canary deployment (optional)            |

**Notes:**

- Replace `abc123...` with actual verification token from Vercel
- Verify Vercel IPs (76.76.21.21) in dashboard before using A records
- TTL 300 recommended during changes, increase to 3600 after stability

---

### B. Glossary

| Term                  | Definition                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **A Record**          | Address record mapping hostname to IPv4 address                                               |
| **AAAA Record**       | Address record mapping hostname to IPv6 address                                               |
| **ALIAS Record**      | Non-standard DNS record type (Route 53, DNSimple) allowing CNAME-like behavior at apex domain |
| **ANAME Record**      | Synonym for ALIAS; flattens CNAME to A record at query time                                   |
| **Apex Domain**       | Root/naked domain without subdomain (e.g., `quantumpoly.ai`)                                  |
| **CAA Record**        | Certificate Authority Authorization; restricts which CAs can issue certificates               |
| **CNAME Flattening**  | Process of resolving CNAME to A record at authoritative nameserver (Cloudflare, NS1)          |
| **CNAME Record**      | Canonical name record; alias pointing to another domain                                       |
| **DNS Propagation**   | Time required for DNS changes to spread across global resolver network                        |
| **DNSSEC**            | DNS Security Extensions; cryptographic signatures for DNS data integrity                      |
| **HTTP-01 Challenge** | Let's Encrypt validation method via HTTP request to domain                                    |
| **HSTS**              | HTTP Strict Transport Security; forces browsers to use HTTPS                                  |
| **Let's Encrypt**     | Free, automated certificate authority providing SSL/TLS certificates                          |
| **NS Record**         | Nameserver record; delegates DNS zone to authoritative nameservers                            |
| **Split-Horizon DNS** | Different DNS responses for internal vs external queries                                      |
| **TTL**               | Time-to-Live; duration (seconds) DNS resolvers cache a record                                 |
| **TXT Record**        | Text record for arbitrary data (verification, SPF, DKIM, etc.)                                |

---

### C. Troubleshooting Matrix

| Issue                                       | Symptoms                                         | Diagnosis                                             | Resolution                                                               |
| ------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| **DNSSEC Validation Failure**               | `SERVFAIL` response from resolvers               | `dig +dnssec quantumpoly.ai` shows broken chain       | Update DS records at registrar, or disable DNSSEC temporarily            |
| **CAA Record Blocks Let's Encrypt**         | Certificate status "Invalid" in Vercel           | `dig quantumpoly.ai CAA +short` shows restrictive CAA | Add CAA record: `0 issue "letsencrypt.org"`                              |
| **Stale DNS Cache**                         | Changes not visible after TTL expiration         | Query authoritative NS directly                       | Clear local cache: `sudo dscacheutil -flushcache`, use `@8.8.8.8` in dig |
| **Split-Horizon DNS Mismatch**              | Internal resolvers show different IP than public | Query from external network                           | Ensure external DNS zone matches internal zone for public domain         |
| **Cloudflare Proxy (Orange Cloud) Enabled** | SSL errors, redirect loops                       | `dig` returns Cloudflare IP (104.x.x.x)               | Disable proxy (gray cloud) during cert issuance                          |
| **Wildcard CNAME Conflict**                 | Unexpected resolution for subdomains             | `dig random.quantumpoly.ai` resolves unexpectedly     | Remove wildcard CNAME `*` or use explicit subdomains                     |
| **DNSSEC Key Rollover in Progress**         | Intermittent `SERVFAIL` errors                   | Check DNSSEC DS records at registrar                  | Wait for rollover completion (24-48h) or temporarily disable DNSSEC      |
| **Vercel IP Change**                        | Static A record points to old Vercel IP          | `dig cname.vercel-dns.com A +short` shows new IP      | Update A record to current Vercel IP, or switch to CNAME                 |
| **DNS Provider API Rate Limit**             | Automated updates fail                           | Provider error logs                                   | Implement exponential backoff, reduce update frequency                   |

---

### D. Go/No-Go Checklist (Pre-Cutover)

**Review before production DNS change:**

**Infrastructure:**

- [ ] Vercel project deployed and tested on preview URL
- [ ] SSL certificate provisioning tested on staging domain
- [ ] Environment variables configured for production
- [ ] Custom domain added to Vercel project
- [ ] DNS provider access confirmed (admin permissions)

**DNS Configuration:**

- [ ] Current DNS records documented (A/AAAA/CNAME)
- [ ] New CNAME record prepared: `www → cname.vercel-dns.com`
- [ ] CAA records reviewed (allow Let's Encrypt)
- [ ] TTL lowered to 300 seconds (24+ hours prior)
- [ ] Cloudflare proxy disabled (if applicable)

**Validation:**

- [ ] Preview URL tested and functional
- [ ] Smoke tests prepared (homepage, API, static assets)
- [ ] SSL verification commands tested
- [ ] Propagation check commands prepared

**Operational Readiness:**

- [ ] Maintenance window scheduled and communicated
- [ ] Rollback procedure documented and tested
- [ ] On-call engineer assigned
- [ ] Monitoring dashboards ready
- [ ] Incident communication plan prepared
- [ ] Stakeholders notified (72h advance notice)

**Decision:**

- [ ] **GO** - All checks passed, proceed with cutover
- [ ] **NO-GO** - Outstanding issues, defer to next maintenance window

---

### E. Post-Change Verification Checklist

**Execute after DNS change (within 1 hour):**

**DNS Propagation:**

- [ ] `dig www.quantumpoly.ai CNAME +short` returns `cname.vercel-dns.com`
- [ ] `dig @1.1.1.1 www.quantumpoly.ai A +short` returns Vercel IP
- [ ] `dig @8.8.8.8 www.quantumpoly.ai A +short` returns Vercel IP
- [ ] WhatsMyDNS shows green checkmarks across all regions

**SSL/TLS:**

- [ ] Vercel dashboard shows "Valid" certificate status
- [ ] `openssl s_client` confirms Let's Encrypt issuer
- [ ] SSL Labs test shows A or A+ grade
- [ ] HSTS header present: `strict-transport-security: max-age=63072000`

**Application Health:**

- [ ] Homepage returns HTTP 200
- [ ] API endpoints functional (if applicable)
- [ ] Static assets load with cache headers
- [ ] No JavaScript console errors
- [ ] Canonical tags point to correct domain

**Monitoring:**

- [ ] Error rate <0.1% (baseline)
- [ ] Latency p95 <1000ms (acceptable)
- [ ] No spike in support tickets
- [ ] No user-reported issues on social media

**Security:**

- [ ] Security headers present (X-Frame-Options, CSP, etc.)
- [ ] robots.txt allows crawling (production only)
- [ ] Sitemap accessible and valid
- [ ] No mixed content warnings (HTTP resources on HTTPS pages)

**Communication:**

- [ ] Stakeholders notified of successful cutover
- [ ] Status page updated (if applicable)
- [ ] Internal team announcement posted

**Cleanup:**

- [ ] Remove temporary canary subdomains (if used)
- [ ] Archive previous DNS configuration documentation
- [ ] Update internal wiki/runbooks with new DNS setup
- [ ] Schedule TTL increase to 3600 (after 24h stability)

---

### F. Edge Cases & Advanced Scenarios

#### Wildcard Subdomain Configuration (`*.quantumpoly.ai`)

**Use Case:** Route all subdomains (e.g., `app.quantumpoly.ai`, `dashboard.quantumpoly.ai`) to Vercel.

**DNS Configuration:**

| Type  | Name | Value                | TTL |
| ----- | ---- | -------------------- | --- |
| CNAME | \*   | cname.vercel-dns.com | 300 |

**Vercel Configuration:**

```bash
vercel domains add *.quantumpoly.ai --token=$VERCEL_TOKEN
```

**⚠️ CAA Requirement:**

```
0 issuewild "letsencrypt.org"
```

**Verification:**

```bash
dig app.quantumpoly.ai A +short
dig dashboard.quantumpoly.ai A +short
# Both should return Vercel IP
```

---

#### DNSSEC Configuration

**When to Enable:** Enhanced DNS security, prevent cache poisoning attacks.

**Prerequisite:** DNS provider must support DNSSEC (Cloudflare, Route 53, Namecheap Pro).

**Procedure:**

1. **Enable DNSSEC at DNS Provider:**
   - Cloudflare: DNS → Settings → Enable DNSSEC
   - Route 53: Create DNSSEC signing configuration

2. **Retrieve DS Records:**

```bash
# Cloudflare provides DS records in dashboard
# Route 53 example:
aws route53 get-dnssec --hosted-zone-id Z1234567890ABC
```

**Example DS Record:**

```
quantumpoly.ai. IN DS 12345 13 2 ABC123DEF456...
```

3. **Add DS Records to Registrar:**
   - Log in to domain registrar (e.g., Namecheap, GoDaddy)
   - Navigate to domain management → DNSSEC
   - Paste DS record values

4. **Verification:**

```bash
dig +dnssec quantumpoly.ai
# Should show RRSIG records (signatures)

# Validate chain:
dig +dnssec +multi quantumpoly.ai SOA | grep RRSIG
```

**⚠️ Rollback Risk:** DNSSEC misconfiguration can cause complete DNS outage. Test thoroughly in staging.

---

#### Multi-Region DNS (GeoDNS)

**Use Case:** Route users to nearest Vercel edge location (already handled by Vercel automatically).

**Note:** Vercel's Anycast network provides automatic geo-routing. No manual GeoDNS configuration needed.

**Verification:**

```bash
# Query from different locations (use VPN or proxy)
curl -sI https://www.quantumpoly.ai | grep x-vercel-id
# Example: x-vercel-id: sfo1::xxxxx (San Francisco)
# Example: x-vercel-id: fra1::xxxxx (Frankfurt)
```

---

### G. Monitoring & Alerting (Recommended)

**DNS Monitoring:**

- **Service:** UptimeRobot, Pingdom, or Datadog Synthetics
- **Check Frequency:** Every 1-5 minutes
- **Alert Conditions:**
  - DNS resolution failure (NXDOMAIN)
  - DNS resolves to incorrect IP (not Vercel)
  - SSL certificate expiry <30 days

**Example UptimeRobot Monitor:**

```
Monitor Type: HTTP(s)
URL: https://www.quantumpoly.ai
Interval: 5 minutes
Alert Contacts: oncall@quantumpoly.ai
```

**SSL Expiry Monitoring:**

```bash
# Cron job (daily check)
0 8 * * * /usr/local/bin/check-ssl.sh
```

**check-ssl.sh:**

```bash
#!/bin/bash
EXPIRY=$(echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
  echo "SSL certificate expires in $DAYS_LEFT days!" | mail -s "SSL Alert: www.quantumpoly.ai" oncall@quantumpoly.ai
fi
```

---

### H. Related Documentation

| Document                            | Purpose                                 | Location                               |
| ----------------------------------- | --------------------------------------- | -------------------------------------- |
| **DNS_CONFIGURATION.md**            | General DNS setup guide                 | `docs/DNS_CONFIGURATION.md`            |
| **DNS.and.Environments.md**         | Environment-specific DNS configurations | `docs/DNS.and.Environments.md`         |
| **TROUBLESHOOTING.and.ROLLBACK.md** | General rollback procedures             | `docs/TROUBLESHOOTING.and.ROLLBACK.md` |
| **CI-CD.MAP.md**                    | Deployment pipeline architecture        | `docs/CI-CD.MAP.md`                    |
| **PREVIEW_DEPLOYMENT_SETUP.md**     | Vercel preview environment setup        | `docs/PREVIEW_DEPLOYMENT_SETUP.md`     |

---

### K. Manual DNS Verification Steps

**Purpose:** Document current DNS state before implementing changes to establish baseline for comparison and rollback reference.

#### Step 1: Identify Current Nameservers

**Query Authoritative Nameservers:**

```bash
dig quantumpoly.ai NS +short
```

**Expected Output (Example):**

```
ns1.cloudflare.com.
ns2.cloudflare.com.
```

**Documentation Template:**

```markdown
Current Nameservers (as of YYYY-MM-DD):

- Primary: ns1.provider.com
- Secondary: ns2.provider.com
- Tertiary: ns3.provider.com (if applicable)
```

---

#### Step 2: Query Start of Authority (SOA)

**Retrieve SOA Record:**

```bash
dig quantumpoly.ai SOA +short
```

**Expected Output (Example):**

```
ns1.cloudflare.com. dns.cloudflare.com. 2025102101 10000 2400 604800 3600
```

**SOA Fields:**

- **Primary NS:** `ns1.cloudflare.com`
- **Admin Email:** `dns.cloudflare.com` (represents dns@cloudflare.com)
- **Serial:** `2025102101` (YYYYMMDDNN format)
- **Refresh:** `10000` seconds (2.8 hours)
- **Retry:** `2400` seconds (40 minutes)
- **Expire:** `604800` seconds (7 days)
- **Minimum TTL:** `3600` seconds (1 hour)

---

#### Step 3: Document Current DNS Records

**Query All Record Types:**

```bash
# A records (IPv4)
dig www.quantumpoly.ai A +short
dig quantumpoly.ai A +short

# AAAA records (IPv6)
dig www.quantumpoly.ai AAAA +short
dig quantumpoly.ai AAAA +short

# CNAME records
dig www.quantumpoly.ai CNAME +short

# CAA records (Certificate Authority Authorization)
dig quantumpoly.ai CAA +short

# TXT records
dig quantumpoly.ai TXT +short
dig _vercel.quantumpoly.ai TXT +short

# MX records (email)
dig quantumpoly.ai MX +short
```

**Documentation Template:**

```markdown
### Current DNS Configuration (Baseline - YYYY-MM-DD HH:MM UTC)

| Record Type | Name    | Value                                   | TTL  | Notes                  |
| ----------- | ------- | --------------------------------------- | ---- | ---------------------- |
| A           | @       | 192.0.2.100                             | 3600 | Previous origin server |
| A           | www     | 192.0.2.100                             | 3600 | Previous origin server |
| CNAME       | staging | old-cdn.example.com                     | 3600 | Staging environment    |
| CAA         | @       | 0 issue "digicert.com"                  | 3600 | Previous SSL provider  |
| MX          | @       | 10 mail.example.com                     | 3600 | Email routing          |
| TXT         | @       | "v=spf1 include:\_spf.example.com ~all" | 3600 | SPF record             |
```

---

#### Step 4: Verify Domain Registrar Information

**WHOIS Lookup:**

```bash
whois quantumpoly.ai
```

**Key Information to Document:**

- **Registrar:** (e.g., Namecheap, GoDaddy, Google Domains)
- **Registration Date:** Domain creation date
- **Expiration Date:** ⚠️ Ensure domain not expiring during DNS change
- **Registrant Contact:** Verify ownership access
- **Admin Contact:** DNS change authorization
- **Name Servers:** Should match `dig NS` output

**macOS/Linux Alternative:**

```bash
whois quantumpoly.ai | grep -E 'Registrar:|Expiration|Name Server'
```

---

#### Step 5: Test Current Resolution from Multiple Locations

**Public Resolver Matrix:**

| Resolver       | Provider      | Command                                           | Purpose                |
| -------------- | ------------- | ------------------------------------------------- | ---------------------- |
| 1.1.1.1        | Cloudflare    | `dig @1.1.1.1 www.quantumpoly.ai A +short`        | Global CDN perspective |
| 8.8.8.8        | Google        | `dig @8.8.8.8 www.quantumpoly.ai A +short`        | North America          |
| 9.9.9.9        | Quad9         | `dig @9.9.9.9 www.quantumpoly.ai A +short`        | Europe                 |
| 208.67.222.222 | Cisco OpenDNS | `dig @208.67.222.222 www.quantumpoly.ai A +short` | Enterprise perspective |

**Consistency Check:**

```bash
# Run all resolvers and compare
for resolver in 1.1.1.1 8.8.8.8 9.9.9.9 208.67.222.222; do
  echo "Resolver: $resolver"
  dig @$resolver www.quantumpoly.ai A +short
  echo "---"
done
```

**Expected:** All resolvers should return **identical IP addresses** for stable DNS state.

**⚠️ Warning:** If resolvers return different IPs, DNS is currently in propagation state. **Postpone changes** until consistent.

---

#### Step 6: SSL Certificate Current State

**Query Current Certificate:**

```bash
echo | openssl s_client -servername www.quantumpoly.ai -connect www.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

**Documentation Template:**

```markdown
### Current SSL/TLS Certificate (Baseline)

- **Subject:** CN=www.quantumpoly.ai
- **Issuer:** C=US, O=DigiCert Inc, CN=DigiCert TLS RSA SHA256 2020 CA1
- **Valid From:** 2025-01-15 00:00:00 GMT
- **Valid Until:** 2026-01-15 23:59:59 GMT
- **SAN (Subject Alternative Names):**
  - DNS:www.quantumpoly.ai
  - DNS:quantumpoly.ai
- **Signature Algorithm:** sha256WithRSAEncryption
- **Key Size:** 2048 bit RSA
```

**Web-Based Verification:**

```bash
# Check SSL Labs grade (before changes)
# https://www.ssllabs.com/ssltest/analyze.html?d=www.quantumpoly.ai
```

**Baseline SSL Grade:** Document current grade (A+, A, B, etc.) for post-change comparison.

---

#### Step 7: Create Pre-Change Snapshot Document

**Comprehensive Pre-Change Documentation:**

```markdown
# DNS Pre-Change Baseline Snapshot

**Date:** 2025-10-21 14:30:00 UTC
**Operator:** Jane Doe (SRE)
**Purpose:** Baseline documentation before Vercel migration

## DNS Configuration

### Nameservers

- ns1.cloudflare.com
- ns2.cloudflare.com

### Records

| Type | Name | Value       | TTL  |
| ---- | ---- | ----------- | ---- |
| A    | @    | 192.0.2.100 | 3600 |
| A    | www  | 192.0.2.100 | 3600 |

## SSL Certificate

- Issuer: DigiCert
- Expiry: 2026-01-15
- Grade: A+

## Propagation Status

✅ Consistent across all public resolvers (verified 14:28 UTC)

## Rollback Reference

To revert to this state:

1. Update CNAME: www → old-cdn.example.com
2. TTL: 300 (for fast propagation)
3. Wait 15 minutes, verify with: `dig www.quantumpoly.ai CNAME +short`

## Approval

- Reviewed by: John Smith (Lead SRE)
- Approved: 2025-10-21 14:45 UTC
- Maintenance window: 2025-10-22 02:00-06:00 UTC
```

---

#### Step 8: Verify DNS Propagation Tools Access

**Pre-validate external monitoring tools are operational:**

```bash
# Test WhatsMyDNS API access
curl -s "https://www.whatsmydns.net/api/details?server=google&type=A&query=www.quantumpoly.ai" | jq .

# Expected: Valid JSON response with DNS data
```

**Bookmark Tools for Change Validation:**

- WhatsMyDNS: https://www.whatsmydns.net/#A/www.quantumpoly.ai
- DNS Checker: https://dnschecker.org/#A/www.quantumpoly.ai
- SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=www.quantumpoly.ai

---

### L. Rollback Drill Procedure

**Purpose:** Validate rollback procedures in controlled staging environment to ensure operational readiness before production DNS changes.

**Drill Frequency:** Quarterly (minimum) or before major DNS migrations.

---

#### Drill Prerequisites

**Environment Requirements:**

- [ ] Staging domain available (e.g., `staging.quantumpoly.ai` or `test.quantumpoly.ai`)
- [ ] Access to DNS provider admin panel (non-production test zone if available)
- [ ] Vercel staging project configured
- [ ] Rollback procedures documented (from Section 6 of this runbook)
- [ ] Timing tools ready (stopwatch, monitoring dashboards)

**Personnel:**

- [ ] Primary operator (executes drill)
- [ ] Observer (documents timing and issues)
- [ ] Optional: Incident commander (oversees drill)

**Communication:**

- [ ] Team notified of drill schedule
- [ ] Stakeholders informed (drill, not actual incident)
- [ ] Slack/Teams channel ready for real-time updates

---

#### Test Scenario 1: DNS Revert to Previous Origin

**Objective:** Validate ability to revert DNS records to previous configuration within documented timeframe (10-20 minutes).

**Procedure:**

**Phase 1: Simulate Migration (Setup)**

1. **Record Current State:**

```bash
dig staging.quantumpoly.ai CNAME +short > /tmp/baseline-dns.txt
cat /tmp/baseline-dns.txt
# Expected: old-cdn.example.com (or current staging target)
```

2. **Update DNS to Vercel (Simulated Migration):**
   - DNS Provider → staging.quantumpoly.ai → CNAME → `cname.vercel-dns.com`
   - TTL: 300 seconds
   - Save changes

3. **Verify Migration Propagation:**

```bash
# Start timer
START_TIME=$(date +%s)

# Wait for propagation
while true; do
  RESULT=$(dig staging.quantumpoly.ai CNAME +short)
  if [[ "$RESULT" == "cname.vercel-dns.com." ]]; then
    echo "✅ Migration propagated"
    break
  fi
  sleep 10
done

# Record migration time
MIGRATION_TIME=$(($(date +%s) - START_TIME))
echo "Migration propagation time: ${MIGRATION_TIME}s"
```

**Phase 2: Execute Rollback**

4. **Trigger Rollback (Simulated Incident):**
   - **T+0 seconds:** Incident declared (simulated: "High error rate detected")
   - **Action:** Revert DNS to baseline

5. **DNS Revert:**

```bash
# Record rollback start time
ROLLBACK_START=$(date +%s)
```

- DNS Provider → staging.quantumpoly.ai → CNAME → `old-cdn.example.com` (from baseline)
- TTL: 300 seconds (keep low for verification)
- Save changes

6. **Monitor Rollback Propagation:**

```bash
# Check propagation every 10 seconds
while true; do
  RESULT=$(dig staging.quantumpoly.ai CNAME +short)
  ELAPSED=$(($(date +%s) - ROLLBACK_START))

  echo "[$ELAPSED s] Current DNS: $RESULT"

  if [[ "$RESULT" == "old-cdn.example.com." ]]; then
    echo "✅ Rollback propagated successfully"
    ROLLBACK_TIME=$ELAPSED
    break
  fi

  if [[ $ELAPSED -gt 1200 ]]; then  # 20 minutes
    echo "❌ Rollback exceeded 20-minute target"
    break
  fi

  sleep 10
done
```

7. **Verify Application Accessibility:**

```bash
curl -I https://staging.quantumpoly.ai
# Expected: HTTP 200 from previous origin
```

**Success Criteria:**

| Metric                    | Target      | Actual          | Pass/Fail |
| ------------------------- | ----------- | --------------- | --------- |
| Rollback propagation time | <20 minutes | **_ min _** sec | ✅/❌     |
| Application accessibility | HTTP 200    | HTTP \_\_\_     | ✅/❌     |
| Error rate                | <1%         | \_\_\_%         | ✅/❌     |
| Operator confidence       | High        | \_\_\_/10       | ✅/❌     |

---

#### Test Scenario 2: Maintenance Page Deployment

**Objective:** Validate ability to quickly deploy maintenance page with low TTL for fast cutover/cutback (target: 2-5 minutes).

**Procedure:**

**Phase 1: Prepare Maintenance Page**

1. **Verify Maintenance Page Accessible:**

```bash
# Assume maintenance page hosted at: https://maintenance-page.example.com
curl -I https://maintenance-page.example.com
# Expected: HTTP 200
```

2. **Document Maintenance Page CNAME Target:**

```
Maintenance CNAME: maintenance-page.example.com
OR
Maintenance A Record: 192.0.2.50
```

**Phase 2: Execute Maintenance Page Cutover**

3. **Update DNS to Maintenance Page:**

```bash
# Start timer
MAINT_START=$(date +%s)
```

- DNS Provider → staging.quantumpoly.ai → CNAME → `maintenance-page.example.com`
- TTL: **60 seconds** (critical: low TTL for fast recovery)
- Save changes

4. **Verify Maintenance Page Live:**

```bash
# Check every 5 seconds
while true; do
  RESULT=$(curl -sL -o /dev/null -w "%{http_code}" https://staging.quantumpoly.ai)
  ELAPSED=$(($(date +%s) - MAINT_START))

  echo "[$ELAPSED s] HTTP Status: $RESULT"

  # Check if page contains maintenance message
  CONTENT=$(curl -sL https://staging.quantumpoly.ai | grep -i "maintenance" || echo "")

  if [[ -n "$CONTENT" ]]; then
    echo "✅ Maintenance page active"
    MAINT_CUTOVER_TIME=$ELAPSED
    break
  fi

  if [[ $ELAPSED -gt 300 ]]; then  # 5 minutes
    echo "❌ Maintenance page cutover exceeded 5-minute target"
    break
  fi

  sleep 5
done
```

**Phase 3: Restore Production Service**

5. **Revert to Production (Simulated Fix Deployed):**

```bash
# Start recovery timer
RECOVERY_START=$(date +%s)
```

- DNS Provider → staging.quantumpoly.ai → CNAME → `cname.vercel-dns.com`
- TTL: 300 seconds (can increase after stability confirmed)
- Save changes

6. **Verify Production Service Restored:**

```bash
while true; do
  ELAPSED=$(($(date +%s) - RECOVERY_START))

  # Check Vercel header presence (indicates Vercel serving)
  VERCEL_ID=$(curl -sI https://staging.quantumpoly.ai | grep -i "x-vercel-id" || echo "")

  if [[ -n "$VERCEL_ID" ]]; then
    echo "✅ Production service restored"
    echo "$VERCEL_ID"
    RECOVERY_TIME=$ELAPSED
    break
  fi

  echo "[$ELAPSED s] Waiting for production service..."

  if [[ $ELAPSED -gt 300 ]]; then
    echo "❌ Recovery exceeded 5-minute target"
    break
  fi

  sleep 5
done
```

**Success Criteria:**

| Metric                      | Target                    | Actual          | Pass/Fail |
| --------------------------- | ------------------------- | --------------- | --------- |
| Maintenance page cutover    | <5 minutes                | **_ min _** sec | ✅/❌     |
| Production service recovery | <5 minutes                | **_ min _** sec | ✅/❌     |
| Total downtime (simulated)  | <10 minutes               | **_ min _** sec | ✅/❌     |
| User-visible message        | Clear maintenance message | Yes/No          | ✅/❌     |

---

#### Test Scenario 3: CDN Proxy Disable (Cloudflare-Specific)

**Objective:** Validate ability to disable Cloudflare proxy (orange-cloud) to resolve SSL or routing issues (target: 10-15 minutes).

**Prerequisites:**

- Staging domain using Cloudflare DNS
- Cloudflare proxy currently enabled (orange cloud)

**Procedure:**

1. **Verify Proxy Status (Initial State):**

```bash
# Cloudflare proxied IPs are in 104.x.x.x range
dig staging.quantumpoly.ai A +short
# Expected: 104.x.x.x (Cloudflare proxy IP)
```

2. **Disable Cloudflare Proxy:**

```bash
# Start timer
PROXY_DISABLE_START=$(date +%s)
```

- Cloudflare Dashboard → DNS → staging → Click orange cloud → Switch to gray cloud (DNS only)
- Save

3. **Monitor Direct DNS Resolution:**

```bash
while true; do
  IP=$(dig staging.quantumpoly.ai A +short)
  ELAPSED=$(($(date +%s) - PROXY_DISABLE_START))

  echo "[$ELAPSED s] Resolved IP: $IP"

  # Check if IP is Vercel range (76.76.21.x) instead of Cloudflare (104.x.x.x)
  if [[ "$IP" == 76.76.21.* ]]; then
    echo "✅ Proxy disabled, resolving directly to Vercel"
    PROXY_DISABLE_TIME=$ELAPSED
    break
  fi

  if [[ $ELAPSED -gt 900 ]]; then  # 15 minutes
    echo "❌ Proxy disable exceeded 15-minute target"
    break
  fi

  sleep 10
done
```

4. **Verify SSL Certificate Reissued (if applicable):**

```bash
# Check certificate issuer
echo | openssl s_client -servername staging.quantumpoly.ai -connect staging.quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -issuer
# Expected: issuer=C=US, O=Let's Encrypt, CN=R3 (Vercel's Let's Encrypt cert)
```

5. **Clear Cloudflare Cache:**
   - Cloudflare Dashboard → Caching → Purge Everything
   - Document purge timestamp

6. **Re-enable Proxy (Return to Baseline):**
   - Cloudflare Dashboard → DNS → staging → Click gray cloud → Switch to orange cloud
   - Save

**Success Criteria:**

| Metric                      | Target                 | Actual          | Pass/Fail |
| --------------------------- | ---------------------- | --------------- | --------- |
| Proxy disable propagation   | <15 minutes            | **_ min _** sec | ✅/❌     |
| Direct Vercel IP resolution | 76.76.21.x             | **_._**.**_._** | ✅/❌     |
| SSL certificate correct     | Let's Encrypt (Vercel) | **\_**          | ✅/❌     |
| Application functional      | HTTP 200               | HTTP \_\_\_     | ✅/❌     |

---

#### Post-Drill Documentation

**Drill Summary Template:**

```markdown
# Rollback Drill Report

**Date:** 2025-10-21
**Duration:** 45 minutes
**Participants:**

- Primary Operator: Jane Doe
- Observer: John Smith
- Incident Commander: Alice Johnson

## Scenarios Tested

### 1. DNS Revert to Previous Origin

- **Target:** 10-20 minutes
- **Actual:** 12 minutes 34 seconds
- **Result:** ✅ PASS
- **Issues:** None

### 2. Maintenance Page Deployment

- **Target:** 2-5 minutes (cutover + recovery <10 min total)
- **Actual Cutover:** 3 minutes 15 seconds
- **Actual Recovery:** 4 minutes 8 seconds
- **Total:** 7 minutes 23 seconds
- **Result:** ✅ PASS
- **Issues:** Maintenance page CSS failed to load initially (cached asset issue - resolved by cache-busting parameter)

### 3. CDN Proxy Disable

- **Target:** 10-15 minutes
- **Actual:** 11 minutes 50 seconds
- **Result:** ✅ PASS
- **Issues:** Cloudflare cache purge delayed by 2 minutes (API rate limit)

## Lessons Learned

1. **Positive:**
   - All rollback procedures completed within target timeframes
   - Documentation accurate and easy to follow
   - Low TTL (60s) proved effective for maintenance page strategy

2. **Areas for Improvement:**
   - Add cache-busting parameters to maintenance page assets
   - Document Cloudflare API rate limits for cache purge operations
   - Create pre-staged maintenance page on separate CDN to avoid cache issues

3. **Action Items:**
   - [ ] Update maintenance page to include `?v=timestamp` for all assets
   - [ ] Document Cloudflare cache purge alternatives (URL-specific vs. full)
   - [ ] Add "Drill Results" section to runbook with historical timing data

## Operator Confidence

**Pre-Drill:** 6/10
**Post-Drill:** 9/10

**Recommendation:** Approve production DNS migration. Rollback procedures validated and operational.

**Approver:** Alice Johnson (SRE Lead)
**Date:** 2025-10-21
```

---

#### Drill Success Criteria (Overall)

**Drill considered successful if:**

- [ ] All three scenarios executed without critical failures
- [ ] Rollback timing within documented ranges (or within 25% variance)
- [ ] No data loss or persistent outages during drill
- [ ] Operator confidence level ≥7/10 post-drill
- [ ] Lessons learned documented with action items
- [ ] Drill report reviewed and approved by SRE lead

**Next Drill:** Schedule within 90 days or before next major DNS change.

---

### I. Changelog

| Date       | Version | Author        | Changes                                                                                                                                                   |
| ---------- | ------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-10-21 | 1.0     | CASP SRE Team | Initial operational runbook creation                                                                                                                      |
| 2025-10-21 | 1.1     | CASP SRE Team | Added Appendix K (Manual DNS Verification Steps), Appendix L (Rollback Drill Procedure), Audit Trail & Governance section, updated workflow documentation |

---

### J. Contact & Escalation

**For DNS/SSL issues during maintenance window:**

- **On-Call SRE:** Use PagerDuty escalation policy
- **Vercel Support:** https://vercel.com/support (Enterprise: Priority support)
- **DNS Provider Support:**
  - Cloudflare: https://support.cloudflare.com/
  - AWS Route 53: AWS Support Console
- **Internal Slack:** `#incidents` channel

**Post-Incident Review:**

- Schedule within 24-48 hours of rollback or incident
- Document root cause, timeline, and remediation in `docs/postmortems/`

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-10-21  
**Next Review:** 2026-01-21 (Quarterly)  
**Maintained By:** Site Reliability Engineering Team

---

**End of DNS Operational Runbook**
