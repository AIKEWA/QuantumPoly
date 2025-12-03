# Accessibility Changelog

## 2025-12-01 - FPP-04 Structural Refactor (Specification Update)

**Components:** `ReviewDashboard.tsx`, `SignOffForm.tsx`

### Changes Implemented

1.  **ReviewDashboard.tsx**:
    - Converted "Authentication Required" container from `div` to `section` with `aria-labelledby="auth-heading"`.
    - Added `autoFocus` to the API Key input to improve focus management when the section is revealed.
    - **Impact**: Enhances WCAG 1.3.1 (Info and Relationships) by providing a semantic region for the authentication area, and improves focus handling.

2.  **SignOffForm.tsx**:
    - Refactored Exception items to use `<fieldset>` and `<legend>` (visually hidden) for semantic grouping of related inputs.
    - Applied `aria-hidden="true"` to the visual "Exception X" heading to prevent screen reader duplication.
    - **Impact**: Strictly meets WCAG 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) for grouped form controls.

## 2025-12-01 - FPP-04 Remediation

**Components:** `ReviewDashboard.tsx`, `SignOffForm.tsx`

### Changes Implemented

1.  **ReviewDashboard.tsx**:
    - Added `id="auth-description"` to the authentication instruction text.
    - Added `aria-label="API Key"` and `aria-describedby="auth-description"` to the API key password input.
    - **Impact**: Resolves WCAG 1.3.1 (Info and Relationships) and WCAG 4.1.2 (Name, Role, Value) by ensuring the input has an accessible name and description.

2.  **SignOffForm.tsx**:
    - Added explicit `aria-label` attributes to all dynamic exception justification inputs (`issue_description`, `rationale`, `mitigation_plan`, `mitigation_owner`, `deadline`) matching their placeholders.
    - Updated the "Remove" exception button to have a unique accessible name: `aria-label={\`Remove exception ${index + 1}\`}`.
    - Added `role="alert"` and `aria-live="assertive"` to the form error display container.
    - **Impact**:
      - Resolves WCAG 3.3.2 (Labels or Instructions) for dynamic fields.
      - Resolves WCAG 4.1.2 for the remove button.
      - Resolves WCAG 4.1.3 (Status Messages) for error feedback.

## 2025-12-01 - FPP-04 Full Implementation & FPP-04.1 Test Resilience

**Components:** `ReviewDashboard.tsx`, `SignOffForm.tsx`
**Tests:** `e2e/governance/review-dashboard.spec.ts`

### Changes Implemented

1.  **ReviewDashboard.tsx**:
    - **Landmarks & Semantics**: Replaced structural `div`s with `<section>` elements labeled by headings for System Overview, Sign-Off Progress, and Blocking Issues. Used `<dl>` for System Overview metrics to map key-value pairs semantically.
    - **Status Lists**: Converted progress tracking to `<ul>` with `aria-live="polite"` for dynamic updates. Status emojis now properly hidden (`aria-hidden="true"`) with accessible text alternatives ("Complete" / "Pending").
    - **Blocking Issues**: Applied `role="alert"` and `aria-live="assertive"` to the Blocking Issues container to ensure immediate notification of critical blockers.
    - **Authentication**: Added `role="status"` live region to announce when the sign-off form becomes available after unlocking.

2.  **SignOffForm.tsx**:
    - **Form Structure**: Wrapped in `<section>` with introductory description linked via `aria-describedby` on the form or first input context.
    - **Input Semantics**: Enforced `aria-required="true"` on all required fields. Linked asterisks to `aria-hidden="true"` to reduce noise.
    - **Dynamic Exceptions**:
      - Added `aria-live="polite"` region for the exception list.
      - Used `<fieldset>` with explicit `<legend>` for grouped exception fields.
      - Ensured all dynamic inputs have associated labels (`aria-label` where visual labels are hidden).
    - **Submission Feedback**: Submit button now describes why it is disabled if exceptions are missing (`aria-describedby`).

3.  **Test Resilience (FPP-04.1)**:
    - Updated `review-dashboard.spec.ts` to use `getByRole` and `getByLabel` selectors, reducing reliance on brittle CSS/text selectors.
    - Added hydration wait steps (checking for interactive elements) before asserting on content.
    - Verified new accessibility attributes (e.g., `aria-required`, `role="region"`).

### Verification

- **Automated Tests**: `npm run test:e2e -- e2e/governance/review-dashboard.spec.ts` passed successfully (Exit code: 0).
  - Confirmed visibility of all semantic regions.
  - Validated form validation logic and accessible names.
  - Verified role and decision dropdown options.
