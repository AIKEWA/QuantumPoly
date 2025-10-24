# Ethical Scoring Methodology

## Overview

This document describes the methodology used to calculate the Ethical Integrity Index (EII) and individual category scores in the QuantumPoly Ethical Governance Dashboard.

---

## Ethical Integrity Index (EII)

### Formula

```
EII = 0.3(A11y) + 0.3(Performance) + 0.2(SEO) + 0.2(Bundle)
```

### Rationale

**Equal weight to Accessibility & Performance (30% each):**

- These categories directly impact user experience and digital inclusion
- Accessibility ensures equitable access for users with disabilities
- Performance affects usability for users on slow connections or low-powered devices
- Both reflect commitment to human-centered design

**Moderate weight to SEO & Bundle (20% each):**

- Important for discoverability and efficiency
- Secondary to direct user impact
- Support broader ethical goals (transparency, sustainability)

### Score Range

- **0-100:** Normalized scale for interpretability
- **95-100:** Gold tier (exemplary ethical practices)
- **90-94:** Silver tier (strong ethical practices)
- **75-89:** Bronze tier (acceptable ethical practices)
- **0-74:** Amber tier (needs improvement)

---

## Category Scores

### 1. SEO (Search Engine Optimization)

**Metric Source:** Google Lighthouse SEO audits

**Calculation:**

```javascript
SEO_Score = Lighthouse_SEO_Category_Score × 100
```

**Sub-Metrics:**

- Meta tags (title, description)
- Semantic HTML structure
- Mobile-friendliness
- Crawlability (robots.txt, sitemap.xml)
- Structured data (Schema.org)
- Image alt attributes
- Link accessibility

**Ethical Justification:**
Good SEO ensures:

- Equal access to information
- Content discoverability for all users
- Support for assistive technologies (semantic HTML)
- Transparency and findability

**Passing Threshold:** ≥90

---

### 2. Accessibility (A11y)

**Metric Source:** Google Lighthouse Accessibility audits + jest-axe tests

**Calculation:**

```javascript
A11y_Score = Lighthouse_Accessibility_Category_Score × 100
```

**Sub-Metrics:**

- Color contrast (WCAG AA: 4.5:1 for text, 3:1 for large text)
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Screen reader compatibility
- Semantic HTML
- Form labels
- Heading hierarchy
- Skip links

**Ethical Justification:**
Accessibility is a fundamental human right:

- Ensures digital inclusion for users with disabilities
- Supports visual, auditory, motor, and cognitive accessibility
- Complies with WCAG 2.2 Level AA
- Demonstrates commitment to universal design

**Passing Threshold:** ≥90 (WCAG AA ≈ 90-95)

---

### 3. Performance

**Metric Source:** Google Lighthouse Performance audits

**Calculation:**

```javascript
Performance_Score = Lighthouse_Performance_Category_Score × 100
```

**Sub-Metrics (Core Web Vitals):**

- **Largest Contentful Paint (LCP):** ≤2.5s (good)
- **Total Blocking Time (TBT):** ≤200ms (good)
- **Cumulative Layout Shift (CLS):** ≤0.1 (good)
- First Contentful Paint (FCP)
- Speed Index
- Time to Interactive (TTI)

**Ethical Justification:**
Performance directly impacts:

- User experience (especially on slow connections)
- Energy consumption (environmental sustainability)
- Accessibility (faster load times help users with cognitive disabilities)
- Digital equity (ensures usability on low-powered devices)

**Passing Threshold:** ≥90

---

### 4. Bundle Efficiency

**Metric Source:** Next.js build manifest analysis

**Calculation:**

```javascript
Avg_Bundle_Size_KB = Total_JS_Size_KB / Route_Count

if (Avg_Bundle_Size_KB ≤ 150) {
  Bundle_Score = 100
} else if (Avg_Bundle_Size_KB ≥ 500) {
  Bundle_Score = 0
} else {
  // Linear interpolation between 150KB (100) and 500KB (0)
  Bundle_Score = 100 - ((Avg_Bundle_Size_KB - 150) / 350) × 100
}
```

**Targets:**

- **Excellent:** <150 KB (score: 100)
- **Good:** 150-250 KB (score: 71-100)
- **Acceptable:** 250-350 KB (score: 43-71)
- **Poor:** 350-500 KB (score: 0-43)
- **Critical:** >500 KB (score: 0)

**Ethical Justification:**
Smaller bundles:

- Reduce bandwidth costs for users
- Load faster on slower networks
- Minimize environmental impact (less energy consumption)
- Improve accessibility for users in low-bandwidth regions

**Passing Threshold:** ≥75 (approximately <280 KB average)

---

## Qualitative Tags

Tags are automatically assigned based on score thresholds:

| Tag                       | Condition                 |
| ------------------------- | ------------------------- |
| **A11y Clean**            | A11y ≥ 95                 |
| **WCAG 2.2 AA**           | A11y ≥ 95                 |
| **Performance Optimized** | Performance ≥ 90          |
| **Energy Efficient**      | Performance ≥ 90          |
| **SEO Best Practices**    | SEO ≥ 90                  |
| **Transparency Verified** | EII ≥ 90                  |
| **GDPR Compliant**        | Always (no PII collected) |

---

## Data Integrity

### Cryptographic Verification

**SHA256 Hashing:**

```javascript
hash = SHA256(JSON.stringify(data));
```

- Applied to each metric report
- Applied to composite scorecard
- Enables tamper detection

**Merkle Tree:**

```
merkle_root = hash(hash(report1) + hash(report2) + ... + hash(reportN))
```

- Hierarchical hashing of all metric hashes
- Provides efficient verification
- Single root hash represents entire dataset

**GPG Signatures:**

```
signature = GPG_sign(ledger_entry, private_key)
```

- Signs Merkle root and metadata
- Proves authenticity and non-repudiation
- Public key verification available

---

## Validation Process

### Schema Validation

All data validated against JSON schemas:

- `/schemas/ethics/report-schema.json`
- `/schemas/ethics/ethical-scorecard-schema.json`

Validation performed using `ajv` (JSON Schema validator):

```bash
npm run ethics:validate
```

### Ledger Verification

Verify integrity of transparency ledger:

```bash
npm run ethics:verify-ledger
```

Checks:

- Structural validity
- Chronological order
- GPG signatures
- Hash format consistency

---

## Limitations & Considerations

### What EII Measures

✅ **Technical Compliance:**

- Code quality metrics
- Industry best practices adherence
- Measurable performance characteristics

✅ **Accessibility:**

- Automated WCAG checks
- Structural accessibility features

### What EII Does NOT Measure

❌ **Content Ethics:**

- Bias in textual content
- Cultural sensitivity
- Factual accuracy
- Misinformation

❌ **Business Practices:**

- Data monetization
- Third-party sharing
- Marketing ethics
- Pricing fairness

❌ **Human Factors:**

- User satisfaction
- Emotional well-being
- Cognitive load (beyond performance)

### Recommendations

- **Complement with qualitative reviews:** Human auditors should review content and UX
- **Regular updates:** Review scoring weights annually
- **Stakeholder feedback:** Incorporate user and expert input
- **Context-specific adjustments:** Different projects may require different weights

---

## Continuous Improvement

### Feedback Mechanism

- GitHub Discussions: Community feedback on methodology
- Quarterly reviews: Internal ethics committee
- Annual audits: External compliance experts

### Versioning

Changes to scoring methodology will be:

1. Documented in this file
2. Tagged in version control
3. Reflected in `eiCalculation.formula` field
4. Announced in changelog

**Current Version:** 1.0

**Last Updated:** 2025-10-19

---

## References

- [Google Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [EU AI Act](https://artificialintelligenceact.eu/)
- [IEEE 7000 Standard](https://standards.ieee.org/standard/7000-2021.html)
