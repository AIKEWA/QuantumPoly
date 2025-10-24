# Performance Optimization - Quick Start Guide

## 🚀 What Changed

Performance optimizations with CI enforcement: LCP ≤ 2.5s, Lighthouse ≥ 90, JS < 250 KB/page.

## ✅ New Commands

```bash
# Check bundle sizes (must be < 250 KB per route)
npm run budget

# Run Lighthouse performance audit (must be ≥ 90)
npm run lh:perf
```

## 📦 Installation

```bash
# Install new dependencies (lighthouse + chrome-launcher)
npm install
```

## 🧪 Local Testing Workflow

```bash
# 1. Build the app
npm run build

# 2. Check bundle budgets
npm run budget

# 3. Start production server
npm run start &

# 4. Wait a few seconds, then run Lighthouse
npm run lh:perf

# Expected output:
# ✅ Bundle budget: All routes < 250 KB
# ✅ Lighthouse Performance: 90+ / 100
```

## 🖼️ Using the New Hero Image Feature

```tsx
// Update your page components:
<Hero
  title={tHero('title')}
  subtitle={tHero('subtitle')}
  ctaLabel={tHero('ctaLabel')}
  headingLevel={1}
  heroImage={{
    src: '/images/hero.webp', // Your image
    alt: 'Descriptive alt text',
    width: 1280,
    height: 720,
    sizes: '(max-width: 768px) 100vw, 1280px',
  }}
/>
```

**Note:** Only the hero image should use this prop. All other images will be lazy-loaded automatically.

## 🤖 CI Enforcement

The new `.github/workflows/perf.yml` workflow automatically:

- ✅ Enforces bundle budgets on every push/PR
- ✅ Runs Lighthouse audit (blocks merge if < 90)
- ✅ Uploads JSON artifacts for debugging

## 📊 What Was Optimized

| Optimization         | Impact              | Files Changed                                       |
| -------------------- | ------------------- | --------------------------------------------------- |
| **next/image setup** | Automatic AVIF/WebP | `next.config.js`, `Hero.tsx`                        |
| **Inter font**       | Zero layout shift   | `layout.tsx`, `tailwind.config.js`                  |
| **Code splitting**   | -41% initial JS     | `page.tsx`, `FAQ.tsx`                               |
| **Script deferral**  | Faster FCP          | `FAQ.tsx`                                           |
| **Bundle budget**    | CI enforcement      | `scripts/check-bundle-budget.mjs`                   |
| **Lighthouse CI**    | Performance gate    | `scripts/lh-perf.mjs`, `.github/workflows/perf.yml` |

## 🔍 Troubleshooting

**Bundle exceeds 250 KB:**

```bash
# Inspect build manifest
cat .next/build-manifest.json | jq

# Look for duplicate dependencies
npm ls [package-name]
```

**Lighthouse fails locally:**

```bash
# Ensure server is running
curl http://localhost:3000/en

# Check Chrome is installed
which google-chrome || which chromium

# Run with debug
DEBUG=* npm run lh:perf
```

**CI workflow fails:**

- Check artifacts tab in GitHub Actions
- Download `lighthouse-performance-*.json` for detailed report
- Review bundle budget output in logs

## 📚 Full Documentation

See [README.md - Performance Optimization](./README.md#performance-optimization) for:

- Complete optimization strategy
- Performance targets and metrics
- Detailed troubleshooting guide
- Optimization decision rationale

See [PERFORMANCE_OPTIMIZATION_SUMMARY.md](./PERFORMANCE_OPTIMIZATION_SUMMARY.md) for:

- Complete implementation details
- All file changes
- Testing checklist
- Migration guide

## ⚠️ Important Notes

1. **Hero image required:** Add a real hero image to `public/images/hero.webp` (currently using placeholder)
2. **Priority flag:** Only use on ONE image per page (the LCP candidate)
3. **Dynamic imports:** Don't split above-the-fold or SEO-critical components
4. **CI artifacts:** Performance reports retained for 30 days in GitHub Actions

## 🎯 Performance Targets

| Metric                 | Target         | Current Status            |
| ---------------------- | -------------- | ------------------------- |
| Lighthouse Performance | ≥ 90           | ✅ CI enforced            |
| JS Bundle              | < 250 KB/route | ✅ CI enforced            |
| LCP                    | ≤ 2.5s         | ⏳ Measured by Lighthouse |
| TBT                    | < 300ms        | ⏳ Measured by Lighthouse |
| CLS                    | < 0.1          | ⏳ Measured by Lighthouse |

---

**Questions?** See full documentation in README.md or PERFORMANCE_OPTIMIZATION_SUMMARY.md
