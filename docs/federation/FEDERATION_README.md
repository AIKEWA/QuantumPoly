# Federation Developer Guide

**Block 9.6 — Collective Ethics Graph**

This guide provides technical documentation for developers working with the federation system.

---

## Quick Start

### 1. Verify Federation Partners

```bash
# Verify all active partners
npm run federation:verify

# Verify specific partner
npm run federation:verify -- --partner=ETH-ZH

# Dry run (no ledger writes)
npm run federation:verify:dry-run

# Display current status
npm run federation:status
```

### 2. Add a New Partner (Static)

Edit `config/federation-partners.json`:

```json
{
  "partners": [
    {
      "partner_id": "new-partner.org",
      "partner_display_name": "New Partner Organization",
      "governance_endpoint": "https://new-partner.org/api/federation/record",
      "webhook_url": null,
      "webhook_secret": null,
      "stale_threshold_days": 30,
      "active": true,
      "added_at": "2025-11-01T00:00:00Z",
      "notes": "Academic research partner"
    }
  ]
}
```

Commit to Git for audit trail.

### 3. Add a New Partner (Dynamic)

```bash
curl -X POST https://quantumpoly.ai/api/federation/register \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "new-partner.org",
    "partner_display_name": "New Partner Organization",
    "governance_endpoint": "https://new-partner.org/api/federation/record",
    "stale_threshold_days": 30
  }'
```

---

## Verification Workflow

### Step 1: Fetch Partner Record

The verification script fetches each partner's FederationRecord from their `governance_endpoint`:

```typescript
const response = await fetch(partner.governance_endpoint, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'User-Agent': 'QuantumPoly-Federation/1.0',
  },
});

const record: FederationRecord = await response.json();
```

### Step 2: Validate Merkle Root

```typescript
// Check format (64-character hex string)
if (!/^[a-f0-9]{64}$/i.test(record.merkle_root)) {
  return TrustStatus.FLAGGED;
}
```

### Step 3: Check Staleness

```typescript
const recordTimestamp = new Date(record.timestamp);
const now = new Date();
const daysSinceUpdate = (now.getTime() - recordTimestamp.getTime()) / (1000 * 60 * 60 * 24);

const staleThreshold = partner.stale_threshold_days || 30;

if (daysSinceUpdate > staleThreshold) {
  return TrustStatus.STALE;
}
```

### Step 4: Calculate Trust Status

```typescript
enum TrustStatus {
  VALID = 'valid', // Proof consistent, no violations
  STALE = 'stale', // No recent update, overdue
  FLAGGED = 'flagged', // Inconsistency, requires review
  ERROR = 'error', // Unable to verify
}
```

### Step 5: Log Results

```typescript
const entry = {
  entry_id: `federation-verification-${Date.now()}`,
  ledger_entry_type: 'federation_verification',
  block_id: '9.6',
  title: 'Federation Partner Verification',
  status: flaggedPartners > 0 ? 'flagged' : 'approved',
  verification_results: results,
  // ... other fields
};

fs.appendFileSync('governance/federation/ledger.jsonl', JSON.stringify(entry) + '\n');
```

---

## Webhook Integration

### Setup

1. **Generate HMAC Secret:**

```bash
openssl rand -hex 32
```

2. **Configure Partner:**

```json
{
  "partner_id": "partner.org",
  "webhook_url": "https://partner.org/api/federation/notify",
  "webhook_secret": "your-hmac-secret"
}
```

3. **Send Webhook:**

```typescript
import crypto from 'crypto';

const payload = {
  partner_id: 'quantumpoly.ai',
  event_type: 'merkle_update',
  timestamp: new Date().toISOString(),
  payload: {
    merkle_root: 'new-root-hash...',
  },
};

const payloadString = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', webhookSecret).update(payloadString).digest('hex');

await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...payload,
    signature,
  }),
});
```

### Verification

```typescript
import crypto from 'crypto';

function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

---

## HMAC Signature Generation Examples

### Node.js

```javascript
const crypto = require('crypto');

const payload = JSON.stringify({
  partner_id: 'quantumpoly.ai',
  event_type: 'merkle_update',
  timestamp: new Date().toISOString(),
  payload: { merkle_root: 'abc123...' },
});

const signature = crypto.createHmac('sha256', 'your-secret-key').update(payload).digest('hex');

console.log(signature);
```

### Python

```python
import hmac
import hashlib
import json

payload = json.dumps({
    'partner_id': 'quantumpoly.ai',
    'event_type': 'merkle_update',
    'timestamp': '2025-11-01T12:00:00Z',
    'payload': {'merkle_root': 'abc123...'}
})

signature = hmac.new(
    b'your-secret-key',
    payload.encode('utf-8'),
    hashlib.sha256
).hexdigest()

print(signature)
```

### cURL

```bash
PAYLOAD='{"partner_id":"quantumpoly.ai","event_type":"merkle_update","timestamp":"2025-11-01T12:00:00Z","payload":{"merkle_root":"abc123..."}}'
SECRET="your-secret-key"

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -X POST https://quantumpoly.ai/api/federation/notify \
  -H "Content-Type: application/json" \
  -d "{\"partner_id\":\"quantumpoly.ai\",\"event_type\":\"merkle_update\",\"timestamp\":\"2025-11-01T12:00:00Z\",\"payload\":{\"merkle_root\":\"abc123...\"},\"signature\":\"$SIGNATURE\"}"
```

---

## API Usage Examples

### Verify All Partners

```bash
curl https://quantumpoly.ai/api/federation/verify | jq .
```

### Get Network Trust Summary

```bash
curl https://quantumpoly.ai/api/federation/trust | jq .
```

### Get This Instance's Record

```bash
curl https://quantumpoly.ai/api/federation/record | jq .
```

### Register New Partner (Admin)

```bash
curl -X POST https://quantumpoly.ai/api/federation/register \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "new-partner.org",
    "partner_display_name": "New Partner",
    "governance_endpoint": "https://new-partner.org/api/federation/record"
  }'
```

---

## Troubleshooting

### Partner Marked as "stale"

**Cause:** Partner hasn't updated their FederationRecord in >30 days.

**Solution:**

1. Check partner's governance endpoint: `curl https://partner.org/api/federation/record`
2. Verify timestamp is recent
3. Contact partner if timestamp is old
4. Adjust `stale_threshold_days` if partner has longer reporting cycle

### Partner Marked as "flagged"

**Cause:** Merkle root format is invalid or inconsistency detected.

**Solution:**

1. Review verification logs: `npm run federation:status -- --verbose`
2. Check partner's Merkle root format (must be 64-character hex)
3. Contact partner to investigate integrity issue
4. Document decision in federation ledger

### Partner Marked as "error"

**Cause:** Unable to reach partner's governance endpoint.

**Solution:**

1. Check endpoint accessibility: `curl -I https://partner.org/api/federation/record`
2. Verify DNS resolution
3. Check for network/firewall issues
4. Contact partner if endpoint is down

### Verification Script Fails

**Cause:** Missing dependencies or configuration.

**Solution:**

1. Install dependencies: `npm ci --legacy-peer-deps`
2. Verify partner config exists: `cat config/federation-partners.json`
3. Check federation ledger directory: `ls -la governance/federation/`
4. Run in dry-run mode: `npm run federation:verify:dry-run`

---

## Environment Variables

### Required

- `FEDERATION_API_KEY` — API key for partner registration endpoint (optional, disables endpoint if not set)

### Optional

- `FEDERATION_WEBHOOK_SECRET` — Default HMAC secret for webhooks
- `FEDERATION_VERIFY_INTERVAL` — Verification interval in cron format (default: `0 0 * * *`)

### Example `.env.local`

```bash
# Federation Configuration
FEDERATION_API_KEY=your-secret-api-key-here
FEDERATION_WEBHOOK_SECRET=your-hmac-secret-here
FEDERATION_VERIFY_INTERVAL="0 0 * * *"  # Daily at midnight UTC
```

---

## File Structure

```
governance/federation/
├── ledger.jsonl              # Federation verification events
├── trust-reports/            # Historical trust snapshots
│   └── trust-report-2025-11-01-120000.json
└── README.md                 # Federation governance docs

config/
└── federation-partners.json  # Partner configuration

src/lib/federation/
├── types.ts                  # Type definitions
├── partner-manager.ts        # Partner CRUD operations
├── verification.ts           # Verification engine
└── trust-calculator.ts       # Trust metrics

src/app/api/federation/
├── verify/route.ts           # Verification API
├── trust/route.ts            # Trust summary API
├── record/route.ts           # FederationRecord API
├── register/route.ts         # Registration API
└── notify/route.ts           # Webhook API

scripts/
├── verify-federation.mjs     # Verification script
└── federation-status.mjs     # Status display script

.github/workflows/
└── federation-verification.yml  # Daily GitHub Actions workflow
```

---

## Testing

### Unit Tests

```bash
npm test __tests__/lib/federation/
```

### API Tests

```bash
npm test __tests__/api/federation/
```

### E2E Tests

```bash
npx playwright test e2e/federation.spec.ts
```

### Manual Testing

```bash
# Dry run verification
npm run federation:verify:dry-run

# Verify specific partner
npm run federation:verify -- --partner=quantumpoly.ai

# Check status
npm run federation:status --verbose
```

---

## Security Considerations

### API Key Storage

- Never commit API keys to Git
- Use environment variables or secure vaults
- Rotate keys regularly (every 90 days)

### HMAC Secrets

- Generate strong secrets (32+ bytes)
- Use different secrets per partner
- Store securely (environment variables or vault)

### Rate Limiting

- Verification API: 60 req/min per IP
- Trust API: 60 req/min per IP
- Record API: 120 req/min per IP
- Registration API: 10 req/hour per IP
- Webhook API: 30 req/min per IP

### CORS

- All public APIs allow `Access-Control-Allow-Origin: *`
- Registration and webhook APIs require authentication

---

## Support

For questions or issues:

1. Check this documentation
2. Review `BLOCK09.6_COLLECTIVE_ETHICS_GRAPH.md`
3. Check federation ledger: `cat governance/federation/ledger.jsonl`
4. Run status check: `npm run federation:status --verbose`
5. Contact Federation Trust Officer

---

**Last Updated:** 2025-10-26  
**Version:** 1.0.0  
**Maintained By:** Federation Trust Officer, Governance Officer
