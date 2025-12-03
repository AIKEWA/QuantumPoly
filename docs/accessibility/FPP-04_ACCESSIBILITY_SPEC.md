# FPP-04 — ReviewDashboard & SignOffForm Accessibility Refactor

Audit owner: @casp accessibility guild  
Impacted modules: `src/components/audit/ReviewDashboard.tsx`, `src/components/audit/SignOffForm.tsx`  
Compliance target: WCAG 2.1 AA, WAI-ARIA Authoring Practices 1.2

---

## 1. Scope & Objectives

- Guarantee perceivable, operable, understandable, and robust experiences across the dashboard and sign-off workflows.
- Standardize labelling and descriptive relationships so assistive technologies expose consistent Name/Role/Value metadata (WCAG 4.1.2).
- Minimize bespoke ARIA—prefer semantic HTML whenever possible (W3C ARIA in HTML).
- Deliver an auditable workflow: code changes + automated a11y tests + documentation updates (`docs/accessibility/CHANGELOG.md`).

Success is demonstrated when:

1. Every form control has an explicitly associated label and, when relevant, tied descriptions/error messages via `aria-describedby`.
2. Interactive regions expose accurate semantics and keyboard affordances without over-reliance on emoji or visual-only cues.
3. Automated (`npm run test:e2e:a11y`) and manual SR checks (VoiceOver, NVDA, JAWS) report zero critical violations tied to ReviewDashboard/SignOffForm.

---

## 2. Current Accessibility Baseline (Gap Analysis)

### ReviewDashboard

| Issue                                              | Evidence | Impact | WCAG |
| -------------------------------------------------- | -------- | ------ | ---- |
| Progress list uses cosmetic emoji-only status text |

````104:126:src/components/audit/ReviewDashboard.tsx
<span className="text-green-600">✅ Complete</span>
...
<span className="text-gray-500">⏳ Pending</span>
``` | Screen readers announce emoji labels inconsistently; no status semantics or `aria-live` to announce updates after refresh. | 1.3.1 Info & Relationships, 4.1.2 Name/Role/Value |
| System overview key metrics rendered with generic `<div>` instead of semantic structures | Visual grouping done with `<div>` blocks; data lacks `<dl>` or table semantics, so relationships between labels/values are not announced. | Users navigating by structure cannot efficiently parse key-value pairs. | 1.3.1 |
| API key reveal toggle uses button but focus order jumps when section disappears; no explicit description of state after setting key. | After clicking “Set Key” the section unmounts without informing SR users that sign-off form is now available. | Creates context loss and violates expectations of programmatic determinism. | 3.2.2 On Input |
| `ReviewHistory` and `IntegrityStatusPanel` injection points rely on default semantics; no region/landmark structure to help SRs jump between modules. | Dense dashboard lacks landmarks; SR users must linearize entire page. | 2.4.1 Bypass Blocks, 2.4.6 Headings and Labels |

### SignOffForm

| Issue | Evidence | Impact | WCAG |
| --- | --- | --- | --- |
| Field errors not linked to inputs; `aria-invalid` absent. |
```344:353:src/components/audit/SignOffForm.tsx
{error && <div role="alert" ...>{error}</div>}
``` | Generic alert does not identify which field failed server-side validation; inputs continue to announce as “valid”. | 3.3.1 Error Identification, 4.1.3 Status Messages |
| Exception sections rely on placeholder text for requiredness; legends hidden with `sr-only` but no description of fields grouping. | Screen reader users do not hear context for “Issue description” etc beyond placeholder. | 1.3.1, 3.3.2 Labels or Instructions |
| Add/Remove exception controls are plain text buttons lacking focus outlines beyond default and no announcement when list changes. | Complex dynamic list lacks `aria-live` feedback. | 4.1.3 Status Messages |
| Submit button disables when exceptions missing but has no `aria-describedby` explaining requirement. | SR users only hear “dimmed Submit Sign-Off” with no reason. | 3.3.3 Error Suggestion |

---

## 3. Global Implementation Standards

1. **Prefer semantic elements first.** Replace structural `<div>` containers with `<section>`, `<header>`, `<ul>/<li>`, `<dl>/<dt>/<dd>`, `<fieldset>/<legend>` as appropriate before reaching for ARIA.
2. **Labeling contract.**
   - Primary control label: `<label for>` or `aria-labelledby`.
   - Supplemental guidance/errors: `aria-describedby` referencing static helper text + dynamic error spans.
   - Mark invalid inputs with `aria-invalid="true"` and ensure associated error text is inserted directly after the control for predictable screen-reader order.
3. **Status messaging.** Use `role="status"` (polite) or `role="alert"` (assertive) for asynchronous updates (refresh, API errors) and tie to specific component contexts.
4. **Keyboard interaction.** All interactive controls must be tabbable and expose `Enter`/`Space` activation. When using custom widgets, mirror ARIA Authoring Practices patterns or fall back to native controls.
5. **Dynamic content messaging.** When forms add/remove sections (exceptions), wrap the list in a `section` with `aria-live="polite"` so newly inserted content is announced. Provide inline counts for orientation.
6. **Visual + programmatic parity.** Emoji may complement but must not be the only data conveyed. Provide accessible text equivalents (e.g., `aria-label="Complete"` or actual text nodes without emoji).

---

## 4. Component Implementation Requirements

### 4.1 ReviewDashboard

1. **Dashboard framing.**
   - Wrap the component root in a `<section aria-labelledby="review-dashboard-heading">` and ensure surrounding page sets the heading id to preserve navigation landmarks.
   - Each major block (“System Overview”, “Sign-Off Progress”, “Blocking Issues”, “Review History”) should be a `<section>` with `aria-labelledby` referencing its `<h2>` for structural clarity (WCAG 2.4.6).

2. **System overview metrics.**
   - Render the three KPIs using a `<dl>`: each label becomes `<dt>` and value `<dd>`. This exposes explicit relationships without extra ARIA.
   - When values change via `refreshData`, wrap the `<dl>` in `role="status" aria-live="polite"` so SR users hear updates.

3. **Sign-Off progress list.**
   - Convert the current mapped `<div>` blocks into an ordered `<ul>` with list items.
   - Provide text “Complete”/“Pending” as plain text; emoji should have `aria-hidden="true"` if retained purely decorative.
   - When progress updates post-refresh, announce via `aria-live` message summarizing delta (e.g., “Governance Officer sign-off recorded”).

4. **Blocking issues.**
   - Keep `<ul>` but ensure heading includes programmatic status such as `role="alert" aria-live="assertive"` because blocking items require immediate attention.

5. **API key authentication block.**
   - Maintain `aria-labelledby`/`aria-describedby` but add `aria-live="polite"` announcement “Sign-off form unlocked” after the API key is accepted to satisfy WCAG 3.2.2.
   - Ensure “Set Key” button communicates toggle state (e.g., `aria-pressed` if reused) or simply remove the button after success and move focus to the SignOffForm heading.

6. **Child components integration.**
   - Pass down accessible props so `IntegrityStatusPanel` exposes machine-readable severity (use `<dl>` or `<table>`). Ensure `ReviewHistory` items include `<time dateTime>` and descriptive SR-only text (e.g., “Approved by Legal Counsel on 2025-11-20”).

### 4.2 SignOffForm

1. **Form landmark and summary.**
   - Wrap the `<form>` in `<section aria-labelledby="signoff-form-heading">` and ensure heading id matches.
   - Provide an introductory paragraph describing required inputs and exception rules; reference it via `aria-describedby` on the `<form>` or first control.

2. **Field-level labelling & errors.**
   - For each input/select/textarea:
     - Add an `id`, ensure `<label htmlFor>` matches.
     - Add `aria-describedby` pointing to helper text + error span (e.g., `id="reviewer-name-error"`). Render error spans conditionally with `role="alert"` and connect to invalid fields.
     - Toggle `aria-invalid={hasError}`.

3. **Decision-dependent requirements.**
   - When `requiresExceptions` is `true`, set `aria-describedby` on the submit button referencing an explanatory text node (e.g., `id="exception-required-hint"`). This text must explain why submission is disabled.
   - Provide `role="status"` updates summarizing current number of exceptions (`Exception list updated, 2 items total`) to keep SR users oriented.

4. **Exception fieldsets.**
   - Convert the SR-only legend to a visible, descriptive legend (e.g., “Exception 1 details”). If visual duplication is a concern, hide the extra heading and rely on the legend.
   - Each control inside should reuse the group label for clarity (e.g., “Exception 1 issue description”).
   - `Remove` buttons must include `aria-describedby` referencing the exception title and return focus logically (e.g., to the previous exception or the “Add exception” button).

5. **Dynamic list management.**
   - Wrap the exceptions container in `aria-live="polite"` to announce adds/removals.
   - After adding an exception, move focus to the newly created “Issue description” input using `useEffect`.

6. **Submission feedback.**
   - Use `aria-live="polite"` status text for “Submitting…” and success messages.
   - Server error response should map field-level validation issues; expose them inline when available. Example: if backend returns `{ field: 'reviewer_name', message: 'Name required' }`, attach message to `reviewer-name-error`.

7. **Security considerations.**
   - Keep API key out of DOM attributes; continue reading from props/state only.

### 4.3 ARIA Attribute Decision Matrix

| Scenario | Required Attribute | Rationale |
| --- | --- | --- |
| Input needs additional helper text (“Enter your full name”). | `aria-describedby="reviewer-name-hint"` | Announces helper text after label (WCAG 3.3.2). |
| Field invalid state. | `aria-invalid="true"` + `aria-describedby` referencing error span. | Ensures SR exposes error context (WCAG 3.3.1). |
| Async status update (refresh, submission success). | `role="status" aria-live="polite"` | Announces changes without forcing focus (WCAG 4.1.3). |
| Critical blocking issue appears. | `role="alert" aria-live="assertive"` on container. | Immediate notification requirement. |
| Button toggles between “Add”/“Remove” states. | `aria-pressed` (if toggle) or textual state label. | Communicates state to SR; align with WAI-ARIA button pattern. |

Include incorrect vs correct reference for developer onboarding:

Incorrect:
````

<input placeholder="Reviewer Name *" />
```

Correct:

```tsx
<label htmlFor="reviewer-name">Reviewer Name<span aria-hidden="true">*</span></label>
<input
  id="reviewer-name"
  name="reviewer-name"
  aria-describedby="reviewer-name-hint reviewer-name-error"
  aria-invalid={Boolean(errors.reviewerName)}
  {...props}
/>
<p id="reviewer-name-hint">Enter the full legal name shown on the approval record.</p>
{errors.reviewerName && (
  <p id="reviewer-name-error" role="alert">
    {errors.reviewerName}
  </p>
)}
```

---

## 5. Verification & Quality-Control Workflow

1. **Unit/UI regression.**
   - Where stories exist, supplement Storybook with `storybook-addon-a11y` axe checks.
2. **Automated end-to-end.**
   - Run `npm run test:e2e:a11y` locally and in CI. Tests must cover:
     - ReviewDashboard initial render (no API key).
     - Post-auth state with SignOffForm visible.
     - Exception path (requiresExceptions `true`).
3. **Manual assistive tech sweep.**
   - VoiceOver (macOS): Tab/VO navigation to ensure landmarks/headings order.
   - NVDA (Windows): Form mode to validate label/description reading order.
   - JAWS (if available): List view to check progress announcements.
4. **Color contrast audit.**
   - Validate newly introduced text or focus rings meet 4.5:1 contrast ratio.
5. **Peer review loop.**
   - Accessibility specialist reviews PR checklist: semantics, labels, live regions, keyboard flows.
   - Designer verifies visual parity when replacing emoji/adding helper text.

Track all verification evidence in `docs/accessibility/CHANGELOG.md` (new subsection “FPP-04” citing test artifacts such as axe logs or screen-reader notes).

---

## 6. Documentation & Long-Term Governance

1. **Changelog entry.** After implementation, append:
   - Date, author, summary of ARIA/semantic upgrades.
   - Links to E2E test run (`npm run test:e2e:a11y`) and manual SR notes.
2. **Reusable primitives.**
   - Introduce or update a shared `AccessibleField` component encapsulating label/error wiring to avoid drift.
   - Add lint rule (e.g., custom ESLint or jsx-a11y extension) verifying `aria-describedby` references valid ids when `aria-invalid` is true.
3. **Documentation.**
   - Update `A11Y_IMPLEMENTATION_SUMMARY.md` with architectural rationale so future PRs align.
   - Embed spec excerpts inside component READMEs (if present) or docstrings referencing this file.
4. **Maintenance hooks.**
   - Add CI guard that fails when `npm run test:e2e:a11y` not executed (e.g., require artifact upload).
   - Encourage adoption of `@testing-library/jest-dom` assertions like `toHaveAccessibleName`.

---

## 7. Rollout Checklist

1. Refactor `ReviewDashboard.tsx` semantics per §4.1, verifying no visual regressions.
2. Upgrade `SignOffForm.tsx` per §4.2 (labels, errors, dynamic messaging).
3. Implement shared utilities / lint automation from §6.
4. Execute verification suite (§5) and capture artifacts.
5. Update `docs/accessibility/CHANGELOG.md` + cross-reference this spec.
6. Obtain peer review sign-off (frontend + accessibility specialist).
7. Close FPP-04 with evidence bundle (test screenshots/logs) archived in `reports/` if standard practice.

Delivering against this specification ensures the Review Dashboard and Sign-Off experience remain WCAG-compliant, transparent for auditors, and maintainable for future @quantumpoly releases.
