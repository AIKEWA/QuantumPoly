# Accessibility Audit Criteria (FPP-10)

## Governance & Compliance Linkage

This document establishes the bridge between technical accessibility implementations (FPP-04) and high-level governance auditing (Block 9.9/10).

### 1. Compliance Baseline

**Standard:** WCAG 2.1 Level AA (Minimum), WCAG 2.2 AA (Target)
**Scope:** All public-facing interfaces, review dashboards, and policy documents.

### 2. Audit Verification Points

#### A. Automated Validation (Pass/Fail)

| Criteria ID       | Check                     | Tooling                  | Threshold                 |
| ----------------- | ------------------------- | ------------------------ | ------------------------- |
| **AUDIT-A11Y-01** | **Syntax & Semantics**    | `eslint-plugin-jsx-a11y` | 0 Errors                  |
| **AUDIT-A11Y-02** | **Component Unit Health** | `jest-axe`               | 0 Violations              |
| **AUDIT-A11Y-03** | **Critical Flows (E2E)**  | `playwright-axe`         | 0 Critical/Serious Issues |
| **AUDIT-A11Y-04** | **Lighthouse Metric**     | Lighthouse CI            | Score ≥ 95                |

#### B. Manual Review Requirements (Human Audit)

Auditors (Accessibility Reviewer Role) must verify:

1.  **Keyboard Nav:** Complete focus visibility and logical tab order.
2.  **Screen Reader:** Meaningful announcements for dynamic content (e.g., "Sign-off submitted successfully").
3.  **Zoom/Reflow:** UI remains usable at 200% zoom without horizontal scroll.
4.  **Error Recovery:** Form validation errors are clearly identified and linked to inputs.

### 3. Evidence Collection

For the purpose of the **Integrity Ledger** and **Audit Finalization**:

- **CI Artifacts:** Links to the latest passed GitHub Actions run (Playwright report).
- **Manual Sign-off:** The "Accessibility Reviewer" role in the Review Dashboard explicitly attests to passing the Human Audit criteria.
- **Exceptions:** Any known violations must be documented as "Approved with Exceptions" in the Sign-Off Form with a mitigation plan.

### 4. Reference

- **Technical Spec:** [FPP-04_ACCESSIBILITY_SPEC.md](../accessibility/FPP-04_ACCESSIBILITY_SPEC.md)
- **Testing Guide:** [ACCESSIBILITY_TESTING.md](../ACCESSIBILITY_TESTING.md)
- **Review Dashboard:** [REVIEW_DASHBOARD_README.md](./REVIEW_DASHBOARD_README.md)
