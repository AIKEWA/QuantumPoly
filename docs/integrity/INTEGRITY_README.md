# Integrity Monitoring — Developer Guide

**Block 9.8 — Continuous Integrity & Self-Healing**

This guide provides technical documentation for developers working with the integrity monitoring system.

---

## Quick Start

### Run Integrity Verification

```bash
# Dry run (no repairs, no ledger writes)
npm run integrity:verify:dry-run

# Production run (applies repairs, writes to ledger)
npm run integrity:verify

# Check current status via API
npm run integrity:status
```

### Verification Scope

```bash
# Verify all ledgers (default)
node scripts/verify-integrity.mjs --scope=all

# Verify specific ledgers
node scripts/verify-integrity.mjs --scope=governance
node scripts/verify-integrity.mjs --scope=consent
node scripts/verify-integrity.mjs --scope=federation
node scripts/verify-integrity.mjs --scope=trust

# Multiple ledgers
node scripts/verify-integrity.mjs --scope=governance,consent
```

### Notifications

```bash
# Send notifications even in dry-run mode
node scripts/verify-integrity.mjs --dry-run --notify

# Verbose output
node scripts/verify-integrity.mjs --verbose
```

---

## Architecture

### Core Components

```
src/lib/integrity/
├── types.ts              # TypeScript type definitions
├── engine.ts             # Integrity verification engine
├── repair-manager.ts     # Conservative self-healing logic
└── notifications.ts      # Email/webhook notification system

scripts/
└── verify-integrity.mjs  # CLI verification script

src/app/api/integrity/
└── status/
    └── route.ts          # Public integrity status API

.github/workflows/
└── integrity-verification.yml  # Daily automated verification
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Scheduled Trigger (00:00 UTC) or Manual Run             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Integrity Engine (engine.ts)                             │
│    - Read ledgers (governance, consent, federation, trust)  │
│    - Verify hashes, timestamps, references                  │
│    - Classify issues (auto-repairable vs. escalate)         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Repair Manager (repair-manager.ts)                       │
│    - Attempt conservative repairs                           │
│    - Create autonomous_repair ledger entries                │
│    - Escalate critical issues                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Notification System (notifications.ts)                   │
│    - Send email to GOVERNANCE_OFFICER_EMAIL                 │
│    - Send webhook to INTEGRITY_WEBHOOK_URL                  │
│    - Log to console                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Report Generation                                         │
│    - Save JSON report to governance/integrity/reports/      │
│    - Upload as GitHub Actions artifact                       │
│    - Expose via /api/integrity/status                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Required

```env
# Email for critical notifications
GOVERNANCE_OFFICER_EMAIL=governance@quantumpoly.ai
```

### Optional

```env
# Webhook notifications
INTEGRITY_WEBHOOK_URL=https://example.com/webhooks/integrity
INTEGRITY_WEBHOOK_SECRET=your-hmac-secret-here
```

---

## Issue Classifications

### Auto-Repairable (Conservative Scope)

#### `stale_date`

**Description:** Review date is overdue  
**Action:** Update to `ATTENTION_REQUIRED`  
**Example:**

```json
{
  "classification": "stale_date",
  "original_state": { "next_review": "2025-05-01" },
  "proposed_state": { "next_review": "ATTENTION_REQUIRED" }
}
```

### Escalate Immediately

#### `hash_mismatch`

**Description:** Hash doesn't match expected value  
**Action:** Create escalation entry, notify  
**Severity:** Critical

#### `missing_reference`

**Description:** Referenced document not found  
**Action:** Create escalation entry, notify  
**Severity:** High

#### `integrity_break`

**Description:** Structural ledger corruption  
**Action:** Create escalation entry, notify  
**Severity:** Critical

#### `compliance_downgrade`

**Description:** Silent compliance stage downgrade  
**Action:** Create escalation entry, notify  
**Severity:** High

#### `attestation_expired`

**Description:** Trust proof expired (>90 days)  
**Action:** Create escalation entry, notify  
**Severity:** Medium

#### `federation_stale`

**Description:** Federation verification outdated (>2 days)  
**Action:** Create escalation entry, notify  
**Severity:** Medium

---

## Autonomous Repair Entries

### Entry Structure

```typescript
interface AutonomousRepairEntry {
  entry_id: string; // "autonomous_repair-{ISO}-{uuid}"
  ledger_entry_type: 'autonomous_repair';
  block_id: '9.8';
  title: string;
  status: 'applied' | 'pending_human_review' | 'resolved' | 'rejected';
  applied_at: string;
  responsible_roles: string[];
  issue_classification: IssueClassification;
  original_state: Record<string, any>;
  new_state: Record<string, any>;
  rationale: string;
  requires_followup_by?: string;
  followup_owner?: string;
  hash: string;
  merkleRoot: string;
  signature: string | null;
}
```

### Query Repair Entries

```typescript
import { getRecentRepairs, getPendingRepairs } from '@/lib/integrity/repair-manager';

// Get last 10 repairs
const recentRepairs = getRecentRepairs(10);

// Get pending human reviews
const pendingRepairs = getPendingRepairs();

// Count open issues by classification
const openIssueCounts = countOpenIssues();
```

---

## Public API

### GET /api/integrity/status

**Rate Limit:** 60 requests/minute per IP  
**Cache:** 5 minutes  
**CORS:** Public access

**Response:**

```typescript
interface IntegrityStatusResponse {
  timestamp: string;
  system_state: 'healthy' | 'degraded' | 'attention_required';
  last_verification: string;
  verification_scope: string[];
  ledger_status: {
    governance: 'valid' | 'degraded' | 'critical';
    consent: 'valid' | 'degraded' | 'critical';
    federation: 'valid' | 'degraded' | 'critical';
    trust_proofs: 'valid' | 'degraded' | 'critical';
  };
  open_issues: Array<{
    classification: string;
    count: number;
    severity: string;
    summary: string;
  }>;
  recent_repairs: Array<{
    timestamp: string;
    classification: string;
    status: string;
    summary: string;
  }>;
  pending_human_reviews: number;
  global_merkle_root: string;
  compliance_baseline: string;
  privacy_notice: string;
  documentation_url: string;
}
```

**Example:**

```bash
curl http://localhost:3000/api/integrity/status | jq .
```

---

## GitHub Actions Workflow

### Manual Trigger

1. Go to **Actions** → **Integrity Verification**
2. Click **Run workflow**
3. Select options:
   - **dry_run**: `true` (no repairs) or `false` (apply repairs)
   - **notify**: `true` (send notifications) or `false` (silent)
   - **scope**: `all`, `governance`, `consent`, `federation`, or `trust`
4. Click **Run workflow**

### View Results

1. Click on workflow run
2. View **Summary** for high-level status
3. Download **integrity-report-{run_number}** artifact for detailed JSON report
4. Check **Commit** tab for ledger updates (if not dry-run)

---

## Troubleshooting

### Issue: Verification fails with "Ledger file not found"

**Solution:** Ensure ledger files exist:

```bash
ls -la governance/ledger/ledger.jsonl
ls -la governance/consent/ledger.jsonl
ls -la governance/federation/ledger.jsonl
ls -la governance/trust-proofs/active-proofs.jsonl
```

### Issue: Notifications not sent

**Solution:** Check environment variables:

```bash
echo $GOVERNANCE_OFFICER_EMAIL
echo $INTEGRITY_WEBHOOK_URL
echo $INTEGRITY_WEBHOOK_SECRET
```

### Issue: API returns 429 (Rate Limit Exceeded)

**Solution:** Wait 60 seconds or reduce request frequency. Rate limit is 60 requests/minute per IP.

### Issue: Repair entry not created

**Solution:** Check if running in dry-run mode:

```bash
node scripts/verify-integrity.mjs  # Production (creates entries)
node scripts/verify-integrity.mjs --dry-run  # Dry run (no entries)
```

---

## Testing

### Manual Testing

```bash
# 1. Create test issue (stale review date)
# Manually edit governance/ledger/ledger.jsonl
# Set next_review to past date

# 2. Run verification (dry run)
npm run integrity:verify:dry-run

# 3. Check report
cat governance/integrity/reports/$(date +%Y-%m-%d).json | jq .

# 4. Run verification (production)
npm run integrity:verify

# 5. Verify repair entry created
tail -1 governance/ledger/ledger.jsonl | jq .
```

### Automated Testing

```bash
# Run Playwright tests
npm run test:e2e

# Run specific integrity test
npx playwright test e2e/integrity.spec.ts
```

---

## Manual Override Procedures

### Reject Automated Repair

1. Locate repair entry in `governance/ledger/ledger.jsonl`
2. Update `status` from `pending_human_review` to `rejected`
3. Add `rejection_reason` field with explanation
4. Document decision in governance notes

### Approve Pending Repair

1. Locate repair entry in `governance/ledger/ledger.jsonl`
2. Update `status` from `pending_human_review` to `resolved`
3. Add `resolved_by` field with reviewer name
4. Add `resolved_at` field with ISO timestamp
5. Document decision in governance notes

### Disable Automated Verification

```yaml
# .github/workflows/integrity-verification.yml
on:
  # schedule:
  #   - cron: '0 0 * * *'  # Commented out
  workflow_dispatch:
```

---

## Best Practices

### 1. Review Pending Repairs Promptly

- Check daily digest emails
- Review `/api/integrity/status` regularly
- Address critical issues within SLA (1 business day)

### 2. Document Manual Overrides

- Always add rationale when rejecting repairs
- Update governance notes with context
- Maintain audit trail

### 3. Monitor System Health

- Check `/api/integrity/status` before deployments
- Review GitHub Actions workflow results
- Investigate degraded states promptly

### 4. Test Before Production

- Always run `--dry-run` first
- Review proposed repairs
- Verify repair logic is correct

### 5. Maintain Environment Variables

- Keep `GOVERNANCE_OFFICER_EMAIL` current
- Rotate `INTEGRITY_WEBHOOK_SECRET` annually
- Test webhook endpoint periodically

---

## Resources

- [Block 9.8 Documentation](../../BLOCK09.8_CONTINUOUS_INTEGRITY.md)
- [Integrity Dashboard](../../governance/integrity)
- [Public API](/api/integrity/status)
- [GitHub Actions Workflow](../../.github/workflows/integrity-verification.yml)

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0  
**Maintainer:** Integrity Engineering Team
