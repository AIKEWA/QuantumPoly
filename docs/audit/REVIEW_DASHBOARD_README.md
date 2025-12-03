# Review Dashboard — Developer Guide

**Block 9.9 — Human Audit & Final Review Layer**

---

## Overview

The Review Dashboard is the final human accountability checkpoint before production release. It provides a web interface for authorized reviewers to inspect system integrity, submit sign-offs, and track review history.

**URL:** `/[locale]/governance/review`

---

## Architecture

### Component Hierarchy

```
ReviewDashboardPage (Server Component)
├── Fetches initial data (status + history)
├── Checks API key configuration
└── ReviewDashboard (Client Component)
    ├── System Overview
    ├── Sign-Off Progress
    ├── IntegrityStatusPanel
    │   ├── System state display
    │   ├── Ledger health indicators
    │   ├── Open issues list
    │   └── Conditional approval warning
    ├── Blocking Issues (conditional)
    ├── API Key Input (if not authenticated)
    ├── SignOffForm
    │   ├── Reviewer details
    │   ├── Role selection
    │   ├── Decision selection
    │   ├── Exception justifications (conditional)
    │   └── Notes (optional)
    └── ReviewHistory
        └── Past sign-offs (public summaries)
```

### Data Flow

```
1. Server-side: Fetch initial data
   ├── GET /api/audit/status
   └── GET /api/audit/history

2. Client-side: Display dashboard
   ├── Show system overview
   ├── Show integrity status
   └── Show sign-off form (if authenticated)

3. User action: Submit sign-off
   ├── POST /api/audit/sign-off (with API key)
   ├── Validate submission
   ├── Write to signoffs.jsonl
   └── Refresh dashboard

4. Final step: Finalize audit
   ├── Run: npm run audit:finalize
   ├── Read all sign-offs
   ├── Generate ledger entry
   └── Append to ledger.jsonl
```

---

## API Reference

### GET `/api/audit/status`

**Description:** Returns current audit readiness state

**Authentication:** None (public)

**Caching:** 5 minutes

**Response:**

```typescript
{
  release_candidate: string;
  commit_hash: string;
  readiness_state: 'ready_for_review' | 'blocked' | 'approved';
  integrity_state: 'healthy' | 'degraded' | 'attention_required';
  required_signoffs: ReviewRole[];
  completed_signoffs: ReviewRole[];
  blocking_issues: string[];
  last_review: string | null;
  integrity_snapshot?: IntegritySnapshot;
}
```

**Example:**

```bash
curl https://quantumpoly.ai/api/audit/status | jq
```

---

### POST `/api/audit/sign-off`

**Description:** Submit a human sign-off record

**Authentication:** Required (API key)

**Request:**

```typescript
{
  reviewer_name: string;
  role: 'Lead Engineer' | 'Governance Officer' | 'Legal Counsel' | 'Accessibility Reviewer';
  review_scope: string[];
  decision: 'approved' | 'approved_with_exceptions' | 'rejected';
  exceptions?: ExceptionJustification[];
  notes?: string;
}
```

**Exception Justification:**

```typescript
{
  issue_description: string;
  rationale: string;
  mitigation_plan: string;
  mitigation_owner: string;
  deadline?: string; // ISO 8601 date
}
```

**Response:**

```typescript
{
  success: true;
  message: string;
  record: {
    review_id: string;
    role: string;
    decision: string;
    timestamp: string;
    signature_hash: string;
  }
}
```

**Example:**

```bash
curl -X POST https://quantumpoly.ai/api/audit/sign-off \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "reviewer_name": "Aykut Aydin",
    "role": "Lead Engineer",
    "review_scope": ["System Architecture", "Security Baseline"],
    "decision": "approved",
    "notes": "All technical requirements met."
  }'
```

---

### GET `/api/audit/history`

**Description:** Returns recent sign-off history (public summaries only)

**Authentication:** None (public)

**Query Parameters:**

- `limit` (optional): Number of records to return (1-50, default: 10)

**Response:**

```typescript
{
  total: number;
  limit: number;
  signoffs: PublicSignOffSummary[];
  privacy_notice: string;
}
```

**Public Sign-Off Summary:**

```typescript
{
  review_id: string;
  role: ReviewRole;
  decision: ReviewDecision;
  review_scope: string[];
  timestamp: string;
  has_exceptions: boolean;
}
```

**Example:**

```bash
curl https://quantumpoly.ai/api/audit/history?limit=5 | jq
```

---

## Environment Variables

### Required

**`REVIEW_DASHBOARD_API_KEY`**

- **Description:** API key for sign-off submission authentication
- **Format:** String (recommend 32+ characters)
- **Generation:** `openssl rand -hex 32`
- **Security:** Keep secret, rotate regularly

**Example:**

```bash
export REVIEW_DASHBOARD_API_KEY="a1b2c3d4e5f6..."
```

### Optional

**`NEXT_PUBLIC_BASE_URL`**

- **Description:** Base URL for API calls
- **Default:** `http://localhost:3000`
- **Production:** `https://www.quantumpoly.ai`

---

## Development

### Local Setup

1. **Install dependencies:**

```bash
npm install --legacy-peer-deps
```

2. **Set API key:**

```bash
export REVIEW_DASHBOARD_API_KEY="dev-key-for-testing"
```

3. **Start dev server:**

```bash
npm run dev
```

4. **Access dashboard:**

```
http://localhost:3000/en/governance/review
```

### Testing

**Run E2E tests:**

```bash
npm run audit:verify
```

**Run specific test:**

```bash
npx playwright test e2e/governance/review-dashboard.spec.ts
```

**Debug mode:**

```bash
npx playwright test --debug e2e/governance/review-dashboard.spec.ts
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

---

## Component API

### `<ReviewDashboard>`

**Props:**

```typescript
interface ReviewDashboardProps {
  initialStatus: AuditStatusResponse;
  initialHistory: PublicSignOffSummary[];
  apiKey: string | null;
}
```

**Usage:**

```tsx
<ReviewDashboard
  initialStatus={statusData}
  initialHistory={historyData}
  apiKey={null} // Client handles API key input
/>
```

---

### `<IntegrityStatusPanel>`

**Props:**

```typescript
interface IntegrityStatusPanelProps {
  snapshot: IntegritySnapshot;
}
```

**Usage:**

```tsx
<IntegrityStatusPanel snapshot={integrityData} />
```

---

### `<SignOffForm>`

**Props:**

```typescript
interface SignOffFormProps {
  integrityState: SystemState;
  apiKey: string;
  onSuccess: () => void;
}
```

**Usage:**

```tsx
<SignOffForm integrityState="healthy" apiKey="your-api-key" onSuccess={() => refreshData()} />
```

---

### `<ReviewHistory>`

**Props:**

```typescript
interface ReviewHistoryProps {
  signoffs: PublicSignOffSummary[];
}
```

**Usage:**

```tsx
<ReviewHistory signoffs={historyData} />
```

---

## Scripts

### `npm run audit:status`

**Description:** Check current audit status

**Output:** JSON with readiness state, completed sign-offs, blocking issues

**Example:**

```bash
$ npm run audit:status
{
  "release_candidate": "v1.0.0-rc1",
  "readiness_state": "ready_for_review",
  "completed_signoffs": ["Lead Engineer"],
  "blocking_issues": []
}
```

---

### `npm run audit:finalize`

**Description:** Create final ledger entry after all sign-offs complete

**Prerequisites:**

- All four required sign-offs present
- Sign-offs within last 7 days

**Output:** Ledger entry appended to `governance/ledger/ledger.jsonl`

**Example:**

```bash
$ npm run audit:finalize
🔍 Block 9.9 — Finalizing Audit
================================================================================
✅ All required roles approved: Lead Engineer, Governance Officer, Legal Counsel, Accessibility Reviewer
💾 Appending to governance ledger...
✅ Audit finalization complete!
```

---

### `npm run audit:verify`

**Description:** Run E2E tests for review dashboard

**Coverage:**

- Dashboard rendering
- Integrity integration
- Sign-off workflow
- API endpoints
- Accessibility

**Example:**

```bash
$ npm run audit:verify
Running 30 tests using 4 workers
  30 passed (45s)
```

---

### `npm run audit:a11y`

**Description:** Open manual accessibility audit documentation

**Opens:** `docs/accessibility/BLOCK09.9_MANUAL_A11Y_AUDIT.md`

---

## Troubleshooting

### Issue: "API key not configured" warning

**Cause:** `REVIEW_DASHBOARD_API_KEY` environment variable not set

**Solution:**

```bash
export REVIEW_DASHBOARD_API_KEY="$(openssl rand -hex 32)"
```

---

### Issue: Sign-off submission returns 401

**Cause:** Invalid or missing API key

**Solution:**

1. Verify API key is set in environment
2. Check key matches in request header
3. Ensure no extra whitespace in key

---

### Issue: "Missing required sign-offs" error in finalization

**Cause:** Not all four roles have approved

**Solution:**

1. Check current status: `npm run audit:status`
2. Identify missing roles
3. Obtain sign-offs from missing roles
4. Retry finalization

---

### Issue: Dashboard shows "Failed to fetch integrity status"

**Cause:** Block 9.8 integrity API not responding

**Solution:**

1. Verify server is running
2. Check `/api/integrity/status` endpoint
3. Review Block 9.8 implementation

---

### Issue: Exception field not appearing

**Cause:** System integrity state is not `attention_required`

**Solution:**

- Exception field only appears when:
  - Integrity state is `attention_required`
  - Decision is `approved`
- This is by design (conditional approval)

---

## Security Considerations

### API Key Management

**Do:**

- ✅ Use strong, random keys (32+ characters)
- ✅ Store in environment variables
- ✅ Rotate regularly (quarterly)
- ✅ Provide via secure channel (not email)
- ✅ Revoke after use (if one-time)

**Don't:**

- ❌ Commit keys to version control
- ❌ Share keys via insecure channels
- ❌ Reuse keys across environments
- ❌ Use predictable keys

### Sign-Off Integrity

**Verification:**

- Each sign-off has SHA-256 signature hash
- Hash computed from: review_id, name, role, scope, decision, timestamp, integrity_snapshot_hash
- Tampering detection via hash mismatch

**Audit Trail:**

- All sign-offs stored in append-only file
- Integrity snapshot captured at time of sign-off
- Ledger entry references all sign-offs

---

## Accessibility

### WCAG 2.2 AA Compliance

**Keyboard Navigation:**

- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals (if added)

**Screen Reader Support:**

- All headings have proper hierarchy
- Form fields have associated labels
- Status indicators have ARIA labels
- Live regions announce updates

**Color Contrast:**

- All text meets 4.5:1 (normal) or 3:1 (large)
- Status colors verified in light and dark mode

**Motion Safety:**

- No auto-playing animations
- Respects `prefers-reduced-motion`

---

## Contributing

### Adding a New Reviewer Role

1. **Update types:**

```typescript
// src/lib/audit/types.ts
export type ReviewRole =
  | 'Lead Engineer'
  | 'Governance Officer'
  | 'Legal Counsel'
  | 'Accessibility Reviewer'
  | 'New Role'; // Add here
```

2. **Update review scopes:**

```typescript
// src/components/audit/SignOffForm.tsx
const REVIEW_SCOPES: Record<ReviewRole, string[]> = {
  // ...
  'New Role': ['Scope 1', 'Scope 2'],
};
```

3. **Update required roles:**

```typescript
// src/app/api/audit/status/route.ts
const REQUIRED_SIGNOFFS: ReviewRole[] = [
  // ...
  'New Role',
];
```

4. **Update documentation:**

- `BLOCK09.9_FINAL_AUDIT_AND_HANDOFF.md`
- `governance/audits/README.md`

---

### Adding Exception Validation

1. **Update validation logic:**

```typescript
// src/lib/audit/sign-off-manager.ts
export function validateSignOffSubmission(
  submission: SignOffSubmission,
  integritySnapshot: IntegritySnapshot,
): ValidationResult {
  // Add custom validation here
}
```

2. **Update UI:**

```tsx
// src/components/audit/SignOffForm.tsx
// Add new exception fields or validation messages
```

---

## References

- **Main Documentation:** `BLOCK09.9_FINAL_AUDIT_AND_HANDOFF.md`
- **Implementation Summary:** `BLOCK09.9_IMPLEMENTATION_SUMMARY.md`
- **Accessibility Audit:** `docs/accessibility/BLOCK09.9_MANUAL_A11Y_AUDIT.md`
- **Storage Documentation:** `governance/audits/README.md`
- **E2E Tests:** `e2e/governance/review-dashboard.spec.ts`

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-11-07  
**Status:** Complete
