# Newsletter API Documentation

## Overview

The QuantumPoly Newsletter API provides a robust, production-ready endpoint for managing newsletter subscriptions with enterprise-grade features including validation, rate limiting, and extensible storage backends.

### Key Features

- ✅ **Strict Validation**: Zod-based email schema validation
- ✅ **Dual-Dimensional Rate Limiting**: Per-email and per-IP protection
- ✅ **i18n-Ready**: Locale-agnostic messageKey responses (6 languages)
- ✅ **Extensible Storage**: Adapter pattern for any backend (Supabase, Firebase, MongoDB)
- ✅ **Comprehensive Testing**: 98.73% coverage with 38 test scenarios
- ✅ **Security-First**: GDPR-compliant, no client-side key exposure

---

## API Specification

### Endpoint

```
POST /api/newsletter
```

### Request Schema

```typescript
{
  "email": string // Must be valid email format
}
```

**Example Request:**
```json
{
  "email": "user@example.com"
}
```

### Response Schema

```typescript
interface NewsletterResponse {
  messageKey: string;      // i18n translation key
  debug?: {                // Only in non-production
    errorCode: string;
    timestamp: string;
  };
}
```

### HTTP Status Codes

| Status Code | Meaning | messageKey | Description |
|-------------|---------|-----------|-------------|
| **201** | Created | `newsletter.success` | Successfully subscribed |
| **400** | Bad Request | `newsletter.invalidEmail` | Invalid JSON or email format |
| **405** | Method Not Allowed | N/A | Only POST is supported (GET/PUT/DELETE/PATCH rejected) |
| **409** | Conflict | `newsletter.alreadySubscribed` | Email already exists in database |
| **429** | Too Many Requests | `newsletter.rateLimitExceeded` | Rate limit exceeded (email or IP) |
| **500** | Internal Server Error | `newsletter.serverError` | Unexpected server error |

### Response Headers

**Success (201):**
```
Content-Type: application/json
```

**Rate Limited (429):**
```
Content-Type: application/json
Retry-After: <seconds>              # Seconds until rate limit window expires
X-RateLimit-Scope: email|ip         # Which dimension triggered (dev only)
X-RateLimit-Window: 10              # Window size in seconds (dev only)
```

**Method Not Allowed (405):**
```
Allow: POST
```

---

## Architecture

### Data Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ POST /api/newsletter
     │ { "email": "..." }
     ▼
┌─────────────────────────────────────────────────────────────┐
│  API Route Handler (src/app/api/newsletter/route.ts)        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: Parse JSON                                          │
│    └─► Invalid JSON → 400 (invalidEmail)                     │
│                                                               │
│  Step 2: Zod Validation                                      │
│    └─► Schema Mismatch → 400 (invalidEmail)                  │
│                                                               │
│  Step 3: Normalize Email (trim, lowercase)                   │
│                                                               │
│  Step 4: Rate Limit Check (Email)                            │
│    ├─► In-Memory Map (Dev)                                   │
│    │   └─► Within 10s window? → 429 (rateLimitExceeded)     │
│    └─► Redis (Production - Future)                           │
│                                                               │
│  Step 5: Rate Limit Check (IP)                               │
│    ├─► Extract IP (x-forwarded-for, x-real-ip)              │
│    └─► Within 10s window? → 429 (rateLimitExceeded)         │
│                                                               │
│  Step 6: Duplicate Check                                     │
│    ├─► Storage Adapter (Interface Abstraction)               │
│    │   └─► exists(email) → true? → 409 (alreadySubscribed)  │
│    └─► Implementation: In-Memory Map | Supabase | Custom     │
│                                                               │
│  Step 7: Store Subscription                                  │
│    ├─► Storage Adapter                                       │
│    │   └─► add(email)                                        │
│    └─► Update Rate Limit Timestamps                          │
│                                                               │
│  Step 8: Return Success                                      │
│    └─► 201 { messageKey: "newsletter.success" }             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Storage Backend (Adapter Pattern)                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Current: In-Memory Map (Development)                         │
│  Future:  Supabase | Firebase | MongoDB | Prisma | Custom    │
│                                                                │
│  Interface: NewsletterStorageAdapter                          │
│    - add(email: string): Promise<void>                        │
│    - exists(email: string): Promise<boolean>                  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Client Receives Response                                     │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Resolves messageKey via next-intl:                           │
│    newsletter.success → "Successfully subscribed!"            │
│    newsletter.invalidEmail → "Please provide a valid email." │
│    newsletter.alreadySubscribed → "Email already subscribed." │
│    newsletter.rateLimitExceeded → "Please wait and retry."   │
│    newsletter.serverError → "Unexpected error occurred."     │
│                                                                │
│  Displays localized message in user's language (en/de/es/...)│
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### API Route Handler
- **Request Parsing**: JSON deserialization and error handling
- **Validation**: Zod schema enforcement for email format
- **Rate Limiting**: Dual-dimensional abuse prevention (email + IP)
- **Business Logic**: Orchestrates duplicate checks and subscription storage
- **Error Mapping**: Converts exceptions to appropriate HTTP status codes
- **i18n Integration**: Returns messageKeys instead of raw text

#### Storage Adapter
- **Abstraction**: Decouples storage implementation from business logic
- **Interface Contract**: Enforces `add()` and `exists()` methods
- **Error Handling**: Translates backend-specific errors to standard exceptions
- **Extensibility**: Enables swapping backends without route changes

#### Rate Limiter
- **Email Dimension**: Prevents single email spam (10-second window)
- **IP Dimension**: Prevents single IP abuse (10-second window)
- **Current**: In-memory Maps for development
- **Future**: Redis-backed distributed rate limiting

---

## Storage Adapter Pattern

### Interface Specification

The Newsletter API uses an adapter pattern to support multiple storage backends. Any storage implementation must conform to this interface:

```typescript
/**
 * NewsletterStorageAdapter Interface
 * 
 * Abstraction layer for newsletter subscription storage.
 * Implementations must handle email normalization, duplicate detection,
 * and graceful error handling.
 */
export interface NewsletterStorageAdapter {
  /**
   * Adds a new email subscription to storage
   * 
   * @param email - Normalized email address (lowercase, trimmed)
   * @throws {Error} 'DUPLICATE_EMAIL' if email already exists
   * @throws {Error} Other storage-specific errors
   */
  add(email: string): Promise<void>;

  /**
   * Checks if an email already exists in storage
   * 
   * @param email - Normalized email address (lowercase, trimmed)
   * @returns true if email exists, false otherwise
   * @throws {Error} Storage query errors
   */
  exists(email: string): Promise<boolean>;
}
```

### Error Handling Contract

Adapter implementations must follow this error mapping:

| Error Type | Error Message/Code | API Response |
|------------|-------------------|--------------|
| Duplicate email | `'DUPLICATE_EMAIL'` or database unique constraint | 409 Conflict |
| Connection failure | Any connection/timeout error | 500 Internal Server Error |
| Query error | Database query errors | 500 Internal Server Error |

### Current Implementation: In-Memory Adapter

The default implementation uses JavaScript Maps for rapid prototyping:

```typescript
// Current: In-memory storage (src/app/api/newsletter/route.ts)
const subscribers = new Map<string, number>();

// Implicit adapter interface:
function add(email: string): void {
  subscribers.set(email, Date.now());
}

function exists(email: string): boolean {
  return subscribers.has(email);
}
```

**Limitations:**
- ❌ Data lost on server restart
- ❌ Not shared across serverless instances
- ❌ No persistence layer
- ✅ Fast for development and testing

---

## Supabase Adapter Blueprint

### Production-Ready Implementation

Create a new file: `src/lib/newsletter-supabase-adapter.ts`

```typescript
/**
 * Supabase Storage Adapter for Newsletter Subscriptions
 * 
 * Production-grade implementation using Supabase as the backend.
 * Handles database operations, error mapping, and connection management.
 * 
 * @module NewsletterSupabaseAdapter
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Storage adapter interface (import from shared types)
 */
export interface NewsletterStorageAdapter {
  add(email: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}

/**
 * Database row type for newsletter_subscribers table
 */
interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  ip_address?: string;
  created_at: string;
}

/**
 * Creates a Supabase-backed storage adapter instance
 * 
 * @returns NewsletterStorageAdapter implementation
 * @throws {Error} If SUPABASE_URL or SUPABASE_SERVICE_KEY are not set
 * 
 * @example
 * ```typescript
 * // In API route
 * import { createSupabaseAdapter } from '@/lib/newsletter-supabase-adapter';
 * 
 * const storage = createSupabaseAdapter();
 * 
 * try {
 *   await storage.add('user@example.com');
 *   console.log('Subscription successful');
 * } catch (error) {
 *   if (error.message === 'DUPLICATE_EMAIL') {
 *     // Handle duplicate
 *   }
 * }
 * ```
 */
export function createSupabaseAdapter(): NewsletterStorageAdapter {
  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'
    );
  }

  // Initialize Supabase client with service role key (server-side only)
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    /**
     * Adds a new email subscription
     * 
     * @param email - Normalized email address
     * @throws {Error} 'DUPLICATE_EMAIL' if email already exists (Postgres 23505)
     * @throws {Error} Database connection or query errors
     */
    async add(email: string): Promise<void> {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          subscribed_at: new Date().toISOString(),
          // Optional: store IP for analytics (requires parameter)
          // ip_address: ipAddress,
        });

      if (error) {
        // Map Postgres unique constraint violation to standard error
        if (error.code === '23505') {
          throw new Error('DUPLICATE_EMAIL');
        }

        // Log and rethrow other errors
        console.error('[Supabase Adapter] Insert failed:', error);
        throw new Error(`Supabase insert failed: ${error.message}`);
      }
    },

    /**
     * Checks if an email exists in storage
     * 
     * @param email - Normalized email address
     * @returns true if email exists, false otherwise
     * @throws {Error} Database query errors (except 'not found')
     */
    async exists(email: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        // PGRST116 = "not found" error from PostgREST, which is expected
        if (error.code === 'PGRST116') {
          return false;
        }

        // Log and rethrow actual errors
        console.error('[Supabase Adapter] Query failed:', error);
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      return !!data;
    },
  };
}
```

### Integration with API Route

Update `src/app/api/newsletter/route.ts` to use the adapter:

```typescript
import { createSupabaseAdapter } from '@/lib/newsletter-supabase-adapter';

// Replace in-memory Map with Supabase adapter
const storage = createSupabaseAdapter();

// In POST handler, replace duplicate check:
// OLD:
// const alreadyExists = subscribers.has(emailKey);

// NEW:
const alreadyExists = await storage.exists(emailKey);

// Replace subscription storage:
// OLD:
// subscribers.set(emailKey, now);

// NEW:
await storage.add(emailKey);
```

---

## Database Schema

### Supabase Table Definition

Run this SQL in the Supabase SQL Editor to create the required table:

```sql
-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
  -- Primary key: UUID v4
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Email address: unique, not null, indexed
  email TEXT UNIQUE NOT NULL,
  
  -- Subscription timestamp
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Optional: IP address for analytics and abuse detection
  ip_address TEXT,
  
  -- Record creation timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast email lookups (enforced by UNIQUE constraint)
-- Postgres automatically creates an index for UNIQUE constraints,
-- but we document it here for clarity
CREATE INDEX IF NOT EXISTS idx_newsletter_email 
  ON newsletter_subscribers(email);

-- Optional: Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at 
  ON newsletter_subscribers(subscribed_at DESC);

-- Optional: Row Level Security (RLS) policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for API route)
CREATE POLICY "Service role full access" 
  ON newsletter_subscribers
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can only read (for admin dashboard)
CREATE POLICY "Authenticated read access" 
  ON newsletter_subscribers
  FOR SELECT 
  TO authenticated
  USING (true);
```

### Schema Design Rationale

| Column | Type | Purpose | Notes |
|--------|------|---------|-------|
| `id` | UUID | Primary key | Auto-generated, immutable |
| `email` | TEXT | Subscriber email | UNIQUE constraint prevents duplicates |
| `subscribed_at` | TIMESTAMPTZ | When user subscribed | Defaults to now(), useful for analytics |
| `ip_address` | TEXT | Client IP (optional) | For abuse detection and analytics |
| `created_at` | TIMESTAMPTZ | Record creation time | Audit trail, defaults to now() |

### Data Retention Considerations

For GDPR compliance, consider implementing:

1. **Unsubscribe Mechanism**: Add `unsubscribed_at` column
2. **Data Deletion**: Scheduled job to purge old unsubscribed emails
3. **Anonymization**: Hash IP addresses or remove after N days

---

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root (never commit this file):

```bash
# Supabase Configuration (Production)
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key-here"

# Note: Use SUPABASE_SERVICE_KEY, not SUPABASE_ANON_KEY
# Service role key bypasses RLS and has full database access
# Only use server-side, never expose to client
```

### Local Development Setup

1. **Create Supabase Project**:
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Copy project URL and service role key

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Initialize Database**:
   - Navigate to SQL Editor in Supabase Dashboard
   - Run the schema SQL from the section above

4. **Verify Connection**:
   ```bash
   npm run dev
   # Test subscription: POST http://localhost:3000/api/newsletter
   ```

### Production Deployment (Vercel)

1. **Set Environment Variables**:
   - Navigate to Vercel Project Settings → Environment Variables
   - Add `SUPABASE_URL` (visible to all environments)
   - Add `SUPABASE_SERVICE_KEY` (mark as secret)

2. **Security Best Practices**:
   - ✅ Use service role key only on server-side API routes
   - ✅ Never expose service key in client-side code
   - ✅ Rotate keys periodically (quarterly recommended)
   - ✅ Enable Supabase RLS policies for additional protection
   - ✅ Monitor API usage in Supabase dashboard

3. **Deployment Verification**:
   ```bash
   # After deployment
   curl -X POST https://your-domain.vercel.app/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

---

## Internationalization (i18n) Integration

### Error Message Mapping

The API returns only `messageKey` strings, which clients resolve to localized messages using `next-intl`.

#### Complete Status → messageKey → Translation Mapping

| HTTP Status | messageKey | EN Translation | DE Translation | TR Translation |
|-------------|-----------|----------------|----------------|----------------|
| **201** | `newsletter.success` | "Successfully subscribed to our newsletter!" | "Erfolgreich für unseren Newsletter angemeldet!" | "Bültenimize başarıyla abone oldunuz!" |
| **400** | `newsletter.invalidEmail` | "Please provide a valid email address." | "Bitte geben Sie eine gültige E-Mail-Adresse an." | "Lütfen geçerli bir e-posta adresi sağlayın." |
| **409** | `newsletter.alreadySubscribed` | "This email is already subscribed." | "Diese E-Mail-Adresse ist bereits abonniert." | "Bu e-posta zaten abone." |
| **429** | `newsletter.rateLimitExceeded` | "Rate limit exceeded. Please wait before trying again." | "Ratenlimit überschritten. Bitte warten Sie, bevor Sie es erneut versuchen." | "Oran sınırı aşıldı. Lütfen tekrar denemeden önce bekleyin." |
| **500** | `newsletter.serverError` | "An unexpected error occurred. Please try again." | "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut." | "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin." |

#### Supported Locales

- 🇬🇧 **English (en)** - Default
- 🇩🇪 **German (de)** - Deutsch
- 🇪🇸 **Spanish (es)** - Español
- 🇫🇷 **French (fr)** - Français
- 🇮🇹 **Italian (it)** - Italiano
- 🇹🇷 **Turkish (tr)** - Türkçe

All translations are maintained in `src/locales/{locale}/newsletter.json`.

### Client-Side Usage Example

```typescript
// src/components/NewsletterForm.tsx
import { useTranslations } from 'next-intl';

export function NewsletterForm() {
  const t = useTranslations('newsletter');

  async function handleSubmit(email: string) {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    // Resolve messageKey to localized string
    const message = t(data.messageKey.replace('newsletter.', ''));
    
    if (response.ok) {
      // Success: "Successfully subscribed to our newsletter!"
      showSuccess(message);
    } else {
      // Error: "Please provide a valid email address."
      showError(message);
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(e.currentTarget.email.value);
    }}>
      <input 
        name="email" 
        type="email" 
        placeholder={t('emailPlaceholder')}
        aria-label={t('emailLabel')}
      />
      <button type="submit">{t('submitLabel')}</button>
    </form>
  );
}
```

---

## Rate Limiting Architecture

### Dual-Dimensional Strategy

The Newsletter API enforces rate limits on **two independent dimensions** to prevent abuse:

#### 1. Email-Based Rate Limiting
- **Window**: 10 seconds per normalized email
- **Purpose**: Prevents spam from single email address
- **Normalization**: `email.trim().toLowerCase()`
- **Scope**: Global across all IPs

#### 2. IP-Based Rate Limiting
- **Window**: 10 seconds per client IP
- **Purpose**: Prevents abuse from single source
- **IP Detection**: `x-forwarded-for` → `x-real-ip` → `x-vercel-forwarded-for`
- **Scope**: Global across all emails

### Request Evaluation Logic

```typescript
// Both dimensions must pass for request to proceed

if (emailLastSeen.has(email) && withinWindow(email)) {
  return 429; // Email dimension rate limited
}

if (ipLastSeen.has(ip) && withinWindow(ip)) {
  return 429; // IP dimension rate limited
}

// Both dimensions clear → proceed with subscription
```

### Current Implementation (Development)

**In-Memory Maps**:
```typescript
const emailLastSeen = new Map<string, number>(); // email → timestamp
const ipLastSeen = new Map<string, number>();    // ip → timestamp

function checkRateLimit(map: Map<string, number>, key: string): boolean {
  const lastSeen = map.get(key);
  if (!lastSeen) return false; // No prior request
  
  const elapsed = Date.now() - lastSeen;
  return elapsed < 10_000; // Within 10-second window
}
```

**Limitations**:
- ❌ Not shared across serverless instances
- ❌ Lost on server restart
- ❌ No distributed coordination
- ✅ Fast and simple for development

### Future Implementation (Production)

**Redis-Backed Rate Limiting**:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkRateLimit(dimension: 'email' | 'ip', key: string): Promise<boolean> {
  const redisKey = `rate:${dimension}:${key}`;
  const lastSeen = await redis.get<number>(redisKey);
  
  if (!lastSeen) {
    // First request, set timestamp with 10s expiration
    await redis.set(redisKey, Date.now(), { ex: 10 });
    return false; // Not limited
  }
  
  const elapsed = Date.now() - lastSeen;
  return elapsed < 10_000; // Within window
}
```

**Benefits**:
- ✅ Shared state across all serverless instances
- ✅ Automatic expiration with Redis TTL
- ✅ Distributed coordination
- ✅ Scales horizontally

### Rate Limit Response Headers

When rate limited (429), the API returns:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 8

{
  "messageKey": "newsletter.rateLimitExceeded"
}
```

**Development-Only Headers** (when `NODE_ENV !== 'production'`):
```http
X-RateLimit-Scope: email
X-RateLimit-Window: 10
```

### Alternative Strategies

For more sophisticated rate limiting, consider:

1. **Token Bucket Algorithm**: Allow burst requests with gradual refill
2. **Sliding Window Counters**: Smoother fairness across window boundaries
3. **Progressive Penalties**: Exponential backoff for repeat offenders
4. **CAPTCHA Integration**: Challenge suspicious patterns
5. **Allowlisting**: Bypass limits for verified partners

---

## Testing Strategy

### Test Coverage Summary

**File**: `__tests__/api/newsletter.route.test.ts`

**Coverage Metrics** (Block 4.4):
- **Statements**: 98.73% ✅
- **Branches**: 96.66% ✅
- **Functions**: 100% ✅
- **Lines**: 98.71% ✅

**Total Tests**: 38 passing

### Test Categories

#### 1. Success Scenarios (3 tests)
- ✅ Valid email subscription → 201
- ✅ Email normalization (case insensitive)
- ✅ Multiple sequential subscriptions

#### 2. Validation Errors (8 tests)
- ✅ Invalid JSON payload → 400
- ✅ Missing email field → 400
- ✅ Invalid formats (no @, missing domain, missing local) → 400
- ✅ Empty/null/non-string email → 400

#### 3. Duplicate Detection (3 tests)
- ✅ Duplicate outside rate limit window → 409
- ✅ Duplicate within rate limit window → 429
- ✅ Normalized duplicate (case insensitive)

#### 4. Rate Limiting (6 tests)
- ✅ Email dimension (10s window) → 429
- ✅ IP dimension (10s window) → 429
- ✅ Retry-After header validation
- ✅ Multiple IP header formats
- ✅ Rate limit scope indicators

#### 5. Error Handling (2 tests)
- ✅ Forced error simulation → 500
- ✅ Error recovery after failures

#### 6. HTTP Methods (4 tests)
- ✅ GET/PUT/DELETE/PATCH → 405 with Allow: POST

#### 7. Edge Cases (5 tests)
- ✅ Extremely long email addresses
- ✅ Special characters in local part
- ✅ Subdomain email addresses
- ✅ Unicode email addresses
- ✅ Cross-test isolation

#### 8. Test Utilities (4 tests)
- ✅ `resetStores()` functionality
- ✅ `setForceError()` controls
- ✅ `getSubscriberCount()` accuracy
- ✅ `isSubscribed()` checks

#### 9. Response Contract (3 tests)
- ✅ messageKey presence in all responses
- ✅ Debug info in non-production
- ✅ Content-Type header validation

### Test Utilities

The API route exports test utilities via `__test__` object:

```typescript
import { POST, __test__ } from '@/app/api/newsletter/route';

beforeEach(() => {
  __test__.resetStores(); // Clean slate for each test
});

it('handles duplicate subscriptions', async () => {
  await POST(createRequest('test@example.com'));
  
  __test__.clearRateLimits(); // Allow duplicate check outside rate limit
  
  const response = await POST(createRequest('test@example.com'));
  expect(response.status).toBe(409);
});
```

**Available Utilities**:
- `resetStores()`: Clear all in-memory state (subscribers + rate limits)
- `clearRateLimits()`: Clear only rate limit Maps (keep subscribers)
- `setForceError(boolean)`: Trigger error path for testing 500 responses
- `getSubscriberCount()`: Get current subscriber count
- `isSubscribed(email)`: Check if email is subscribed

### Running Tests

```bash
# Run all tests
npm run test

# Run Newsletter API tests only
npm run test -- __tests__/api/newsletter.route.test.ts

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch -- __tests__/api/newsletter.route.test.ts
```

---

## Security Considerations

### Server-Side Key Management

**Critical**: The `SUPABASE_SERVICE_KEY` grants full database access and **must never be exposed to client-side code**.

✅ **Safe**:
- API Routes (`src/app/api/**/route.ts`)
- Server Components (default in Next.js App Router)
- Server Actions (`'use server'` directive)

❌ **Unsafe**:
- Client Components (`'use client'` directive)
- Browser JavaScript
- Public environment variables (e.g., `NEXT_PUBLIC_*`)

### IP Address Handling

**Privacy Considerations**:
- IP addresses are **personal data** under GDPR
- Log IP addresses only for abuse detection and security
- Hash or anonymize IPs before long-term storage
- Document IP retention policies in privacy policy

**Proxy Detection**:
- `x-forwarded-for` can be spoofed if not validated
- Only trust proxy headers behind Vercel/Cloudflare
- Consider implementing IP allowlist/blocklist

### Email Validation

**Current**: Zod email schema validation
```typescript
z.string().email() // RFC 5322 compliant
```

**Additional Protections**:
- ✅ Normalize emails (trim, lowercase)
- ✅ Reject invalid formats at validation layer
- 🔄 Consider: Email verification via confirmation link
- 🔄 Consider: Disposable email detection (e.g., `10minutemail.com`)

### Rate Limiting Security

**Evasion Techniques**:
- Attackers may rotate email addresses
- VPNs/proxies can bypass IP rate limiting
- Distributed attacks may stay under thresholds

**Mitigations**:
- Implement CAPTCHA after N failed attempts
- Monitor for suspicious patterns (e.g., sequential emails)
- Add allowlist for known good actors
- Consider device fingerprinting (ethical considerations)

### Database Security (Supabase)

**Row Level Security (RLS)**:
```sql
-- Enforce RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- API route uses service role (bypasses RLS)
-- Admin dashboard uses authenticated role (restricted by RLS)
```

**Audit Logging**:
- Enable Supabase audit logs
- Monitor for unusual activity patterns
- Alert on mass deletions or data exports

---

## Monitoring and Observability

### Key Metrics to Track

1. **Subscription Rate**: Subscriptions per hour/day
2. **Error Rate**: 4xx/5xx responses as % of total requests
3. **Rate Limit Hits**: 429 responses indicating abuse or legitimate usage spikes
4. **Response Latency**: P50, P95, P99 latency for POST requests
5. **Duplicate Attempts**: 409 responses (may indicate UX issues or confusion)

### Logging Best Practices

```typescript
// In production, use structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  event: 'newsletter_subscription',
  email: hashEmail(email), // Anonymized for GDPR
  ip: hashIp(ip),           // Anonymized
  status: 201,
  duration_ms: elapsed,
}));
```

### Recommended Tools

- **Error Tracking**: [Sentry](https://sentry.io) for exception monitoring
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) for request metrics
- **Logging**: [Axiom](https://axiom.co) or [Logtail](https://betterstack.com/logtail) for structured logs
- **APM**: [OpenTelemetry](https://opentelemetry.io) for distributed tracing

---

## Future Enhancements

### Planned Features

#### Phase 1: Production Backend (Block 5)
- [ ] Supabase adapter implementation (production-ready)
- [ ] Redis-backed rate limiting with Upstash
- [ ] Email verification via confirmation links
- [ ] Unsubscribe mechanism (GDPR compliance)

#### Phase 2: Advanced Features (Block 6)
- [ ] Admin dashboard for subscriber management
- [ ] Export subscribers to CSV (with encryption)
- [ ] Webhook notifications for new subscriptions (e.g., Slack, Discord)
- [ ] Disposable email detection and blocking
- [ ] A/B testing for newsletter form variations

#### Phase 3: Scalability (Block 7+)
- [ ] Distributed rate limiting with token bucket algorithm
- [ ] Horizontal scaling with serverless functions
- [ ] CDN caching for API metadata endpoints
- [ ] Real-time subscription analytics dashboard
- [ ] ML-based fraud detection for suspicious patterns

### Alternative Adapters

The adapter pattern enables easy integration with other backends:

**Firebase Firestore**:
```typescript
export function createFirebaseAdapter(): NewsletterStorageAdapter {
  const db = getFirestore();
  const collection = db.collection('newsletter_subscribers');
  
  return {
    async add(email: string) {
      await collection.doc(email).set({ subscribed_at: new Date() });
    },
    async exists(email: string) {
      const doc = await collection.doc(email).get();
      return doc.exists;
    },
  };
}
```

**MongoDB**:
```typescript
export function createMongoAdapter(): NewsletterStorageAdapter {
  const client = new MongoClient(process.env.MONGODB_URI);
  const db = client.db('quantumpoly');
  const collection = db.collection('newsletter_subscribers');
  
  return {
    async add(email: string) {
      await collection.insertOne({ email, subscribed_at: new Date() });
    },
    async exists(email: string) {
      const doc = await collection.findOne({ email });
      return !!doc;
    },
  };
}
```

**Prisma ORM**:
```typescript
export function createPrismaAdapter(): NewsletterStorageAdapter {
  const prisma = new PrismaClient();
  
  return {
    async add(email: string) {
      await prisma.newsletterSubscriber.create({
        data: { email },
      });
    },
    async exists(email: string) {
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });
      return !!subscriber;
    },
  };
}
```

---

## Related Documentation

- **[Block 4.4 Implementation Summary](../BLOCK4.4_IMPLEMENTATION_SUMMARY.md)** - Test coverage and CI integration
- **[API Testing Guide](./API_TESTING_GUIDE.md)** - Comprehensive API testing strategies
- **[I18N Guide](./I18N_GUIDE.md)** - Internationalization patterns and translation workflow
- **[ADR-006: Multi-Agent Cognitive Architecture](./adr/ADR-006-multi-agent-cognitive-architecture.md)** - AI-supported development vision
- **[Accessibility Guide](./ACCESSIBILITY_GUIDE.md)** - WCAG compliance and a11y best practices

---

## Quick Reference

### Common Operations

**Test the API locally**:
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Check test coverage**:
```bash
npm run test:coverage -- __tests__/api/newsletter.route.test.ts
```

**Deploy to Vercel**:
```bash
vercel --prod
# Remember to set SUPABASE_URL and SUPABASE_SERVICE_KEY in dashboard
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| 400 Invalid Email | Check email format, ensure JSON is valid |
| 409 Already Subscribed | Email exists in database, check duplicate logic |
| 429 Rate Limited | Wait 10 seconds, check if client is retrying too fast |
| 500 Server Error | Check Supabase connection, review server logs |
| Missing environment variables | Verify `.env.local` exists and contains valid credentials |

---

**Documentation Version**: 1.0.0  
**Last Updated**: October 12, 2025  
**Maintainer**: CASP Team (QuantumPoly)  
**Status**: ✅ Production-Ready (with in-memory storage) | 🔄 Supabase Migration Pending

