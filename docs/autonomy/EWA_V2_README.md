# EWA v2 Developer Guide

**Ethical Wisdom Analyzer — Version 2.0**

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Architecture](#architecture)
4. [CLI Usage](#cli-usage)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Ethical Boundaries](#ethical-boundaries)
8. [Troubleshooting](#troubleshooting)

---

## Overview

EWA v2 is a hybrid statistical + ML system that continuously analyzes governance data to detect ethical risk patterns, generate structured insights, and recommend corrective actions.

**Key Capabilities:**
- Statistical trend analysis (EII, consent, security)
- Optional ML layer (anomaly detection, forecasting)
- Multi-factor severity scoring
- Trust Trajectory Indicator (TTI) calculation
- Automated ledger integration with human oversight
- Public APIs for external verification

---

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Access to governance and consent ledgers

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Verify installation
npm run ewa:analyze -- --dry-run
```

### Environment Variables

```bash
# Optional: Enable ML layer
export EWA_ML=true

# Optional: API key for manual trigger endpoint
export EWA_ANALYZE_API_KEY=your-secret-key
```

---

## Architecture

```
EWA v2 Engine
├── Statistical Analysis Layer
│   ├── EII trend detection
│   ├── Consent stability metrics
│   └── Security posture tracking
├── Optional ML Layer (EWA_ML=true)
│   ├── Anomaly detection
│   ├── Time-series forecasting
│   └── Pattern recognition
├── Severity Scoring Engine
│   ├── Multi-factor composite
│   ├── Normalization
│   └── Human review threshold
├── Insight Generation
│   ├── Structured insights
│   ├── Evidence aggregation
│   └── Confidence scoring
├── Recommendation System
│   ├── Actionable recommendations
│   ├── Priority ranking
│   └── Role assignment
└── Approval Workflow
    ├── Auto-append (severity ≤ 0.6)
    ├── Review queue (severity > 0.6)
    └── Human approval tracking
```

---

## CLI Usage

### Analysis Commands

#### Run Analysis (Dry Run)

```bash
npm run ewa:analyze:dry-run
```

**Output:**
- Statistical analysis results
- Insights generated
- Recommendations
- No ledger writes

#### Run Analysis (Production)

```bash
npm run ewa:analyze
```

**Output:**
- Full analysis
- Auto-append insights (severity ≤ 0.6)
- Add critical insights to review queue (severity > 0.6)
- Append to governance ledger

#### Run Analysis (With ML)

```bash
npm run ewa:analyze:ml
```

**Output:**
- Statistical + ML analysis
- ML anomalies and patterns
- Enhanced insights

---

### Review Commands

#### Interactive Review

```bash
npm run ewa:review
```

**Actions:**
- `[a]pprove` — Approve insight for ledger entry
- `[r]eject` — Reject insight with reason
- `[s]kip` — Skip to next insight
- `[q]uit` — Exit review session

**Example Session:**
```
🔍 EWA v2 Review Queue
=====================

Found 2 pending review(s)

================================================================================
Review 1 of 2
================================================================================

Entry ID: review-eii-decline-a3f2b8c1
Severity: CRITICAL (score: 0.75)
Description: EII dropped 5.2% in the last 30 days

Action? [a]pprove / [r]eject / [s]kip / [q]uit: a
Reviewer name: Jane Doe
Notes (optional): Verified data sources

✅ Approved
```

---

## Configuration

### Trust Trajectory Indicator (TTI)

**File:** `src/lib/ewa/config/trustTrajectory.json`

```json
{
  "version": "1.0.0",
  "weights": {
    "eii": 0.4,
    "consent": 0.3,
    "security": 0.3
  },
  "optional_factors": {
    "eii_velocity": 0.0,
    "eii_volatility": 0.0
  },
  "thresholds": {
    "excellent": 90,
    "good": 80,
    "fair": 70,
    "needs_improvement": 0
  }
}
```

**Customization:**
- Adjust `weights` to prioritize different components
- Enable `optional_factors` for velocity/volatility adjustments
- Modify `thresholds` for qualitative labels

**Example: Security-Focused Configuration**
```json
{
  "weights": {
    "eii": 0.3,
    "consent": 0.2,
    "security": 0.5
  }
}
```

---

### Severity Thresholds

**File:** `src/lib/ewa/engine/severity.ts`

```typescript
export const SEVERITY_THRESHOLDS = {
  LOW: 0.3,
  MODERATE: 0.6,
  CRITICAL: 1.0,
};
```

**Customization:**
- Lower `MODERATE` threshold for stricter review requirements
- Raise `LOW` threshold for fewer auto-appended insights

---

## API Reference

### GET `/api/ewa/insights`

**Description:** Retrieve latest ethical insights

**Query Parameters:**
- `limit` (number, default: 20) — Maximum insights to return
- `severity` (string, optional) — Filter by severity (`low`, `moderate`, `critical`)

**Response:**
```json
{
  "timestamp": "2025-10-26T12:00:00Z",
  "insights": [
    {
      "timestamp": "2025-10-26T12:00:00Z",
      "insight_id": "eii-decline-a3f2b8c1",
      "severity": "moderate",
      "severity_score": 0.45,
      "description": "EII dropped 3.2% in the last 30 days",
      "recommended_action": "Review consent flow friction",
      "confidence": 0.91,
      "evidence": { "eii_delta_30d": -3.2 },
      "source": "statistical",
      "requires_human_review": false
    }
  ],
  "total_count": 5,
  "filtered_count": 3,
  "trust_trajectory": {
    "tti_score": 87.5,
    "trend": "improving"
  }
}
```

**Rate Limit:** 60 requests/minute per IP

**Example:**
```bash
curl "https://www.quantumpoly.ai/api/ewa/insights?limit=10&severity=critical" | jq .
```

---

### GET `/api/ewa/recommendations`

**Description:** Get actionable recommendations

**Query Parameters:**
- `limit` (number, default: 5) — Maximum recommendations
- `priority` (string, optional) — Filter by priority (`high`, `medium`, `low`)

**Response:**
```json
{
  "timestamp": "2025-10-26T12:00:00Z",
  "executive_summary": "2 high-priority issues requiring immediate attention...",
  "recommendations": [
    {
      "id": "rec-eii-improvement",
      "priority": "high",
      "category": "eii",
      "title": "Improve Ethics Integrity Index",
      "description": "EII has declined by 3.2%...",
      "action_items": [
        "Conduct accessibility audit",
        "Review transparency documentation"
      ],
      "responsible_roles": ["Governance Officer", "Accessibility Lead"],
      "estimated_impact": "high",
      "related_insights": ["eii-decline-a3f2b8c1"]
    }
  ],
  "total_count": 4,
  "filtered_count": 2
}
```

**Rate Limit:** 60 requests/minute per IP

**Example:**
```bash
curl "https://www.quantumpoly.ai/api/ewa/recommendations?priority=high" | jq .
```

---

### GET `/api/ewa/verify`

**Description:** Verify autonomous_analysis ledger entries

**Response:**
```json
{
  "verified": true,
  "total_entries": 15,
  "verification_results": [
    {
      "entry_id": "autonomy-analysis-block9.5-a3f2b8c1",
      "timestamp": "2025-10-26T12:00:00Z",
      "hash_valid": true,
      "merkle_root_valid": true,
      "verified": true
    }
  ],
  "global_merkle_root": "a7c9e4d3f2b1a0c5...",
  "verification_timestamp": "2025-10-26T12:05:00Z"
}
```

**Rate Limit:** 60 requests/minute per IP

**Example:**
```bash
curl "https://www.quantumpoly.ai/api/ewa/verify" | jq .
```

---

### POST `/api/ewa/analyze`

**Description:** Manually trigger on-demand analysis

**Request Body:**
```json
{
  "dry_run": false,
  "enable_ml": false
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-26T12:00:00Z",
  "summary": {
    "tti_score": 87.5,
    "total_insights": 3,
    "critical_insights": 0
  },
  "insights": [ /* full insights */ ],
  "recommendations": [ /* full recommendations */ ]
}
```

**Rate Limit:** 5 requests/hour per IP

**Authentication:** Optional `x-api-key` header

**Example:**
```bash
curl -X POST "https://www.quantumpoly.ai/api/ewa/analyze" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{"dry_run": false, "enable_ml": true}' | jq .
```

---

## Ethical Boundaries

### What EWA v2 Does NOT Do

❌ **No Individual Profiling**
- All analysis operates on aggregate data only
- No user-level behavior tracking
- No deanonymization attempts

❌ **No Automated Enforcement**
- System proposes, humans decide
- Critical insights require Governance Officer approval
- No automated policy changes

❌ **No Predictive Profiling**
- Forecasting limited to system-level metrics
- No predictions about individuals
- No protected attribute inference

❌ **No Silent Operation**
- All insights logged to governance ledger
- Cryptographic proof of all analyses
- Public API access for verification

### What EWA v2 DOES Do

✅ **Aggregate Analysis**
- Statistical trend detection
- System-level health monitoring
- Governance process quality assessment

✅ **Explainable Insights**
- All severity scores traceable
- Evidence provided with every insight
- Confidence scores based on data quality

✅ **Human Oversight**
- Critical insights require manual approval
- Review queue with audit trail
- Governance Officer accountability

✅ **Transparency**
- All analyses logged to ledger
- Public APIs for verification
- Open documentation of methods

---

## Troubleshooting

### Issue: Analysis Script Fails

**Symptom:**
```
❌ Analysis failed: Cannot find module 'src/lib/ewa/engine/statistics.ts'
```

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Or run with ts-node
npx ts-node scripts/ewa-analyze.mjs
```

---

### Issue: No Insights Generated

**Symptom:**
```
💡 Generating insights...
   Total Insights: 0
```

**Solution:**
- Check if governance ledger has sufficient data (≥2 EII entries)
- Verify ledger path: `governance/ledger/ledger.jsonl`
- Run with `--dry-run` to see analysis output
- Check for errors in statistical analysis

---

### Issue: Review Queue Empty

**Symptom:**
```
✅ No pending reviews
```

**Solution:**
- This is expected if no critical insights (severity > 0.6)
- Run analysis: `npm run ewa:analyze`
- Check `governance/ewa/review-queue.jsonl` for entries
- Lower severity threshold in `severity.ts` if needed

---

### Issue: API Returns 429 Rate Limit

**Symptom:**
```json
{
  "error": "Rate limit exceeded"
}
```

**Solution:**
- Wait for rate limit window to reset
- Insights API: 60 req/min
- Analyze API: 5 req/hour
- Use caching to reduce requests
- Contact admin for rate limit increase

---

### Issue: Dashboard Not Loading

**Symptom:**
- Blank page or error in browser console

**Solution:**
```bash
# Check build
npm run build

# Verify dashboard route
ls src/app/[locale]/governance/autonomy/page.tsx

# Check for TypeScript errors
npm run typecheck

# Rebuild and restart
npm run build && npm start
```

---

## Development Workflow

### 1. Local Development

```bash
# Start development server
npm run dev

# Run analysis in dry-run mode
npm run ewa:analyze:dry-run

# Check insights API
curl http://localhost:3000/api/ewa/insights | jq .

# Visit dashboard
open http://localhost:3000/en/governance/autonomy
```

---

### 2. Testing

```bash
# Run all tests
npm test

# Run API tests
npm run test:api

# Type check
npm run typecheck

# Lint
npm run lint
```

---

### 3. Production Deployment

```bash
# Build for production
npm run build

# Verify ledger integrity
npm run ethics:verify-ledger -- --scope=all

# Run production analysis
npm run ewa:analyze

# Review critical insights
npm run ewa:review
```

---

## Best Practices

### 1. Regular Monitoring

- Check dashboard daily: `/[locale]/governance/autonomy`
- Review queue weekly: `npm run ewa:review`
- Verify ledger monthly: `npm run ethics:verify-ledger`

### 2. Human Oversight

- Always review critical insights (severity > 0.6)
- Provide context in review notes
- Document decisions in ledger
- Escalate anomalies to Governance Officer

### 3. Configuration Management

- Version control TTI config changes
- Document weight adjustments
- Test configuration changes in dry-run mode
- Monitor impact on insights

### 4. Data Quality

- Ensure regular ledger updates
- Verify consent data completeness
- Check for missing EII entries
- Validate hash integrity

---

## Support

**Documentation:**
- Main: `BLOCK9.5_ETHICAL_AUTONOMY.md`
- Model Card: `docs/autonomy/EWA_MODEL_CARD.md`
- API Schema: `public/api-schema.json`

**Contact:**
- Governance Officer: governance@quantumpoly.ai
- Technical Support: support@quantumpoly.ai

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-26  
**Maintained By:** QuantumPoly Governance Team

