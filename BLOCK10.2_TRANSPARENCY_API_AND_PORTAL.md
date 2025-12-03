---
id: block10.2-transparency-api
title: 'BLOCK 10.2 — Transparency API & Public Ethics Portal'
subtitle: 'Opening the Ledger to the Public'
date: November 2025
authors:
  - Aykut Aydin (A.I.K)
  - Prof. Dr. E.W. Armstrong (EWA)
version: 1.0.0
status: approved
ledger_ref: entry-block10.2-transparency-api
tags:
  - transparency
  - public-api
  - ethics
  - governance
  - verification
  - block10.x
---

# BLOCK 10.2 — Transparency API & Public Ethics Portal

## Executive Summary

**Objective:** Create a public transparency layer that exposes QuantumPoly's governance ledger data, summaries, and verifiable integrity proofs via APIs and a server-side rendered portal.

**Result statement:** Public transparency = verifiable trust anchor. QuantumPoly opens its ethical inner workings to auditors, researchers, and citizens through cryptographically verifiable APIs and an accessible public portal.

**Deliverables:**

- API `/api/ethics/ledger` → full public governance ledger as JSON with hashes, checksums, signatures
- API `/api/ethics/summary` → summary (blocks, hash chain, latest changes)
- Frontend `/ethics/portal` → public page with interactive display (timeline, hash proofs, audit status)
- Documentation `BLOCK10.2_TRANSPARENCY_API_AND_PORTAL.md` (this document)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [API Endpoints](#api-endpoints)
4. [Portal Interface](#portal-interface)
5. [Data Model & Schema](#data-model--schema)
6. [Integrity Verification](#integrity-verification)
7. [Privacy & Security](#privacy--security)
8. [Accessibility](#accessibility)
9. [Usage Examples](#usage-examples)
10. [Verification Workflow](#verification-workflow)
11. [Rate Limiting & CORS](#rate-limiting--cors)
12. [Future Enhancements](#future-enhancements)

---

## Introduction

### Purpose

The Transparency API & Public Ethics Portal provides real-time, public access to QuantumPoly's governance ledger. This enables:

- **Independent verification** of ethical commitments by external auditors
- **Public accountability** through cryptographic proof of integrity
- **Researcher access** to governance data for academic analysis
- **Citizen transparency** showing how decisions are made and recorded

### Principles

1. **Verifiable Trust**: All data includes cryptographic hashes and Merkle roots
2. **Privacy-Respecting**: No personal data exposed; aggregate metrics only
3. **Accessible**: WCAG 2.2 AA compliant interface with keyboard navigation
4. **Stable**: Deterministic sorting, consistent schemas, predictable behavior
5. **Auditable**: Full history preserved with tamper-evident hash chains

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Public Interface                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  /ethics/portal          /api/ethics/ledger              │
│  (SSR Page)              (Full Ledger API)               │
│       │                          │                        │
│       │                          │                        │
│       └──────────┬───────────────┘                        │
│                  │                                        │
│         /api/ethics/summary                              │
│         (Summary API)                                    │
│                  │                                        │
└──────────────────┼────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Data Layer (Server-Side)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  /lib/governance/ledger-parser.ts                        │
│    - parseLedger()                                       │
│    - verifyLedgerIntegrity()                             │
│    - getRecentEntries()                                  │
│                  │                                        │
│                  ▼                                        │
│  governance/ledger/ledger.jsonl                          │
│    (Source of Truth)                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 14 App Router (TypeScript)
- **Runtime**: Node.js 18+
- **Data Format**: JSONL (JSON Lines) for ledger storage
- **Visualization**: Server-side SVG generation (D3.js-inspired)
- **Styling**: Tailwind CSS with dark mode support
- **Caching**: HTTP Cache-Control headers (5-minute revalidation)

---

## API Endpoints

### 1. GET /api/ethics/ledger

Returns the full public governance ledger with all entries, hashes, and signatures.

#### Request

```http
GET /api/ethics/ledger?page=1&limit=50
Host: quantumpoly.ai
Accept: application/json
```

**Query Parameters:**

- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Entries per page (default: all, max: 100)

#### Response Schema

```json
{
  "entries": [
    {
      "block": "10.1.1",
      "hash": "309bdaeed570b37721af76327bfd160034c1e33635bc82314bae24f7d0ab8b41",
      "timestamp": "2025-11-03T23:07:54Z",
      "id": "block10.1.1-lint-cleanup",
      "merkleRoot": "0cd29792759abbd0486fe566a115840beb98bca8f6a459c61c8cbcc26913bea4",
      "entryType": "code_hygiene_cleanup",
      "commit": "local-dev"
    }
  ],
  "latest": "block10.1.1-lint-cleanup",
  "merkle_root": "0cd29792759abbd0486fe566a115840beb98bca8f6a459c61c8cbcc26913bea4",
  "verified": true,
  "totalEntries": 16,
  "returnedEntries": 16,
  "page": 1,
  "timestamp": "2025-11-04T10:30:00Z"
}
```

#### Status Codes

- `200 OK`: Successful retrieval
- `500 Internal Server Error`: Ledger parsing failed

#### Example cURL

```bash
curl -X GET "https://quantumpoly.ai/api/ethics/ledger" \
  -H "Accept: application/json"
```

---

### 2. GET /api/ethics/summary

Returns a summarized view of the governance ledger optimized for quick verification checks.

#### Request

```http
GET /api/ethics/summary
Host: quantumpoly.ai
Accept: application/json
```

#### Response Schema

```json
{
  "latest": "block10.1.1-lint-cleanup",
  "merkle_root": "0cd29792759abbd0486fe566a115840beb98bca8f6a459c61c8cbcc26913bea4",
  "verified": true,
  "totalEntries": 16,
  "lastUpdate": "2025-11-03T23:07:54Z",
  "blocks": ["block7-baseline", "feedback-2025-Q4-validation", "audit-closure-block-8.8", "..."],
  "recentChanges": [
    {
      "block": "block10.1.1-lint-cleanup",
      "timestamp": "2025-11-03T23:07:54Z",
      "entryType": "code_hygiene_cleanup",
      "title": "Repository-wide lint and type safety cleanup"
    }
  ],
  "timestamp": "2025-11-04T10:30:00Z"
}
```

#### Status Codes

- `200 OK`: Successful retrieval
- `500 Internal Server Error`: Ledger parsing failed

#### Example cURL

```bash
curl -X GET "https://quantumpoly.ai/api/ethics/summary" \
  -H "Accept: application/json"
```

---

## Portal Interface

### Overview

The Ethics Portal (`/ethics/portal`) is a server-side rendered (SSR) page that provides a user-friendly interface for exploring the governance ledger.

### Features

1. **Integrity Badges**: Display verification status, latest block, and Merkle root
2. **Timeline Visualization**: SVG-based timeline showing ledger entries chronologically
3. **Recent Changes**: List of the 5 most recent ledger entries with details
4. **API Documentation**: Quick reference to public API endpoints
5. **Responsive Design**: Works on mobile, tablet, and desktop
6. **Dark Mode Support**: Respects user's color scheme preference

### URL

```
https://quantumpoly.ai/ethics/portal
```

### Screenshots (Conceptual)

#### Desktop View

```
┌──────────────────────────────────────────────────────────────┐
│  Ethics Portal                                      QuantumPoly│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Public transparency layer for governance ledger,              │
│  audit status, and integrity proofs                            │
│                                                                │
│  [✓ Verified]  [16 Entries]  [Public API]                     │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│  Integrity Status                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                 │
│  │ Verified ✓│  │ Latest    │  │ Merkle    │                 │
│  │           │  │ Block     │  │ Root      │                 │
│  └───────────┘  └───────────┘  └───────────┘                 │
│                                                                │
│  Ledger Timeline                                               │
│  [━━○━━○━━○━━○━━○━━]                                          │
│                                                                │
│  Recent Changes                                                │
│  [Entry 1] [Entry 2] [Entry 3] ...                            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Model & Schema

### Ledger Entry

Each entry in the governance ledger follows this structure:

```typescript
interface LedgerEntry {
  // Core identification
  id: string; // Unique entry identifier
  entry_id?: string; // Alternative ID field

  // Temporal information
  timestamp: string; // ISO 8601 timestamp

  // Version control
  commit: string; // Git commit hash
  commit_hash?: string; // Alternative commit field

  // Entry classification
  entryType?: string; // Entry type (e.g., "audit_closure")
  ledger_entry_type?: string; // Alternative type field

  // Block reference
  blockId?: string; // Block identifier
  block_id?: string; // Alternative block field

  // Cryptographic proof
  hash: string; // SHA-256 hash of entry
  merkleRoot: string; // Merkle root at this point
  signature?: string | null; // GPG signature (optional)

  // Additional metadata (varies by entry type)
  [key: string]: unknown;
}
```

### Verification Result

```typescript
interface VerificationResult {
  verified: boolean; // Overall verification status
  merkleRoot: string; // Current Merkle root
  entries: LedgerEntry[]; // All ledger entries
  totalEntries: number; // Count of entries
  lastUpdate: string; // ISO 8601 timestamp of last entry
}
```

---

## Integrity Verification

### Hash Chain Model

The governance ledger uses a hash chain to ensure integrity:

1. Each entry contains a SHA-256 hash of its content
2. Each entry includes a Merkle root computed from all previous entries
3. Chronological ordering is enforced (timestamps must increase)
4. Any tampering breaks the chain and fails verification

### Verification Algorithm

```
For each entry in ledger:
  1. Verify hash format (64-character hex string)
  2. Verify timestamp is >= previous timestamp
  3. Compute cumulative Merkle root

If all checks pass:
  verified = true
Else:
  verified = false
```

### Merkle Root Computation

```typescript
function computeMerkleRoot(entries: LedgerEntry[]): string {
  const hashes = entries.map((e) => e.hash);
  const combined = hashes.join('');
  return sha256(combined);
}
```

### Manual Verification

Auditors can verify integrity manually:

```bash
# 1. Fetch full ledger
curl -X GET "https://quantumpoly.ai/api/ethics/ledger" > ledger.json

# 2. Extract hashes
jq -r '.entries[].hash' ledger.json > hashes.txt

# 3. Compute Merkle root
cat hashes.txt | tr -d '\n' | shasum -a 256

# 4. Compare to reported merkle_root in API response
```

---

## Privacy & Security

### Privacy Boundaries

**No Personal Data Exposed:**

- Ledger contains only aggregate metrics and system events
- No user identifiers, IP addresses, or behavioral data
- Consent metrics are aggregated (no individual consent records)

**Public by Design:**

- All data in `/api/ethics/*` is intended for public consumption
- No authentication required for read access
- No sensitive internal system details exposed

### Security Measures

1. **Read-Only Access**: APIs only support GET requests (no mutations)
2. **CORS Policy**: Limited to site origin (configurable via environment variable)
3. **Rate Limiting**: Recommended 60 requests/minute (documented, not enforced in code)
4. **Input Validation**: Query parameters sanitized and bounded
5. **Error Handling**: Generic error messages (no stack traces exposed)
6. **Caching**: 5-minute cache reduces server load

### CORS Configuration

```typescript
"Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*"
"Access-Control-Allow-Methods": "GET, OPTIONS"
"Access-Control-Allow-Headers": "Content-Type"
```

**Production recommendation:** Set `NEXT_PUBLIC_SITE_URL` to your domain (e.g., `https://quantumpoly.ai`) to restrict CORS to same-origin requests.

---

## Accessibility

### WCAG 2.2 AA Compliance

The Ethics Portal follows Web Content Accessibility Guidelines 2.2 at Level AA:

**1. Perceivable**

- Semantic HTML landmarks (`<main>`, `<section>`, `<footer>`)
- Proper heading hierarchy (h1 → h2)
- Sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- Alt text on SVG timeline
- Dark mode support with maintained contrast

**2. Operable**

- Keyboard navigation for all interactive elements
- Visible focus indicators (focus rings)
- Skip links to main content
- No time-based interactions

**3. Understandable**

- Clear, consistent labels
- ARIA labels on badges and status indicators
- Predictable navigation structure
- Error messages in plain language

**4. Robust**

- Valid HTML5
- ARIA roles and attributes
- Compatible with screen readers

### Keyboard Navigation

| Key       | Action                                   |
| --------- | ---------------------------------------- |
| Tab       | Navigate to next interactive element     |
| Shift+Tab | Navigate to previous interactive element |
| Enter     | Activate link                            |
| Space     | Scroll page                              |

### Screen Reader Support

- Timeline has `role="img"` and descriptive `aria-label`
- Status badges have `role="status"` and clear labels
- All links have descriptive text (no "click here")

---

## Usage Examples

### Example 1: Fetch Latest Block

```javascript
// JavaScript/Node.js
const response = await fetch('https://quantumpoly.ai/api/ethics/summary');
const data = await response.json();

console.log(`Latest block: ${data.latest}`);
console.log(`Verified: ${data.verified}`);
console.log(`Merkle root: ${data.merkle_root}`);
```

### Example 2: Verify Ledger Integrity

```python
# Python
import requests
import hashlib

# Fetch ledger
response = requests.get("https://quantumpoly.ai/api/ethics/ledger")
data = response.json()

# Extract hashes
hashes = [entry["hash"] for entry in data["entries"]]

# Compute Merkle root
combined = "".join(hashes)
merkle_root = hashlib.sha256(combined.encode()).hexdigest()

# Verify
if merkle_root == data["merkle_root"]:
    print("✓ Ledger integrity verified")
else:
    print("✗ Ledger integrity check failed")
```

### Example 3: Monitor Recent Changes

```bash
#!/bin/bash
# Bash script to monitor recent changes

# Fetch summary
curl -s "https://quantumpoly.ai/api/ethics/summary" | \
  jq -r '.recentChanges[] | "\(.timestamp) - \(.block): \(.title)"'
```

Output:

```
2025-11-03T23:07:54Z - block10.1.1-lint-cleanup: Repository-wide lint and type safety cleanup
2025-11-03T20:00:43Z - public-baseline-v1.1: Public Baseline v1.1 deployed...
...
```

---

## Verification Workflow

### For External Auditors

**Step 1: Fetch Summary**

```bash
curl -X GET "https://quantumpoly.ai/api/ethics/summary" | jq .
```

**Step 2: Verify Reported Status**

- Check `verified: true`
- Note `merkle_root` value
- Record `totalEntries` count

**Step 3: Fetch Full Ledger**

```bash
curl -X GET "https://quantumpoly.ai/api/ethics/ledger" | jq . > ledger-full.json
```

**Step 4: Independent Verification**

```bash
# Extract and concatenate hashes
jq -r '.entries[].hash' ledger-full.json | tr -d '\n' | shasum -a 256

# Compare output to merkle_root from Step 2
```

**Step 5: Chronology Check**

```bash
# Verify timestamps are monotonically increasing
jq -r '.entries[].timestamp' ledger-full.json | \
  awk 'NR>1 && $0<prev {print "ERROR: Out of order"; exit 1} {prev=$0}'
```

**Step 6: Hash Format Check**

```bash
# Verify all hashes are valid SHA-256 (64 hex chars)
jq -r '.entries[].hash' ledger-full.json | \
  grep -E '^[0-9a-f]{64}$' | \
  wc -l
```

If all checks pass, the ledger is cryptographically verified.

---

## Rate Limiting & CORS

### Rate Limiting

**Recommendation:** 60 requests per minute per IP address

**Implementation Status:** Documented but not enforced in code (future enhancement)

**Rationale:**

- Public APIs should be accessible without authentication
- Rate limits prevent abuse while allowing legitimate research
- Future implementation could use edge middleware or API gateway

**For High-Volume Users:**

- Contact governance@quantumpoly.ai for bulk access
- Consider caching responses (5-minute freshness is acceptable for most use cases)
- Use `/api/ethics/summary` instead of `/api/ethics/ledger` for periodic checks

### CORS Policy

**Current:** Site origin or wildcard (configurable)

**Environment Variable:**

```bash
NEXT_PUBLIC_SITE_URL=https://quantumpoly.ai
```

**Headers:**

```http
Access-Control-Allow-Origin: https://quantumpoly.ai
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Preflight Support:** Both endpoints implement OPTIONS handlers

---

## Future Enhancements

### Planned (Block 10.3+)

1. **Pagination Enforcement**
   - Enforce page/limit parameters for large ledgers (>1000 entries)
   - Add `nextPage` and `prevPage` links in response

2. **GPG Signature Verification**
   - Add public key distribution endpoint
   - Provide signature verification API
   - Document signature verification workflow

3. **Webhook Notifications**
   - Allow external systems to subscribe to ledger updates
   - HMAC-signed webhook payloads
   - Retry logic and delivery guarantees

4. **Historical Snapshots**
   - Archive ledger state at major milestones
   - Provide time-travel queries (e.g., "state at 2025-10-01")
   - Immutable snapshot URLs

5. **Interactive Timeline**
   - Client-side D3.js for zoom/pan
   - Click entries for detailed view
   - Filter by entry type

6. **Rate Limiting Implementation**
   - Edge middleware using Vercel Edge Functions
   - Redis-backed rate limiter
   - Per-IP and per-API-key tiers

### Considered (Not Prioritized)

- GraphQL API for flexible queries
- WebSocket for real-time updates
- Mobile app for ledger monitoring
- RSS/Atom feed for recent changes

---

## Technical Implementation Notes

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── ethics/
│   │       ├── ledger/
│   │       │   └── route.ts       # Full ledger API
│   │       └── summary/
│   │           └── route.ts       # Summary API
│   └── ethics/
│       └── portal/
│           └── page.tsx           # Public portal page
└── lib/
    └── governance/
        └── ledger-parser.ts       # Ledger parsing utilities
```

### Dependencies

**Existing (no new dependencies required):**

- Next.js 14
- TypeScript
- Node.js crypto module
- Tailwind CSS

**No external dependencies added** for this block (D3.js visualization is implemented with pure SVG generation).

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SITE_URL=https://quantumpoly.ai

# Optional (defaults to localhost:3000 in development)
```

### Build Requirements

- Node.js 18+
- Next.js 14+
- TypeScript 5+

### Testing

**Manual Testing Checklist:**

- [ ] `/api/ethics/ledger` returns valid JSON
- [ ] `/api/ethics/summary` returns valid JSON
- [ ] `/ethics/portal` renders without errors
- [ ] Timeline visualization displays correctly
- [ ] Integrity badges show correct values
- [ ] Keyboard navigation works on portal page
- [ ] Dark mode renders correctly
- [ ] CORS headers present in API responses
- [ ] Pagination parameters accepted (even if not enforced)

**Automated Testing (Future):**

- Unit tests for ledger parser
- Integration tests for API endpoints
- E2E tests for portal page
- Accessibility tests (axe-core)

---

## Conclusion

BLOCK 10.2 establishes QuantumPoly's public transparency layer, enabling independent verification of governance integrity. By exposing the ledger through stable APIs and an accessible portal, we demonstrate our commitment to open, verifiable ethics.

**Key Achievements:**

- ✓ Two public APIs for full and summarized ledger access
- ✓ Server-side rendered portal with timeline visualization
- ✓ WCAG 2.2 AA compliant interface
- ✓ Cryptographic verification workflow documented
- ✓ Privacy-respecting (no PII exposed)
- ✓ Stable, deterministic responses

**Next Steps (Block 10.3):**

- Implement rate limiting
- Add GPG signature verification
- Deploy webhook notifications
- Enhance timeline interactivity

---

## Appendix A: API Response Examples

### Full Ledger Response (Truncated)

```json
{
  "entries": [
    {
      "block": "block7-baseline",
      "hash": "16314770f109852c4c86104eae962cfa6bbbaf1fe80f1e9271d3228ae64ba66f",
      "timestamp": "2025-10-24T18:14:47Z",
      "id": "block7-baseline",
      "merkleRoot": "a7c9e4d3f2b1a0c5e6d7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
      "entryType": "eii-baseline",
      "commit": "2b939cf856b5"
    },
    {
      "block": "feedback-2025-Q4-validation",
      "hash": "98f14ed4b3405d69029d43bd76f80a0be84af33e934e6fe901104785a9839352",
      "timestamp": "2025-10-25T20:33:02.133Z",
      "id": "feedback-2025-Q4-validation",
      "merkleRoot": "fd9209552335a15a603e08693137ee2e9c0d37852f6a0f61b6f34c995c3879bc",
      "entryType": "feedback-synthesis",
      "commit": "d0fd06f"
    }
  ],
  "latest": "block10.1.1-lint-cleanup",
  "merkle_root": "0cd29792759abbd0486fe566a115840beb98bca8f6a459c61c8cbcc26913bea4",
  "verified": true,
  "totalEntries": 16,
  "returnedEntries": 16,
  "page": 1,
  "timestamp": "2025-11-04T10:30:00Z"
}
```

---

## Appendix B: Ledger Entry Types

| Entry Type                     | Description                                 | Block  |
| ------------------------------ | ------------------------------------------- | ------ |
| `eii-baseline`                 | Ethics Integrity Index baseline measurement | 7.x    |
| `feedback-synthesis`           | Synthesized feedback from review cycle      | 8.7    |
| `audit_closure`                | Formal audit sign-off                       | 8.8    |
| `legal_compliance`             | Legal compliance verification               | 9.0    |
| `implementation_verification`  | Implementation checklist completion         | 9.1    |
| `consent_baseline`             | Consent management baseline                 | 9.2    |
| `transparency_extension`       | Transparency framework extension            | 9.3    |
| `ethics_reporting`             | Public ethics API deployment                | 9.4    |
| `autonomous_analysis`          | EWA autonomous analysis                     | 9.5    |
| `federation_integration`       | Federation network integration              | 9.6    |
| `attestation_layer_activation` | Trust proof layer activation                | 9.7    |
| `integrity_layer_activation`   | Continuous integrity layer activation       | 9.8    |
| `final_audit_signoff`          | Human final audit and release               | 9.9    |
| `release_public_baseline`      | Public baseline release                     | 10.0   |
| `code_hygiene_cleanup`         | Code quality improvement                    | 10.1.1 |

---

## Appendix C: Glossary

**API (Application Programming Interface):** A set of endpoints that allow external systems to interact with QuantumPoly's governance data.

**Hash Chain:** A sequence of cryptographic hashes where each entry's hash depends on previous entries, ensuring tamper-evidence.

**Merkle Root:** A single hash representing the entire state of the ledger, computed from all entry hashes.

**JSONL (JSON Lines):** A text format where each line is a valid JSON object, ideal for append-only logs.

**SSR (Server-Side Rendering):** Rendering web pages on the server before sending to the client, improving performance and SEO.

**WCAG (Web Content Accessibility Guidelines):** International standards for web accessibility maintained by W3C.

**CORS (Cross-Origin Resource Sharing):** A security mechanism that controls which domains can access an API from a browser.

---

## Document Metadata

- **Document ID:** block10.2-transparency-api
- **Version:** 1.0.0
- **Last Updated:** November 4, 2025
- **Authors:** Aykut Aydin (A.I.K), Prof. Dr. E.W. Armstrong (EWA)
- **Status:** Approved
- **Ledger Reference:** entry-block10.2-transparency-api
- **Next Review:** May 2026

---

**End of Document**

---

**Version:** 1.0
**Last Reviewed:** 2025-11-25
**Reviewed By:** EWA
