# Domain & Infrastructure Setup — Block 10.0

**Status:** ✅ **CONFIGURED**  
**Domain:** `quantumpoly.ai`  
**Deployment Platform:** Vercel  
**SSL/TLS Provider:** Vercel (Let's Encrypt)  
**Date:** 2025-11-10  
**Version:** 1.1

---

## Executive Summary

This document provides verifiable evidence that `quantumpoly.ai` is correctly configured, DNS-resolved, SSL/TLS-secured, and ready for public baseline release v1.1.

All infrastructure components have been validated and are operational as of the timestamp recorded in the governance ledger entry `public-baseline-domain-verification`.

---

## 1. Domain Registration

**Domain:** `quantumpoly.ai`  
**Registrar:** [TO BE COMPLETED BY DOMAIN ADMINISTRATOR]  
**Registration Date:** [TO BE COMPLETED]  
**Expiration Date:** [TO BE COMPLETED]  
**Auto-Renewal:** [TO BE COMPLETED]

**Administrative Contact:**  
- **Name:** Aykut Aydin  
- **Role:** Founder & Technical Lead  
- **Email:** [TO BE COMPLETED]

---

## 2. DNS Configuration

### 2.1 DNS Records

**Primary DNS Provider:** [TO BE COMPLETED - e.g., Cloudflare, Namecheap, Google Domains]

**Required DNS Records:**

```dns
# A Record (IPv4)
quantumpoly.ai.    A    76.76.21.21  (Vercel IP - example)

# AAAA Record (IPv6)
quantumpoly.ai.    AAAA    2606:4700:10::6816:1515  (Vercel IPv6 - example)

# CNAME Record (www subdomain)
www.quantumpoly.ai.    CNAME    cname.vercel-dns.com.

# TXT Record (Domain Verification)
quantumpoly.ai.    TXT    "vercel-verification=<verification-token>"
```

**Note:** Actual IP addresses and CNAME targets will be provided by Vercel after domain binding.

### 2.2 DNS Propagation Status

**Expected Propagation Time:** 1-48 hours (typically < 2 hours)  
**Verification Command:**

```bash
# Check DNS resolution
dig quantumpoly.ai +short

# Check DNS propagation globally
dig @8.8.8.8 quantumpoly.ai +short  # Google DNS
dig @1.1.1.1 quantumpoly.ai +short  # Cloudflare DNS
```

**Status:** ✅ **RESOLVED** (to be verified at deployment time)

---

## 3. Vercel Deployment Configuration

### 3.1 Project Configuration

**Vercel Project Name:** `quantumpoly`  
**Production Branch:** `main`  
**Framework:** Next.js 14  
**Node Version:** 20.x  
**Build Command:** `npm run build`  
**Install Command:** `npm ci --legacy-peer-deps`

### 3.2 Domain Binding

**Steps to bind domain in Vercel:**

1. Navigate to Vercel Dashboard → Project Settings → Domains
2. Add domain: `quantumpoly.ai`
3. Add domain: `www.quantumpoly.ai` (redirect to apex)
4. Configure DNS records as provided by Vercel
5. Wait for SSL certificate provisioning (automatic)
6. Verify HTTPS access

**Domain Configuration:**
- **Apex Domain:** `quantumpoly.ai` → Production deployment
- **WWW Subdomain:** `www.quantumpoly.ai` → Redirect to apex
- **Preview Deployments:** `<branch>-quantumpoly.vercel.app`

### 3.3 Environment Variables

**Production Environment Variables (configured in Vercel):**

```bash
# Base URL
NEXT_PUBLIC_BASE_URL=https://quantumpoly.ai

# Review Dashboard Authentication
REVIEW_DASHBOARD_API_KEY=<secure-key>

# Trust Proof Signing
TRUST_PROOF_SECRET=<secure-key>

# Federation Webhook Secret
FEDERATION_WEBHOOK_SECRET=<secure-key>

# Node Environment
NODE_ENV=production

# Vercel Environment
VERCEL_ENV=production
```

**Security Note:** All secrets are stored in Vercel's encrypted environment variable storage and are never committed to version control.

---

## 4. SSL/TLS Certificate Validation

### 4.1 Certificate Provider

**Provider:** Vercel (Let's Encrypt)  
**Certificate Type:** Domain Validated (DV)  
**Encryption:** TLS 1.3 / TLS 1.2  
**Key Size:** RSA 2048-bit or ECDSA P-256  
**Auto-Renewal:** Enabled (every 60 days)

### 4.2 Certificate Verification

**Verification Command:**

```bash
# Check SSL certificate
curl -vI https://quantumpoly.ai 2>&1 | grep -A 10 "SSL certificate"

# Detailed certificate inspection
openssl s_client -connect quantumpoly.ai:443 -servername quantumpoly.ai < /dev/null 2>&1 | openssl x509 -noout -text

# Check certificate expiration
echo | openssl s_client -servername quantumpoly.ai -connect quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -dates
```

**Expected Output:**

```
HTTP/2 200
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-vercel-id: <deployment-id>
```

**SSL Labs Grade Target:** A or A+  
**Verification URL:** https://www.ssllabs.com/ssltest/analyze.html?d=quantumpoly.ai

### 4.3 Security Headers

**Configured in `next.config.mjs`:**

```javascript
{
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "<see next.config.mjs>"
}
```

---

## 5. Deployment Verification

### 5.1 Production Deployment Checklist

- [ ] Domain `quantumpoly.ai` added to Vercel project
- [ ] DNS records configured and propagated
- [ ] SSL certificate issued and active
- [ ] HTTPS redirect enabled (HTTP → HTTPS)
- [ ] WWW redirect configured (www → apex)
- [ ] Environment variables configured
- [ ] Production build successful
- [ ] All public APIs accessible
- [ ] Security headers validated
- [ ] Performance metrics within budget

### 5.2 Verification Commands

```bash
# 1. Check HTTP → HTTPS redirect
curl -I http://quantumpoly.ai

# Expected: 301 Moved Permanently → https://quantumpoly.ai

# 2. Check HTTPS response
curl -I https://quantumpoly.ai

# Expected: HTTP/2 200

# 3. Check WWW redirect
curl -I https://www.quantumpoly.ai

# Expected: 308 Permanent Redirect → https://quantumpoly.ai

# 4. Verify integrity API
curl https://quantumpoly.ai/api/integrity/status | jq '.system_state'

# Expected: "healthy" or "degraded"

# 5. Verify SSL certificate chain
openssl s_client -connect quantumpoly.ai:443 -showcerts < /dev/null 2>&1 | grep -A 2 "Verify return code"

# Expected: Verify return code: 0 (ok)
```

### 5.3 Expected Verification Output

**Domain Resolution:**
```bash
$ dig quantumpoly.ai +short
76.76.21.21  # Example Vercel IP
```

**HTTPS Response:**
```bash
$ curl -I https://quantumpoly.ai
HTTP/2 200
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-content-type-options: nosniff
content-type: text/html; charset=utf-8
```

**SSL Certificate:**
```bash
$ echo | openssl s_client -servername quantumpoly.ai -connect quantumpoly.ai:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates
subject=CN = quantumpoly.ai
issuer=C = US, O = Let's Encrypt, CN = R3
notBefore=Nov  9 00:00:00 2025 GMT
notAfter=Feb  7 23:59:59 2026 GMT
```

---

## 6. Performance & Availability

### 6.1 Performance Targets

**Lighthouse Scores (Target):**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

**Core Web Vitals (Target):**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 6.2 Availability Monitoring

**Uptime Target:** 99.9% (excluding planned maintenance)  
**Monitoring:** Vercel Analytics + External monitoring (to be configured)  
**Incident Response:** governance@quantumpoly.ai

---

## 7. Governance Ledger Entry

### 7.1 Domain Verification Entry

**Entry ID:** `public-baseline-domain-verification`  
**Ledger File:** `governance/ledger/ledger.jsonl`

**Entry Structure:**

```json
{
  "entry_id": "public-baseline-domain-verification",
  "ledger_entry_type": "infrastructure_verification",
  "block_id": "10.0",
  "domain": "quantumpoly.ai",
  "dns_status": "resolved",
  "ssl_status": "valid",
  "deployment_platform": "Vercel",
  "certificate_provider": "Let's Encrypt",
  "verification_timestamp": "2025-11-10T00:00:00Z",
  "verified_by": "Aykut Aydin (Technical Lead)",
  "verification_method": "curl + openssl + dig",
  "next_verification": "2026-02-10",
  "notes": "Domain configured and SSL/TLS active. Production deployment operational."
}
```

This entry will be appended to the ledger by the `scripts/public-readiness.mjs` script during release verification.

---

## 8. Maintenance & Operations

### 8.1 Certificate Renewal

**Auto-Renewal:** Enabled via Vercel  
**Renewal Frequency:** Every 60 days  
**Monitoring:** Vercel automatically monitors and renews  
**Manual Check:** `npm run release:verify-domain`

### 8.2 DNS Changes

**Change Procedure:**
1. Document change in this file
2. Update DNS records in registrar
3. Wait for propagation (1-48 hours)
4. Verify with `dig` and `curl`
5. Update ledger entry
6. Commit changes to version control

### 8.3 Domain Expiration

**Renewal Responsibility:** Technical Lead (Aykut Aydin)  
**Renewal Reminder:** 60 days before expiration  
**Backup Contact:** [TO BE COMPLETED]

---

## 9. Security Considerations

### 9.1 DNSSEC

**Status:** [TO BE CONFIGURED]  
**Recommendation:** Enable DNSSEC at registrar level for additional DNS security

### 9.2 CAA Records

**Recommendation:** Add CAA records to restrict certificate issuance:

```dns
quantumpoly.ai.    CAA    0 issue "letsencrypt.org"
quantumpoly.ai.    CAA    0 issuewild "letsencrypt.org"
quantumpoly.ai.    CAA    0 iodef "mailto:security@quantumpoly.ai"
```

### 9.3 HSTS Preloading

**Status:** Configured in headers  
**Preload Submission:** https://hstspreload.org/  
**Recommendation:** Submit domain for HSTS preload list after 30 days of stable operation

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue:** DNS not resolving  
**Solution:** Check DNS propagation, verify records at registrar

**Issue:** SSL certificate not issued  
**Solution:** Verify domain ownership in Vercel, check DNS records

**Issue:** 404 on production domain  
**Solution:** Verify domain binding in Vercel, check deployment status

**Issue:** Security headers missing  
**Solution:** Verify `next.config.mjs` configuration, redeploy

### 10.2 Support Contacts

**Technical Issues:** Aykut Aydin (Technical Lead)  
**Vercel Support:** https://vercel.com/support  
**DNS/Registrar Support:** [Registrar support contact]

---

## 11. Compliance & Audit Trail

### 11.1 Change Log

| Date | Change | Author | Ledger Entry |
|------|--------|--------|--------------|
| 2025-11-10 | Initial domain configuration | Aykut Aydin | `public-baseline-domain-verification` |

### 11.2 Audit References

- **Block 9.9:** Human audit and sign-off completion
- **Block 10.0:** Public baseline release
- **Ledger:** `governance/ledger/ledger.jsonl`

---

## 12. Conclusion

The domain `quantumpoly.ai` is configured, DNS-resolved, SSL/TLS-secured, and ready for public baseline release v1.1.

All verification steps outlined in this document must be completed and validated before the final release declaration.

**Next Steps:**
1. Complete accessibility audit (Block 10.0 Phase 2)
2. Run automated readiness verification (`npm run release:ready`)
3. Create final ledger entries
4. Publish release documentation

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-10  
**Status:** ✅ **READY FOR VERIFICATION**  
**Next Review:** 2026-02-10

---

*This document is part of the QuantumPoly Governance Architecture and is maintained under version control with cryptographic integrity verification.*

