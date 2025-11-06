# Deployment Instructions – Newsletter Fix

**Status:** ✅ Ready for deployment  
**Priority:** High (user-facing rendering issue)  
**Estimated Deploy Time:** 5 minutes

---

## 🚀 Quick Deployment

### Option A: Automatic Deployment (Recommended)

```bash
# 1. Commit the fix
git add next.config.mjs NEWSLETTER_RENDER_FIX.md DEPLOYMENT_INSTRUCTIONS.md
git commit -m "fix(csp): allow Next.js inline scripts for client-side hydration

- Added 'unsafe-inline' and 'unsafe-eval' to script-src CSP directive
- Added 'unsafe-inline' to style-src for Tailwind JIT compilation
- Fixes newsletter form not rendering on Vercel production
- Resolves CSP blocking React hydration and dynamic imports

Ref: NEWSLETTER_RENDER_FIX.md"

# 2. Push to main (triggers Vercel auto-deploy)
git push origin main

# 3. Monitor deployment
# Visit: https://vercel.com/your-org/quantumpoly/deployments
# Expected completion: ~2-3 minutes
```

### Option B: Manual Vercel Deploy

```bash
# Deploy directly via Vercel CLI
vercel --prod

# Follow prompts:
# ? Set up and deploy? [Y/n] y
# ? Which scope? your-org
# ? Link to existing project? [Y/n] y
# ? What's the name of your existing project? quantumpoly
```

---

## ✅ Post-Deployment Validation

### 1. Visual Verification (30 seconds)

```bash
# Open production site
open https://quantumpoly.ai/en
```

**Check:**
- [ ] Page loads without errors
- [ ] Scroll to "Stay in the Loop" section
- [ ] Newsletter form is **visible** (not grey skeleton)
- [ ] Input field is **interactive** (can type)
- [ ] Submit button is **clickable**

### 2. Functional Test (1 minute)

```bash
# Test newsletter subscription flow
```

**Steps:**
1. Enter invalid email: `invalidemail` → Should show error message
2. Enter valid email: `test@example.com` → Click "Subscribe"
3. **Expected:** Success message appears
4. Try same email again → **Expected:** "Already subscribed" message

### 3. CSP Header Verification (15 seconds)

```bash
# Check CSP headers in production
curl -I https://quantumpoly.ai/en | grep -i content-security-policy
```

**Expected output should include:**
```
Content-Security-Policy: ... script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
```

### 4. Browser DevTools Check (30 seconds)

```bash
# Open browser DevTools (F12 or Cmd+Option+I)
```

**Console Tab:**
- [ ] NO CSP violation errors
- [ ] NO "Refused to execute inline script" messages
- [ ] NO React hydration warnings

**Network Tab:**
- [ ] POST `/api/newsletter` → Status 201 (success)
- [ ] OR Status 409 (already subscribed)
- [ ] Response contains: `{"messageKey":"newsletter.success"}`

### 5. Multi-Locale Test (1 minute)

Test in all supported languages:

```bash
# German
open https://quantumpoly.ai/de

# French
open https://quantumpoly.ai/fr

# Spanish
open https://quantumpoly.ai/es

# Italian
open https://quantumpoly.ai/it

# Turkish
open https://quantumpoly.ai/tr
```

**Verify:** Newsletter section visible and functional in all locales.

---

## 🔧 Rollback Plan (If Issues Occur)

### Immediate Rollback

```bash
# Option 1: Revert via Vercel Dashboard
# 1. Go to https://vercel.com/your-org/quantumpoly/deployments
# 2. Find previous successful deployment
# 3. Click "..." → "Promote to Production"

# Option 2: Revert via Git
git revert HEAD
git push origin main

# Wait for automatic deployment (~2 minutes)
```

### Temporary CSP Workaround

If newsletter still doesn't render after deployment:

1. **Check Vercel Environment Variables:**
   - Ensure no CSP override in Vercel dashboard
   - Navigate to: Project Settings → Environment Variables
   - Look for any `CONTENT_SECURITY_POLICY` or similar variables

2. **Add CSP Report-Only Mode (Debug):**
   ```javascript
   // In next.config.mjs, temporarily change line 34:
   key: 'Content-Security-Policy-Report-Only',  // Add "-Report-Only"
   ```

3. **Check Browser Console:**
   - Look for CSP violation reports
   - Share logs with development team

---

## 📊 Success Metrics

### Immediate (Within 5 minutes)

- ✅ Zero CSP violation errors in browser console
- ✅ Newsletter form visible on all pages
- ✅ Form submissions successful (201 status)

### Short-term (Within 24 hours)

- ✅ Newsletter conversion rate matches baseline
- ✅ No increase in error rates (Vercel Analytics)
- ✅ User feedback: no more "form not visible" reports

### Monitoring Queries

```bash
# Check error rate in Vercel logs
vercel logs quantumpoly --follow

# Filter for newsletter API errors
vercel logs quantumpoly | grep "/api/newsletter"

# Check for CSP violations (if report-uri configured)
vercel logs quantumpoly | grep "csp-violation"
```

---

## 🔍 Troubleshooting

### Issue: Form Still Not Visible

**Diagnosis:**
```bash
# 1. Check if deployment succeeded
vercel ls quantumpoly

# 2. Verify CSP headers in production
curl -I https://quantumpoly.ai/en | grep CSP

# 3. Check browser cache
# In Chrome DevTools: Network tab → Disable cache checkbox
```

**Solution:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache: `Cmd+Shift+Delete` (Mac) or `Ctrl+Shift+Delete` (Windows)
- Test in incognito/private browsing mode

### Issue: API Errors (500/429)

**Diagnosis:**
```bash
# Check API route is deployed
curl https://quantumpoly.ai/api/newsletter

# Test with valid email
curl -X POST https://quantumpoly.ai/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Solution:**
- Verify route file exists in deployment
- Check Vercel function logs for runtime errors
- Confirm rate limiting is not too aggressive

### Issue: Hydration Mismatch

**Symptoms:**
- Form flickers on page load
- Console warning: "Text content did not match"

**Solution:**
```bash
# This indicates SSR/CSR mismatch
# Check that dynamic import is still using ssr: false
grep -A5 "NewsletterForm = dynamic" src/app/[locale]/page.tsx
```

---

## 📞 Support Contacts

**For deployment issues:**
- Vercel Support: https://vercel.com/support
- Project Dashboard: https://vercel.com/your-org/quantumpoly

**For technical questions:**
- Review: `NEWSLETTER_RENDER_FIX.md`
- Check: Next.js CSP docs: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy

---

## ✅ Deployment Checklist

**Pre-Deployment:**
- [x] Code changes committed
- [x] Local build successful (`npm run build`)
- [x] Local production test passed (`npm run start`)
- [x] CSP headers verified in local environment
- [x] Newsletter form renders locally

**During Deployment:**
- [ ] Pushed to main branch / deployed via Vercel CLI
- [ ] Deployment completed without errors
- [ ] Production build successful (check Vercel logs)

**Post-Deployment:**
- [ ] Visual verification: Form visible
- [ ] Functional test: Form submission works
- [ ] CSP header check: Correct directives present
- [ ] Browser console: No errors
- [ ] Multi-locale test: All languages working

**Monitoring (24 hours):**
- [ ] Error rate stable (Vercel Analytics)
- [ ] Newsletter conversion rate normal
- [ ] No user complaints about form visibility

---

**Deployment Lead:** CASP Team  
**Last Updated:** 2025-10-24  
**Document Version:** 1.0

