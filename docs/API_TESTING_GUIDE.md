# Newsletter API Testing Guide

This guide provides instructions for testing the Newsletter API endpoint manually and with automated tools.

## Quick Start

Start the development server:

```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api/newsletter`

## Manual Testing with cURL

### 1. Test Invalid Email (400 Bad Request)

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email"}' \
  -i
```

**Expected Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"messageKey":"newsletter.invalidEmail","debug":{"errorCode":"E_INVALID_EMAIL","timestamp":"..."}}
```

### 2. Test Missing Email (400 Bad Request)

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{}' \
  -i
```

**Expected Response:**
```http
HTTP/1.1 400 Bad Request

{"messageKey":"newsletter.invalidEmail","debug":{"errorCode":"E_INVALID_EMAIL","timestamp":"..."}}
```

### 3. Test Valid New Subscription (201 Created)

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' \
  -i
```

**Expected Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{"messageKey":"newsletter.success","debug":{"errorCode":"SUCCESS","timestamp":"..."}}
```

### 4. Test Rate Limiting (429 Too Many Requests)

Run the same request twice in quick succession (within 60 seconds):

```bash
# First request
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "ratelimit@example.com"}' \
  -i

# Second request immediately after
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "ratelimit@example.com"}' \
  -i
```

**Expected Response (second request):**
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{"messageKey":"newsletter.rateLimited","debug":{"errorCode":"E_RATE_LIMITED","timestamp":"..."}}
```

### 5. Test Duplicate Subscription (409 Conflict)

Wait 61+ seconds after subscribing, then try to subscribe with the same email:

```bash
# First subscription
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "duplicate@example.com"}'

# Wait 61 seconds...
sleep 61

# Try to subscribe again
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "duplicate@example.com"}' \
  -i
```

**Expected Response (second request):**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"messageKey":"newsletter.alreadySubscribed","debug":{"errorCode":"E_ALREADY_SUBSCRIBED","timestamp":"..."}}
```

### 6. Test Email Normalization

Uppercase and whitespace should be normalized:

```bash
# Subscribe with lowercase
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "normalize@example.com"}'

# Try with uppercase and whitespace (should trigger rate limit)
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "  NORMALIZE@EXAMPLE.COM  "}' \
  -i
```

**Expected:** Second request returns `429` (rate limited) because emails are normalized.

### 7. Test Unsupported HTTP Method (405 Method Not Allowed)

```bash
curl -X GET http://localhost:3000/api/newsletter -i
```

**Expected Response:**
```http
HTTP/1.1 405 Method Not Allowed
Allow: POST
Content-Type: application/json

{"error":"Method not allowed"}
```

## Testing i18n Message Key Resolution

The API returns message keys (e.g., `newsletter.success`). To verify client-side resolution:

1. Open the site in your browser at `http://localhost:3000/en`
2. Open the browser console
3. Fetch the newsletter endpoint:

```javascript
async function testNewsletterAPI() {
  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Message Key:', data.messageKey);
  
  // The messageKey should be resolved client-side using next-intl
  // e.g., t('newsletter.success') -> "Successfully subscribed to our newsletter!"
}

testNewsletterAPI();
```

## Automated Testing with Playwright

Create an E2E test in `e2e/api/newsletter.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Newsletter API', () => {
  test('returns 201 for valid email', async ({ request }) => {
    const response = await request.post('/api/newsletter', {
      data: { email: `test-${Date.now()}@example.com` }
    });
    
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.messageKey).toBe('newsletter.success');
  });

  test('returns 400 for invalid email', async ({ request }) => {
    const response = await request.post('/api/newsletter', {
      data: { email: 'invalid' }
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.messageKey).toBe('newsletter.invalidEmail');
  });

  test('returns 429 for rate limited requests', async ({ request }) => {
    const email = `ratelimit-${Date.now()}@example.com`;
    
    // First request
    await request.post('/api/newsletter', { data: { email } });
    
    // Second request (rate limited)
    const response = await request.post('/api/newsletter', { data: { email } });
    
    expect(response.status()).toBe(429);
    const data = await response.json();
    expect(data.messageKey).toBe('newsletter.rateLimited');
    expect(response.headers()['retry-after']).toBeTruthy();
  });
});
```

Run with:
```bash
npm run test:e2e
```

## Response Schema Validation

All successful and error responses follow this schema:

```typescript
interface NewsletterResponse {
  messageKey: string;  // Always present, i18n key
  debug?: {            // Only in NODE_ENV !== 'production'
    errorCode: string;
    timestamp: string;
  };
}
```

### Message Keys

| Message Key | Status | Description |
|-------------|--------|-------------|
| `newsletter.success` | 201 | Successfully subscribed |
| `newsletter.invalidEmail` | 400 | Invalid email format or missing |
| `newsletter.alreadySubscribed` | 409 | Email already subscribed (outside rate window) |
| `newsletter.rateLimited` | 429 | Too many requests (within 60s window) |
| `newsletter.serverError` | 500 | Unexpected server error |

### HTTP Headers

- **429 responses** include `Retry-After` header (seconds)
- All responses include `Content-Type: application/json`

## Production Testing

In production (`NODE_ENV=production`), the `debug` field is omitted from responses:

```json
{
  "messageKey": "newsletter.success"
}
```

To test production mode locally:

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

Then run the cURL commands above. Responses should not include `debug` fields.

## Known Limitations (In-Memory Storage)

The current implementation uses an in-memory `Map` for storage:

- **Data persists only during server runtime**
- **Server restart clears all subscriptions**
- **Not suitable for production** (use Supabase migration path)

For testing purposes, this is acceptable. See Supabase migration comments in `src/app/api/newsletter/route.ts` for production setup.

## Troubleshooting

### Issue: All requests return 500

**Check:**
- Server logs for errors
- Zod is installed: `npm list zod`
- TypeScript compilation: `npm run type-check`

### Issue: Rate limiting doesn't work

**Check:**
- Using the same normalized email (case-insensitive)
- Requests are within 60-second window
- Server hasn't restarted (clears in-memory state)

### Issue: Duplicate detection returns 429 instead of 409

This is expected behavior within the 60-second rate limit window. Wait 61+ seconds after the first subscription to test the 409 response.

## Next Steps

After manual testing confirms the API works correctly:

1. Update `NewsletterForm.tsx` to use the real API endpoint
2. Add client-side i18n resolution for message keys
3. Implement Supabase integration (see TODO comments in route.ts)
4. Add monitoring/logging in production
5. Consider implementing exponential backoff for repeat rate limit violators

