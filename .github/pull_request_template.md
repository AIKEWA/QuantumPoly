# Pull Request — Quality Gate Checklist

## Summary

**Description**: [Brief description of changes]

**Type**: [ ] Feature | [ ] Bug Fix | [ ] Refactor | [ ] Documentation | [ ] CI/Ops

**Related Issues**: [Link to related issues or tickets]

---

## Quality Gates — SEO / A11y / Performance

### SEO

- [ ] Meta tags verified (title, description, canonical)
- [ ] OpenGraph tags complete (og:title, og:description, og:image, og:url, og:type)
- [ ] Twitter Card tags complete (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Locales and `hreflang` correct (if applicable)
- [ ] Sitemap/robots updated for route changes (if applicable)
- [ ] `npm run seo:validate` passes

### Accessibility

- [ ] `npm run lint` — `eslint-plugin-jsx-a11y` passes with **0 errors/warnings**
- [ ] `npm run test:a11y` — `jest-axe` reports **0 violations** (Home, Article, Navigation)
- [ ] `npm run test:e2e:a11y` — Playwright axe E2E passes (0 critical/serious)
- [ ] Lighthouse Accessibility score **≥ 95** (attach artifact link)
- [ ] Keyboard navigation tested manually (if UI changes)
- [ ] Screen reader compatibility verified (if applicable)

### Performance

- [ ] Lighthouse Performance score **≥ 90** (attach artifact link)
- [ ] JavaScript bundle budget **< 250 KB per route** (`npm run budget` passes)
- [ ] Images use `next/image` with proper `width`, `height`, `sizes` attributes
- [ ] Heavy components use dynamic imports where appropriate
- [ ] No blocking third-party scripts in critical render path

### Documentation & Evidence

- [ ] README updated (if behavior changed)
- [ ] CI artifacts linked in PR comments (Lighthouse reports, a11y audits)
- [ ] Changelog entry added (if user-visible impact)
- [ ] Tests added/updated for new functionality
- [ ] JSDoc/inline comments for complex logic

---

## Reviewer Fast-Check Guidance

To review this PR efficiently:

1. **Check PR body** → All boxes ticked; artifact links visible
2. **Verify CI status** → All workflows green (a11y.yml, perf.yml, seo-validation.yml)
3. **Inspect artifacts**:
   - Download `lighthouse-performance` artifact → `categories.performance.score * 100 ≥ 90`
   - Download `lighthouse-accessibility-evidence` artifact → `categories.accessibility.score * 100 ≥ 95`
4. **Bundle check** → Verify `npm run budget` job passed (or review size logs)
5. **A11y check** → Confirm `jest-axe` output reports **0 violations**
6. **Code review** → Files changed, logic correctness, test coverage

### Common Issues & Fixes

| Issue               | Root Cause       | Fix                                                       |
| ------------------- | ---------------- | --------------------------------------------------------- |
| Perf < 90           | LCP too slow     | Add `priority` to hero image, optimize image sizes        |
| Bundle > 250 KB     | Heavy imports    | Use dynamic imports for below-fold components             |
| A11y violations     | Missing ARIA     | Add `aria-label`, fix color contrast, ensure keyboard nav |
| Sitemap outdated    | New route added  | Add route to `src/lib/routes.ts` and `src/lib/seo.ts`     |
| Robots policy wrong | Env var mismatch | Check `NEXT_PUBLIC_SITE_URL` and `NODE_ENV`               |

---

## Testing Evidence

**Local Testing**:

```bash
npm run lint              # [✓ / ✗]
npm run test              # [✓ / ✗]
npm run test:a11y         # [✓ / ✗]
npm run budget            # [✓ / ✗]
npm run build             # [✓ / ✗]
```

**Lighthouse Scores** (attach screenshots or artifact links):

- Performance: [score]/100
- Accessibility: [score]/100
- Best Practices: [score]/100
- SEO: [score]/100

**CI Artifact Links**:

- Lighthouse Performance: [link to workflow artifact]
- Lighthouse Accessibility: [link to workflow artifact]
- Playwright A11y Report: [link to workflow artifact]

---

## Deployment Checklist

### Pre-Merge

- [ ] All CI checks passing
- [ ] Code review approved (1+ reviewers)
- [ ] Merge conflicts resolved
- [ ] Commits squashed/cleaned (if appropriate)

### Post-Merge

- [ ] Deploy to staging verified
- [ ] Smoke test critical paths
- [ ] Monitor CI workflows on subsequent PRs
- [ ] Production deployment scheduled (if applicable)

---

## Additional Notes

[Any additional context, decisions, trade-offs, or discussion points]

---

**PR Status**: [ ] Draft | [ ] Ready for Review | [ ] Changes Requested | [ ] Approved
