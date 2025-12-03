# FPP-04 — Accessibility Enhancement Specification

**Version:** 1.0.0
**Author:** Professor Doctor Julius Prompto
**Date:** 2025-12-01
**Status:** Approved for Implementation

---

## 1. Executive Summary

This engineering specification defines the remediation strategy for Critical Accessibility Debt identified in `ReviewDashboard.tsx` and `SignOffForm.tsx`. The objective is to achieve **strict WCAG 2.1 AA compliance**, focusing on semantic structure, precise ARIA attribution, and robust focus management.

The changes herein are not merely cosmetic; they fundamentally restructure the component semantics to ensure equitable access for users relying on Assistive Technology (AT).

## 2. Scope & Targets

### 2.1 Affected Components

- `src/components/audit/ReviewDashboard.tsx`: Dashboard container and authentication entry point.
- `src/components/audit/SignOffForm.tsx`: Complex form with dynamic inputs (Exception Justifications).

### 2.2 Compliance Standards

- **WCAG 2.1 AA**:
  - **1.3.1 Info and Relationships**: Information, structure, and relationships conveyed through presentation can be programmatically determined.
  - **3.3.2 Labels or Instructions**: Labels or instructions are provided when content requires user input.
  - **4.1.2 Name, Role, Value**: For all user interface components, the name and role can be programmatically determined.
  - **4.1.3 Status Messages**: Status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.

---

## 3. Technical Implementation Details

### 3.1 `ReviewDashboard.tsx` Refactor

**Current State Analysis:**

- The authentication container uses generic `div` elements.
- Input labeling relies on implicit association or potentially missing `for` attributes in some contexts (though `aria-label` was recently patched, structural semantics are weak).

**Specification:**

1.  **Semantic Containers**:
    - Convert the "Authentication Required" `div` to a `<section>` element.
    - Apply `aria-labelledby` linking to the heading (`h2`).
    - _Rationale_: Allows AT users to navigate by regions and understand the section's purpose immediately.

2.  **Focus Management**:
    - Ensure the API Key input receives focus if the user is redirected or if the section is dynamically revealed (context dependent).

**Code Reference (Target Structure):**

```tsx
<section aria-labelledby="auth-heading" className="...">
  <h2 id="auth-heading" className="...">
    Authentication Required
  </h2>
  <p id="auth-description">...</p>
  {/* Input Group */}
</section>
```

### 3.2 `SignOffForm.tsx` Refactor

**Current State Analysis:**

- **Dynamic Exceptions**: Currently implemented as a list of `div`s. This fails to convey the _grouping_ of related fields (Issue, Rationale, Mitigation) to the screen reader.
- **Error Handling**: Uses a generic `div` which might not announce itself immediately upon appearance.
- **Invalid States**: Inputs lack `aria-invalid` attributes when validation fails.

**Specification:**

1.  **Dynamic Field Grouping (`<fieldset>`)**:
    - **Requirement**: Each "Exception" block must be wrapped in a `<fieldset>`.
    - **Legend**: Each fieldset must have a `<legend>` identifying the specific exception (e.g., "Exception 1").
    - _Rationale_: WCAG 1.3.1. Users must understand that the inputs for "Rationale" and "Mitigation" belong to a specific Exception instance.

2.  **Validation Feedback**:
    - **Requirement**: Apply `aria-invalid="true"` to inputs when they are touched and empty (if required).
    - **Requirement**: Ensure the error summary container has `role="alert"` (already present, verify persistence).

3.  **Semantic Controls**:
    - Ensure the "Remove Exception" button is clearly labeled (e.g., `aria-label="Remove Exception 1"`).

**Code Reference (Target Structure):**

```tsx
<fieldset className="...">
  <legend className="sr-only">Exception {index + 1}</legend>
  <div className="visible-header">
    <h4>Exception {index + 1}</h4>
    <button aria-label={`Remove Exception ${index + 1}`}>Remove</button>
  </div>
  {/* Inputs */}
  <input aria-invalid={!isValid} aria-describedby={!isValid ? `error-${id}` : undefined} />
</fieldset>
```

---

## 4. Verification & Testing

### 4.1 Automated Testing

- Run `npm run test:e2e:a11y` (Playwright + Axe Core).
- **Pass Criteria**: Zero violations of `critical` or `serious` impact.

### 4.2 Manual Validation Protocol

1.  **Screen Reader Simulation**:
    - Tab through `ReviewDashboard`. Confirm "Authentication Required" is announced as a region/section.
    - Add an Exception in `SignOffForm`. Confirm focus flows logically into the new fieldset.
    - Submit empty form. Confirm error alert is announced ("Assertive" or "Polite").
2.  **Keyboard Navigation**:
    - Ensure all interactive elements have visible focus states.

---

## 5. Maintenance

- Future fields added to `SignOffForm` must adhere to the `fieldset`/`legend` pattern if they constitute a logical group.
- Any new error messages must use `role="alert"` or `aria-live` regions.

**Signed,**
_Professor Doctor Julius Prompto_
_Chief Architect of Semantic Precision_
