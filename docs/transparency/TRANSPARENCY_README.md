# Transparency & Multi-Analytics Framework — Developer Guide

**Block 9.3 Implementation Guide**  
**Version:** 1.0.0  
**Last Updated:** 2025-10-27

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Analytics Provider Configuration](#analytics-provider-configuration)
3. [Dashboard Data Refresh](#dashboard-data-refresh)
4. [Ledger Verification](#ledger-verification)
5. [API Usage](#api-usage)
6. [Component Integration](#component-integration)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Verify ledger integrity
npm run ethics:verify-ledger -- --scope=all

# Run tests
npm run test:analytics
npm run test:a11y

# Build and start
npm run build
npm start
```

### Access Points

- **Transparency Dashboard:** `http://localhost:3000/[locale]/governance/dashboard`
- **Verification API:** `http://localhost:3000/api/governance/verify`
- **Feed API:** `http://localhost:3000/api/governance/feed`

---

## Analytics Provider Configuration

### Environment Variables

Create or update `.env.local`:

```bash
# Analytics Provider Selection
NEXT_PUBLIC_ANALYTICS_PROVIDER=vercel  # Options: vercel, plausible, both, none

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=true

# Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_ENABLED=false
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=quantumpoly.ai
NEXT_PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io
```

### Switching Providers

#### Use Vercel Only (Default)

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=vercel
```

#### Use Plausible Only

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_PLAUSIBLE_ENABLED=true
```

#### Use Both (Comparative Research)

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=both
NEXT_PUBLIC_PLAUSIBLE_ENABLED=true
```

#### Disable All Analytics

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=none
```

### Configuration File

Edit `config/analytics.mjs` for advanced configuration:

```javascript
export const ANALYTICS_CONFIG = {
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'vercel',
  vercel: {
    enabled: true,
    debug: process.env.NODE_ENV === 'development',
  },
  plausible: {
    enabled: process.env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === 'true',
    domain: 'quantumpoly.ai',
    apiHost: 'https://plausible.io',
    trackLocalhost: false,
  },
};
```

### Testing Analytics

```bash
# Run analytics tests
npm run test:analytics

# Test consent gating
npm run test:consent
```

---

## Dashboard Data Refresh

### Automatic Refresh

The dashboard uses **hybrid caching** with 6-hour revalidation:

```typescript
// In page.tsx
export const revalidate = 21600; // 6 hours in seconds
```

### Manual Refresh

#### Option 1: Rebuild Static Pages

```bash
npm run build
```

#### Option 2: On-Demand Revalidation (Production)

```bash
curl -X POST https://quantumpoly.ai/api/revalidate?secret=YOUR_SECRET&path=/governance/dashboard
```

#### Option 3: Use Verification Widget

Users can click "Verify Now" in the dashboard to trigger live data fetch.

### Data Sources

| Component       | Data Source                       | Refresh Strategy    |
| --------------- | --------------------------------- | ------------------- |
| EII Chart       | `governance/ledger/ledger.jsonl`  | 6-hour revalidation |
| Consent Metrics | `governance/consent/ledger.jsonl` | 6-hour revalidation |
| Ledger Feed     | `governance/ledger/ledger.jsonl`  | 6-hour revalidation |
| Verification    | API `/api/governance/verify`      | On-demand (button)  |

---

## Ledger Verification

### Command-Line Verification

#### Verify Governance Ledger Only

```bash
npm run ethics:verify-ledger
# or
node scripts/verify-ledger.mjs --scope=governance
```

#### Verify Consent Ledger Only

```bash
node scripts/verify-ledger.mjs --scope=consent
```

#### Verify Both Ledgers (Global Merkle Root)

```bash
npm run ethics:verify-ledger -- --scope=all
```

### Expected Output

```
🔍 Transparency Ledger Verification (Block 9.3)
═══════════════════════════════════════════════════════════════════
   Scope: all
═══════════════════════════════════════════════════════════════════

📋 Verifying Governance ledger...
   ✅ Loaded 7 entries
   ✅ All entries structurally valid
   ✅ Chronological order valid
   ✅ 7 signatures valid
   ✅ Hash formats valid

📋 Verifying Consent ledger...
   ✅ Loaded 0 entries
   ⚠️  Ledger is empty (no entries to verify)

🌐 Computing Global Merkle Root...
   ✅ Global Merkle Root:
   a7c9e4d3f2b1a0c5e6d7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9

✅ Ledger Integrity Verified
═══════════════════════════════════════════════════════════════════
   All checks passed. Ledger(s) cryptographically consistent.

📊 Verification Summary:
   governance: 7 entries verified
   consent: 0 entries verified
═══════════════════════════════════════════════════════════════════
```

### Programmatic Verification

```typescript
import { verifyIntegrityLedger } from '@/lib/integrity';

const result = verifyIntegrityLedger('governance/ledger/ledger.jsonl');

if (result.verified) {
  console.log('✅ Ledger verified');
  console.log('Merkle Root:', result.merkleRoot);
  console.log('Entries:', result.totalEntries);
} else {
  console.error('❌ Verification failed');
}
```

---

## API Usage

### Verification API

```bash
# Basic verification
curl https://quantumpoly.ai/api/governance/verify

# Full verification with details
curl https://quantumpoly.ai/api/governance/verify?full=true

# Verify specific scope
curl https://quantumpoly.ai/api/governance/verify?scope=governance
curl https://quantumpoly.ai/api/governance/verify?scope=consent
curl https://quantumpoly.ai/api/governance/verify?scope=all
```

**Response:**

```json
{
  "verified": true,
  "merkleRoot": "f2d9a0859136abf362a568c273a0a9a7f2412d2cd5a46e5ec311d226f3f1a45f",
  "entries": 7,
  "lastUpdate": "2025-10-26T15:00:00Z",
  "scope": "Governance + Consent",
  "timestamp": "2025-10-27T20:05:00Z"
}
```

### Feed API

```bash
# Get recent 10 entries
curl https://quantumpoly.ai/api/governance/feed

# Get specific number of entries
curl https://quantumpoly.ai/api/governance/feed?limit=5

# Filter by entry type
curl https://quantumpoly.ai/api/governance/feed?type=legal_compliance

# Filter by date range
curl https://quantumpoly.ai/api/governance/feed?startDate=2025-10-01&endDate=2025-10-27
```

### EII History API

```bash
# Get 90-day EII history
curl https://quantumpoly.ai/api/governance/eii-history

# Get 30-day history
curl https://quantumpoly.ai/api/governance/eii-history?days=30
```

### Consent Metrics API

```bash
# Get aggregated consent metrics
curl https://quantumpoly.ai/api/governance/consent-metrics
```

---

## Component Integration

### Using EII Chart

```tsx
import { EIIChart } from '@/components/dashboard/EiiChart';
import { getIntegrityEIIHistory } from '@/lib/integrity';

export default function MyPage() {
  const eiiHistory = getIntegrityEIIHistory('governance/ledger/ledger.jsonl', 90);

  const chartData = eiiHistory.dataPoints.map((dp, index) => ({
    date: dp.date,
    eii: dp.eii,
    average: eiiHistory.rollingAverage[index]?.average,
  }));

  return <EIIChart data={chartData} showAverage={true} height={350} />;
}
```

### Using Consent Metrics

```tsx
import { ConsentMetrics } from '@/components/dashboard/ConsentMetrics';
import { getIntegrityConsentMetrics } from '@/lib/integrity';

export default function MyPage() {
  const metrics = getIntegrityConsentMetrics('governance/consent/ledger.jsonl');

  return <ConsentMetrics metrics={metrics} />;
}
```

### Using Ledger Feed

```tsx
import { LedgerFeed } from '@/components/dashboard/LedgerFeed';
import { getIntegrityRecentEntries } from '@/lib/integrity';

export default function MyPage() {
  const entries = getIntegrityRecentEntries(5, 'governance/ledger/ledger.jsonl');

  return <LedgerFeed entries={entries} locale="en" maxEntries={5} />;
}
```

### Using Verification Widget

```tsx
import { VerificationWidget } from '@/components/dashboard/VerificationWidget';

export default function MyPage() {
  return <VerificationWidget />;
}
```

---

## Troubleshooting

### Issue: Analytics not loading

**Symptoms:** Analytics scripts not appearing in page source

**Solution:**

1. Check environment variables in `.env.local`
2. Verify consent is given (check browser localStorage for `quantumpoly_consent`)
3. Check browser console for errors
4. Ensure `NEXT_PUBLIC_ANALYTICS_PROVIDER` is set correctly

```bash
# Debug analytics configuration
console.log(ANALYTICS_CONFIG);
```

### Issue: Dashboard shows "No data available"

**Symptoms:** Empty charts and widgets

**Solution:**

1. Verify ledger files exist:
   ```bash
   ls -la governance/ledger/ledger.jsonl
   ls -la governance/consent/ledger.jsonl
   ```
2. Check ledger file format (must be valid JSONL)
3. Run verification:
   ```bash
   npm run ethics:verify-ledger
   ```
4. Rebuild static pages:
   ```bash
   npm run build
   ```

### Issue: API returns 500 error

**Symptoms:** API endpoints returning server errors

**Solution:**

1. Check server logs for detailed error messages
2. Verify ledger files are readable
3. Ensure file paths are correct (relative to project root)
4. Check TypeScript compilation:
   ```bash
   npm run typecheck
   ```

### Issue: Verification fails

**Symptoms:** `npm run ethics:verify-ledger` reports errors

**Solution:**

1. Check ledger file format (valid JSONL)
2. Verify chronological order of entries
3. Check hash formats (must be 64-character hex strings)
4. Ensure required fields are present in each entry

### Issue: Consent metrics show zero users

**Symptoms:** Consent ledger appears empty

**Solution:**

1. Verify consent ledger file exists:
   ```bash
   ls -la governance/consent/ledger.jsonl
   ```
2. Check if consent events are being recorded
3. Test consent flow manually in browser
4. Check API endpoint:
   ```bash
   curl http://localhost:3000/api/consent
   ```

### Issue: EII chart not rendering

**Symptoms:** Chart component shows error or blank space

**Solution:**

1. Verify Recharts is installed:
   ```bash
   npm list recharts
   ```
2. Check for EII entries in governance ledger:
   ```typescript
   import { getEIIEntries } from '@/lib/integrity';
   console.log(getEIIEntries());
   ```
3. Ensure data format matches expected structure
4. Check browser console for React errors

---

## Development Workflow

### Adding New Ledger Entry

1. Create entry object:

   ```json
   {
     "id": "my-entry-id",
     "timestamp": "2025-10-27T20:00:00Z",
     "commit": "abc123",
     "entryType": "implementation_verification",
     "blockId": "9.3",
     "status": "approved",
     "hash": "...",
     "merkleRoot": "..."
   }
   ```

2. Append to ledger:

   ```bash
   echo '{"id":"..."}' >> governance/ledger/ledger.jsonl
   ```

3. Verify integrity:
   ```bash
   npm run ethics:verify-ledger
   ```

### Testing New Components

```bash
# Run unit tests
npm test

# Run accessibility tests
npm run test:a11y

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- path/to/test.test.ts
```

### Debugging Data Layer

```typescript
// In your component or API route
import { getIntegrityLedger, getIntegrityLedgerStats } from '@/lib/integrity';

const entries = getIntegrityLedger('governance/ledger/ledger.jsonl');
console.log('Entries:', entries);

const stats = getIntegrityLedgerStats();
console.log('Stats:', stats);
```

---

## Best Practices

### 1. Data Integrity

- Always verify ledger integrity after modifications
- Use atomic writes for ledger updates
- Maintain chronological order
- Compute hashes correctly

### 2. Privacy

- Never expose individual user data
- Aggregate consent metrics before display
- Pseudonymize user IDs
- Hash IP addresses if stored

### 3. Performance

- Use caching for expensive operations
- Implement pagination for large datasets
- Optimize chart data (limit data points)
- Use server-side rendering for initial load

### 4. Accessibility

- Include ARIA labels on all interactive elements
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG 2.2 AA)

### 5. Testing

- Write tests for all new components
- Test API endpoints with various parameters
- Verify error handling
- Test consent gating thoroughly

---

## Additional Resources

- **Main Documentation:** `BLOCK09.3_TRANSPARENCY_FRAMEWORK.md`
- **Governance Overview:** `/governance/README.md`
- **API Reference:** See individual route files in `src/app/api/governance/`
- **Component Docs:** See JSDoc comments in component files

---

## Support

For questions or issues:

- **Email:** governance@quantumpoly.ai
- **GitHub Issues:** Use label `governance:transparency`
- **Internal:** Contact Governance Officer or Web Compliance Engineer

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-27  
**Maintained By:** Web Compliance Engineer

---

_This guide is part of the QuantumPoly Transparency Framework (Block 9.3) and is continuously updated as the system evolves._
