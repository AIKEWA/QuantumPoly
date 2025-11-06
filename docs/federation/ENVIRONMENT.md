# Federation Environment Configuration

This document describes the environment variables required for Block 9.6 — Collective Ethics Graph.

---

## Required Environment Variables

### FEDERATION_API_KEY

**Purpose:** API key for partner registration endpoint  
**Required:** No (optional, disables registration endpoint if not set)  
**Format:** String (32+ characters recommended)

```bash
FEDERATION_API_KEY=your-secret-api-key-here
```

**Usage:**
- Protects `/api/federation/register` endpoint
- Required for dynamic partner registration
- Should be rotated every 90 days

**Generation:**
```bash
openssl rand -hex 32
```

---

### FEDERATION_WEBHOOK_SECRET

**Purpose:** Default HMAC secret for webhook verification  
**Required:** No (optional, can be configured per-partner)  
**Format:** String (32+ bytes recommended)

```bash
FEDERATION_WEBHOOK_SECRET=your-hmac-secret-here
```

**Usage:**
- Verifies HMAC-SHA256 signatures on webhook notifications
- Can be overridden per-partner in `config/federation-partners.json`
- Should be shared securely with federation partners

**Generation:**
```bash
openssl rand -hex 32
```

---

### FEDERATION_VERIFY_INTERVAL

**Purpose:** Verification interval in cron format  
**Required:** No (default: daily at midnight UTC)  
**Format:** Cron expression

```bash
FEDERATION_VERIFY_INTERVAL="0 0 * * *"
```

**Examples:**
- `"0 0 * * *"` — Daily at midnight UTC (default)
- `"0 */6 * * *"` — Every 6 hours
- `"0 0 * * 0"` — Weekly on Sunday at midnight
- `"0 0 1 * *"` — Monthly on the 1st at midnight

---

## Optional Environment Variables

### NODE_ENV

**Purpose:** Node environment  
**Default:** `development`  
**Values:** `development`, `production`, `test`

```bash
NODE_ENV=production
```

---

### LOG_LEVEL

**Purpose:** Logging verbosity  
**Default:** `info`  
**Values:** `debug`, `info`, `warn`, `error`

```bash
LOG_LEVEL=info
```

---

## Configuration File

Create `.env.local` in the project root:

```bash
# Federation Configuration (Block 9.6)
FEDERATION_API_KEY=your-secret-api-key-here
FEDERATION_WEBHOOK_SECRET=your-hmac-secret-here
FEDERATION_VERIFY_INTERVAL="0 0 * * *"

# Node Environment
NODE_ENV=production
LOG_LEVEL=info
```

---

## Security Best Practices

### 1. Never Commit Secrets

- Add `.env.local` to `.gitignore`
- Never commit API keys or secrets to version control
- Use environment-specific files (`.env.development`, `.env.production`)

### 2. Rotate Keys Regularly

- Rotate API keys every 90 days
- Rotate HMAC secrets every 180 days
- Document rotation in governance ledger

### 3. Use Strong Secrets

- Minimum 32 bytes (256 bits)
- Cryptographically random (use `openssl rand`)
- Avoid predictable patterns

### 4. Store Securely

- Use secure vaults (e.g., Vercel Environment Variables, AWS Secrets Manager)
- Limit access to production secrets
- Audit secret access logs

### 5. Test Configuration

```bash
# Test with dry run
npm run federation:verify:dry-run

# Verify configuration
node scripts/verify-block9.6.mjs
```

---

## Vercel Deployment

### Add Environment Variables

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `FEDERATION_API_KEY` | `your-secret-key` | Production, Preview |
| `FEDERATION_WEBHOOK_SECRET` | `your-hmac-secret` | Production, Preview |
| `FEDERATION_VERIFY_INTERVAL` | `"0 0 * * *"` | Production |

3. Redeploy the project

---

## GitHub Actions

### Add Repository Secrets

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret | Value |
|--------|-------|
| `FEDERATION_API_KEY` | `your-secret-key` |
| `FEDERATION_WEBHOOK_SECRET` | `your-hmac-secret` |

3. Secrets are automatically available in workflows

---

## Troubleshooting

### Registration Endpoint Returns 401

**Cause:** `FEDERATION_API_KEY` not set or incorrect

**Solution:**
1. Check `.env.local` file exists
2. Verify `FEDERATION_API_KEY` is set
3. Restart development server: `npm run dev`

### Webhook Verification Fails

**Cause:** HMAC signature mismatch

**Solution:**
1. Verify `FEDERATION_WEBHOOK_SECRET` matches partner's secret
2. Check signature generation (see `docs/federation/FEDERATION_README.md`)
3. Ensure payload is not modified before signature verification

### Verification Script Fails

**Cause:** Missing configuration or network issues

**Solution:**
1. Run verification script: `npm run federation:verify:dry-run`
2. Check partner endpoints are accessible
3. Review error logs

---

## Support

For questions or issues:

1. Check this documentation
2. Review `docs/federation/FEDERATION_README.md`
3. Run verification: `node scripts/verify-block9.6.mjs`
4. Contact Federation Trust Officer

---

**Last Updated:** 2025-10-26  
**Version:** 1.0.0  
**Maintained By:** Federation Trust Officer, Governance Officer

