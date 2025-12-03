# Block 9.4 — Public Ethics API & Autonomous Ethical Reporting Framework

**Status:** ✅ **COMPLETE**  
**Date:** 2025-10-28  
**Version:** 1.0.0  
**Block ID:** 9.4

---

## Executive Summary

Block 9.4 establishes **Transparency Stage IV — Autonomous Accountability**, transforming QuantumPoly's governance from static compliance documentation into a self-reporting, continuously verifiable transparency interface.

### What Block 9.4 Achieves

1. **Public Ethics API** (`/api/ethics/public`) — Real-time access to platform's ethical state
2. **Autonomous Reporting Service** — Monthly self-generated ethics reports with cryptographic attestation
3. **Full Ledger Integration** — Every report becomes an immutable governance event
4. **Hybrid Attestation Model** — SHA-256 hashing + optional GPG signing
5. **Regulatory Readiness** — GDPR, DSG, ePrivacy compliant transparency

> **"When Ethics Speaks: The Self-Reporting Governance Interface"**

The system now publicly states: _"I am here. I work ethically. And here is my proof."_

---

## System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /api/ethics/public          /api/ethics/report/generate        │
│  (Read-only, public)         (Manual trigger, rate-limited)     │
│                                                                  │
└────────────────┬──────────────────────────────┬─────────────────┘
                 │                              │
                 ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA AGGREGATION LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • Ledger Parser          • Consent Aggregator                  │
│  • EII Calculator         • Verification Engine                 │
│  • Report Generator       • Hash Computer                       │
│                                                                  │
└────────────────┬──────────────────────────────┬─────────────────┘
                 │                              │
                 ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOVERNANCE STORAGE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  governance/ledger/ledger.jsonl                                 │
│  governance/consent/ledger.jsonl                                │
│  reports/ethics/ETHICS_REPORT_*.{json,pdf,sig}                  │
│                                                                  │
└────────────────┬──────────────────────────────┬─────────────────┘
                 │                              │
                 ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS SCHEDULER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GitHub Actions (Monthly Cron)                                  │
│  └─> Generate Report → Sign → Commit → Verify                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Public Query** → `/api/ethics/public` → Aggregates live data → Returns JSON
2. **Scheduled Trigger** → GitHub Actions → Runs `autonomous-report.mjs`
3. **Report Generation** → Fetches data → Generates JSON + PDF → Computes hashes
4. **Signing** → Optional GPG signature → Creates `.sig` file
5. **Ledger Update** → Appends entry to `ledger.jsonl` → Includes hash + Merkle root
6. **Commit** → Reports saved to `reports/ethics/` → Pushed to repository
7. **Verification** → Independent script validates integrity → Checks hashes

---

## API Specification

### Endpoint 1: Public Ethics API

**URL:** `GET /api/ethics/public`

**Purpose:** Expose unified view of platform's ethical state for external auditors, regulators, and public transparency.

**Security:**

- Read-only
- Rate limited: 60 requests/minute per IP
- CORS enabled (`Access-Control-Allow-Origin: *`)
- Cache: 5 minutes
- Zero personal data exposure

**Response Schema:**

```typescript
{
  timestamp: string;                    // ISO 8601 timestamp
  ledger_summary: Array<{               // Last 5 governance entries
    id: string;
    timestamp: string;
    type: string;
    block: string | null;
    title: string | null;
  }>;
  consent_stats: {                      // Aggregated consent metrics
    analytics: number;                  // Opt-in rate (0-1)
    performance: number;                // Opt-in rate (0-1)
    essential: number;                  // Always 1
  };
  eii_score: {                          // Ethics Integrity Index
    current: number;                    // Current EII (0-100)
    avg90d: number;                     // 90-day rolling average
    trend: 'stable' | 'improving' | 'declining';
  };
  hash_proof: string;                   // Global Merkle root (SHA-256)
  last_verification: string;            // Last ledger update timestamp
  version: string;                      // System version
  compliance_baseline: {
    blocks: string[];                   // Implemented blocks
    regulations: string[];              // Applicable regulations
    status: string;                     // Operational status
  };
  privacy_notice: string;               // Privacy guarantee statement
  verification_url: string;             // Link to verification API
  documentation_url: string;            // Link to dashboard
}
```

**Example Request:**

```bash
curl https://www.quantumpoly.ai/api/ethics/public
```

**Example Response:**

```json
{
  "timestamp": "2025-10-28T12:00:00Z",
  "ledger_summary": [
    {
      "id": "transparency-framework-block9.3",
      "timestamp": "2025-10-27T20:00:00Z",
      "type": "transparency_extension",
      "block": "9.3",
      "title": "Transparency & Multi-Analytics Framework"
    }
  ],
  "consent_stats": {
    "analytics": 0.82,
    "performance": 0.76,
    "essential": 1
  },
  "eii_score": {
    "current": 86,
    "avg90d": 84.5,
    "trend": "improving"
  },
  "hash_proof": "f2d9a0859136abf362a568c273a0a9a7f2412d2cd5a46e5ec311d226f3f1a45f",
  "last_verification": "2025-10-27T20:00:00Z",
  "version": "Transparency Framework v0.1.0",
  "compliance_baseline": {
    "blocks": ["8.8", "9.0", "9.1", "9.2", "9.3", "9.4"],
    "regulations": ["GDPR 2016/679", "DSG 2023", "ePrivacy Directive"],
    "status": "operational"
  },
  "privacy_notice": "All data is aggregated and anonymized. No personal information is exposed.",
  "verification_url": "/api/governance/verify",
  "documentation_url": "/governance/dashboard"
}
```

---

### Endpoint 2: Manual Report Generation

**URL:** `POST /api/ethics/report/generate`

**Purpose:** Manually trigger ethics report generation (rate-limited, optional API key).

**Security:**

- Rate limited: 1 request/hour per IP
- Optional API key authentication
- All requests logged

**Request Body:**

```json
{
  "sign": true, // Enable GPG signing (optional)
  "dryRun": false // Dry run mode (optional)
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Report generated successfully",
  "report": {
    "date": "2025-10-28",
    "json_url": "/reports/ethics/ETHICS_REPORT_2025-10-28.json",
    "pdf_url": "/reports/ethics/ETHICS_REPORT_2025-10-28.pdf",
    "signature_url": "/reports/ethics/ETHICS_REPORT_2025-10-28.pdf.sig",
    "json_hash": "a9f8e7d6c5b4a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8",
    "pdf_hash": "b4fa7e7c8c2128d23a91d78b89937ea6c2c9ab0671e2e13b3835b1134d725828"
  },
  "execution": {
    "dry_run": false,
    "signed": true,
    "timestamp": "2025-10-28T12:00:00Z"
  }
}
```

---

## Hash & Merkle Proof Workflow

### Cryptographic Verification Chain

1. **Individual Hashes**
   - Each ledger entry: `SHA-256(JSON.stringify(entry))`
   - Each report file: `SHA-256(file_bytes)`

2. **Ledger Merkle Root**
   - Governance ledger: `SHA-256(hash1 + hash2 + ... + hashN)`
   - Consent ledger: `SHA-256(hash1 + hash2 + ... + hashM)`

3. **Global Merkle Root**
   - Combined: `SHA-256(governanceMerkleRoot + consentMerkleRoot)`

4. **Report Attestation**
   - PDF hash stored in ledger entry
   - Optional GPG signature for legal verifiability
   - Merkle root included in report metadata

### Verification Process

**For External Auditors:**

```bash
# 1. Download report
curl https://www.quantumpoly.ai/reports/ethics/ETHICS_REPORT_2025-10-28.pdf -o report.pdf

# 2. Compute hash
sha256sum report.pdf

# 3. Compare with ledger entry
curl https://www.quantumpoly.ai/api/governance/feed | jq '.entries[] | select(.entry_id == "ethics-report-2025-10-28")'

# 4. Verify GPG signature (if present)
curl https://www.quantumpoly.ai/reports/ethics/ETHICS_REPORT_2025-10-28.pdf.sig -o report.pdf.sig
gpg --verify report.pdf.sig report.pdf

# 5. Verify ledger integrity
npm run ethics:verify-ledger -- --scope=all
```

---

## Security Model

### Rate Limiting

| Endpoint                      | Limit       | Window   | Action on Exceed             |
| ----------------------------- | ----------- | -------- | ---------------------------- |
| `/api/ethics/public`          | 60 requests | 1 minute | HTTP 429, Retry-After: 60s   |
| `/api/ethics/report/generate` | 1 request   | 1 hour   | HTTP 429, Retry-After: 3600s |

### CORS Configuration

- **Public API:** `Access-Control-Allow-Origin: *` (public transparency)
- **Manual Trigger:** `Access-Control-Allow-Origin: *` (rate-limited)

### Privacy Guarantees

✅ **Zero Personal Data Exposure**

- No user IDs, emails, IP addresses
- No device identifiers or session tokens
- No behavioral tracking data

✅ **Aggregated Metrics Only**

- Consent statistics: opt-in rates (percentages)
- EII scores: system-level averages
- Ledger summaries: metadata only (no content)

✅ **Consent-Gated Analytics**

- Only users who opted in are counted
- Pseudonymized user IDs (not exposed)
- IP anonymization enabled

---

## Governance Rationale

### Why This Is Ethically Necessary

**1. Accountability Without Gatekeepers**

Traditional governance relies on internal audits released selectively. Block 9.4 inverts this: the system reports continuously, and external parties can verify independently.

**2. Regulatory Defensibility**

GDPR Art. 5(2) requires "demonstrable compliance." Block 9.4 provides:

- Real-time proof of data minimization
- Auditable consent management
- Cryptographic integrity verification

**3. Trust Through Transparency**

Users, regulators, and partners can:

- Query ethics state at any time
- Verify reports haven't been altered
- Audit historical governance decisions

**4. Autonomous Accountability**

The system doesn't wait for audits — it self-reports:

- Monthly ethics reports (automated)
- Ledger updates (immutable)
- Hash proofs (tamper-evident)

---

## Compliance Mapping

### GDPR 2016/679

| Article      | Requirement                        | Implementation                              |
| ------------ | ---------------------------------- | ------------------------------------------- |
| Art. 5(1)(a) | Lawfulness, fairness, transparency | Public Ethics API exposes processing basis  |
| Art. 5(1)(c) | Data minimization                  | Zero personal data in public API            |
| Art. 5(2)    | Accountability                     | Autonomous reports + cryptographic proof    |
| Art. 25      | Privacy by design                  | Aggregation at source, no raw data exposure |

### DSG 2023 (Swiss Data Protection Act)

| Article | Requirement       | Implementation                                  |
| ------- | ----------------- | ----------------------------------------------- |
| Art. 6  | Lawful processing | Consent-gated analytics, documented in ledger   |
| Art. 19 | Data security     | SHA-256 + GPG signing, Merkle root verification |
| Art. 25 | Transparency      | Public API, monthly reports, open ledger        |

### ePrivacy Directive

| Article   | Requirement      | Implementation                                     |
| --------- | ---------------- | -------------------------------------------------- |
| Art. 5(3) | Cookie consent   | Consent banner + granular controls (Block 9.2)     |
| -         | Analytics opt-in | Vercel + Plausible with consent gating (Block 9.3) |

---

## Limitations & Ethical Considerations

### 1. Ethical Sufficiency

**Question:** Does the system proactively communicate enough for external evaluation?

**Assessment:** ✅ **YES, with caveats**

- ✅ EII score is transparent and verifiable
- ✅ Consent statistics are aggregated and privacy-preserving
- ✅ Ledger entries are immutable and cryptographically attested
- ⚠️ EII calculation methodology could be more granular (future enhancement)
- ⚠️ Historical trend data limited to 90 days (could extend to 1 year)

**Mitigation:** Document EII calculation in detail (see `docs/governance/ETHICAL_SCORING_METHODOLOGY.md`)

---

### 2. Regulatory Posture

**Question:** Could a regulator consume `/api/ethics/public` as evidence without internal dumps?

**Assessment:** ✅ **YES**

- Public API provides all key metrics
- Ledger is independently verifiable
- Reports are cryptographically signed
- No selective disclosure (all data is public)

**Limitation:** Regulators may still request raw logs for incident investigation (GDPR Art. 58). This API is supplementary, not a replacement for audit cooperation.

---

### 3. Attack Surface / Misuse

**Question:** Could an attacker infer sensitive operational signals?

**Assessment:** ⚠️ **LOW RISK, but monitored**

**Potential Risks:**

- EII drops could signal security incidents → Mitigated by rate limiting and aggregation
- Consent rate changes could indicate user dissatisfaction → Public metric, acceptable transparency
- Ledger growth rate could indicate system activity → Non-sensitive metadata

**Mitigation:**

- Rate limiting prevents automated scraping
- No real-time incident data (monthly reports only)
- Aggregated metrics prevent individual user inference

---

### 4. EII Interpretability

**Question:** Would a non-technical stakeholder understand "EII = 86"?

**Assessment:** ⚠️ **PARTIALLY**

**Current State:**

- EII is a numeric score (0-100)
- Component breakdown provided (Security, Accessibility, Transparency, Compliance)
- Trend indicator (stable/improving/declining)

**Improvement Needed:**

- Add qualitative labels: "Excellent" (90+), "Good" (80-89), "Fair" (70-79), "Needs Improvement" (<70)
- Include plain-language explanation in PDF reports
- Provide comparison to industry benchmarks (future)

**Action Item:** Update PDF report generator to include EII interpretation guide.

---

## Implementation Details

### Files Created (13)

1. `src/app/api/ethics/public/route.ts` — Public Ethics API
2. `src/app/api/ethics/report/generate/route.ts` — Manual report trigger
3. `src/lib/governance/report-generator.ts` — Report generation library
4. `scripts/autonomous-report.mjs` — Autonomous reporting script
5. `scripts/verify-ethics-reporting.mjs` — Verification script
6. `.github/workflows/ethics-reporting.yml` — Scheduled workflow
7. `BLOCK09.4_PUBLIC_ETHICS_API.md` — This document
8. `docs/autonomy/ETHICS_AUTOREPORT_README.md` — Developer guide
9. `public/api-schema.json` — OpenAPI specification
10. `reports/ethics/.gitkeep` — Report storage directory
11. `__tests__/api/ethics/public.test.ts` — API tests
12. `__tests__/lib/report-generator.test.ts` — Library tests
13. `BLOCK09.4_IMPLEMENTATION_SUMMARY.md` — Implementation summary

### Files Modified (2)

1. `package.json` — Added `pdfkit`, scripts
2. `governance/ledger/ledger.jsonl` — Block 9.4 baseline entry

### Dependencies Added

**Production:**

- `pdfkit: ^0.15.0` — PDF generation

**Development:**

- `@types/pdfkit: ^0.13.0` — TypeScript definitions

---

## Usage Instructions

### For Developers

**Generate Report (Dry Run):**

```bash
npm run ethics:report:dry-run
```

**Generate Report (Production):**

```bash
npm run ethics:report
```

**Generate Report (With GPG Signing):**

```bash
npm run ethics:report -- --sign
```

**Verify Reporting System:**

```bash
npm run ethics:verify-reporting
```

**Run Tests:**

```bash
npm run test:ethics-api
```

---

### For External Auditors

**Query Public API:**

```bash
curl https://www.quantumpoly.ai/api/ethics/public | jq .
```

**Download Latest Report:**

```bash
# Find latest report date
LATEST=$(curl https://www.quantumpoly.ai/api/governance/feed | jq -r '.entries[] | select(.ledger_entry_type == "ethics_reporting") | .approved_date' | head -1)

# Download PDF
curl https://www.quantumpoly.ai/reports/ethics/ETHICS_REPORT_${LATEST}.pdf -o ethics_report.pdf

# Download signature
curl https://www.quantumpoly.ai/reports/ethics/ETHICS_REPORT_${LATEST}.pdf.sig -o ethics_report.pdf.sig
```

**Verify Report Integrity:**

```bash
# Compute hash
sha256sum ethics_report.pdf

# Verify signature
gpg --verify ethics_report.pdf.sig ethics_report.pdf
```

---

## Next Steps

### Immediate (Before Production)

1. ✅ Install dependencies: `npm install`
2. ✅ Run tests: `npm run test:ethics-api`
3. ✅ Verify system: `npm run ethics:verify-reporting`
4. ✅ Generate test report: `npm run ethics:report:dry-run`

### Optional Enhancements (Q1 2026)

1. Add EII qualitative labels to PDF reports
2. Extend historical data retention to 1 year
3. Add industry benchmark comparisons
4. Create public QR code for report verification
5. Implement real-time EII dashboard widget

---

## Governance Approval

| Role                  | Name | Status      | Date       |
| --------------------- | ---- | ----------- | ---------- |
| Governance Officer    | EWA  | ✅ Approved | 2025-10-28 |
| Transparency Engineer | AIK  | ✅ Approved | 2025-10-28 |

**Next Review:** 2026-04-28

---

## Conclusion

Block 9.4 completes the transition from **static governance documentation** to **autonomous ethical accountability**. The system now:

- ✅ Exposes its ethical state publicly
- ✅ Generates signed reports autonomously
- ✅ Writes disclosures to immutable ledger
- ✅ Provides cryptographic proof of integrity
- ✅ Enables independent external verification

**Transparency Stage IV — Autonomous Accountability** is now operational.

---

**Document Version:** 1.0.0  
**Implementation Date:** 2025-10-28  
**Status:** ✅ **COMPLETE**  
**Compliance:** GDPR, DSG 2023, ePrivacy Directive, WCAG 2.2 AA

---

_This document is part of the QuantumPoly Governance Architecture and is maintained under version control with cryptographic integrity verification._

---

**Version:** 1.0
**Last Reviewed:** 2025-11-25
**Reviewed By:** EWA
