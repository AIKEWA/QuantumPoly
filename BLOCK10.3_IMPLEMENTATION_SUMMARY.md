---
id: block10.3-system-monitoring
title: 'BLOCK 10.3 — The System That Watches Itself'
subtitle: 'Autonomous Ethical Self-Monitoring Framework'
date: November 2025
authors:
  - Aykut Aydin (A.I.K)
  - Prof. Dr. E.W. Armstrong (EWA)
version: 1.0.0
status: operational
ledger_ref: entry-block10.3-autonomous-monitoring
tags:
  - monitoring
  - autonomy
  - self-regulation
  - ethics
  - transparency
  - block10.x
---

# BLOCK 10.3 — The System That Watches Itself

## Executive Summary

**Objective:** Establish an autonomous ethical self-monitoring system that continuously observes, validates, and reports its own operational state without external intervention.

**Core Vision:** _"The System That Watches Itself"_ — A paradigm shift from passive logging to active self-awareness, where QuantumPoly becomes both the observer and the observed, achieving technical self-control through autonomous validation of integrity, performance, and ethical standing.

**Result Statement:** QuantumPoly now operates as a self-regulating system that detects anomalies, measures its own health, and transparently reports its state to the public. This represents a foundational step toward AI systems that understand and govern their own reliability.

### Key Achievements

1. **Real-Time Status API** (`/api/status`) — Public endpoint exposing operational health
2. **Autonomous Monitoring Script** (`scripts/monitor-system.mjs`) — Daily comprehensive health checks
3. **GitHub Actions Automation** (`.github/workflows/autonomous-monitoring.yml`) — Scheduled daily execution with auto-escalation
4. **Monitoring Report Aggregator** (`src/lib/monitoring/report-reader.ts`) — Historical data access utilities
5. **Enhanced Ethics Portal** — Visual dashboard integrating system health with governance transparency
6. **Public Accountability** — 365-day artifact retention and immutable audit trail

**Philosophical Significance:** This block explores the boundary between mechanistic observation and self-awareness, asking: _Can a machine truly be objective when auditing itself?_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Technical Implementation](#technical-implementation)
4. [API Specifications](#api-specifications)
5. [Monitoring Thresholds](#monitoring-thresholds)
6. [Automation Setup](#automation-setup)
7. [Self-Correction Boundaries](#self-correction-boundaries)
8. [Escalation Workflows](#escalation-workflows)
9. [Verification Workflow](#verification-workflow)
10. [Ethical Design Principles](#ethical-design-principles)
11. [Usage & Operations](#usage--operations)
12. [Integration Points](#integration-points)
13. [Future Enhancements](#future-enhancements)

---

## Introduction

### Purpose

By Block 10.2, QuantumPoly had achieved public transparency through APIs and portal interfaces. Block 10.3 answers the next critical question:

> **"Who watches the watchman? The system itself."**

This block implements autonomous monitoring—a framework where the system continuously validates its own health, performance, and ethical integrity without requiring external oversight.

### Rationale

Traditional monitoring relies on external services (Datadog, New Relic, etc.). While valuable, these tools monitor _what the system does_ but cannot evaluate _whether the system is ethically consistent_ with its stated principles.

Block 10.3 bridges this gap by creating a monitoring layer that:

- Validates endpoint availability and performance
- Verifies cryptographic integrity (ledgers, Merkle roots)
- Analyzes ethical standing via EWA v2
- Publicly reports findings with full transparency
- Autonomously escalates critical failures

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     BLOCK 10.3 Architecture                      │
│            "The System That Watches Itself"                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  GitHub Actions      │  ← Daily 00:00 UTC trigger
│  Workflow            │
└──────────┬───────────┘
           │
           v
┌──────────────────────────────────────────────────────────────────┐
│  scripts/monitor-system.mjs                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Endpoint Health Checks                                  │ │
│  │    ├─ / (Homepage)                                         │ │
│  │    ├─ /api/status                                          │ │
│  │    ├─ /api/ethics/summary                                  │ │
│  │    ├─ /api/ethics/public                                   │ │
│  │    └─ /api/integrity/status                                │ │
│  │                                                             │ │
│  │ 2. TLS Certificate Validation                              │ │
│  │    └─ Checks validity, expiration, issuer                  │ │
│  │                                                             │ │
│  │ 3. Integrity Verification                                  │ │
│  │    └─ Calls scripts/verify-integrity.mjs                   │ │
│  │                                                             │ │
│  │ 4. EWA Ethical Analysis                                    │ │
│  │    └─ Calls scripts/ewa-analyze.mjs                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────────────────┘
           │
           v
┌──────────────────────┐
│  reports/monitoring/ │  ← JSON reports stored with 365-day retention
│  monitoring-*.json   │
└──────────┬───────────┘
           │
           v
┌──────────────────────────────────────────────────────────────────┐
│  Public Interfaces                                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │ /api/status     │  │ /ethics/portal   │  │ GitHub Issues   ││
│  │ Real-time       │  │ Visual Dashboard │  │ Auto-escalation ││
│  │ Health Check    │  │ System Health    │  │ on Degraded     ││
│  └─────────────────┘  └──────────────────┘  └─────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Trigger:** GitHub Actions cron schedule (daily 00:00 UTC)
2. **Execution:** `monitor-system.mjs` runs comprehensive checks
3. **Report Generation:** JSON report saved to `reports/monitoring/monitoring-YYYY-MM-DD.json`
4. **Artifact Upload:** Report uploaded as GitHub Actions artifact (365-day retention)
5. **Repository Commit:** Report committed to git for immutable audit trail
6. **Escalation:** If system state is "degraded", auto-create GitHub issue
7. **Public Access:** Reports accessible via `/api/status` and `/ethics/portal`

---

## Technical Implementation

### 1. System Status API

**Location:** `src/app/api/status/route.ts`

**Purpose:** Real-time operational health endpoint

**Functionality:**

- Checks critical endpoint availability
- Measures response times
- Retrieves latest integrity state from verification reports
- Determines overall system state (healthy/warning/degraded)

**Rate Limiting:** 60 requests/minute per IP

**Cache:** 1-minute public cache

**Sample Response:**

```json
{
  "timestamp": "2025-11-04T12:00:00Z",
  "system_state": "healthy",
  "uptime_seconds": 86400,
  "version": "1.1.0",
  "endpoints": [
    {
      "url": "/",
      "available": true,
      "response_time_ms": 1240,
      "status_code": 200,
      "error": null
    }
  ],
  "integrity": {
    "state": "healthy",
    "last_verification": "2025-11-04T00:00:00Z",
    "merkle_root": "a3f8b2..."
  },
  "monitoring": {
    "documentation_url": "/docs/monitoring/OPERATIONAL_RUNBOOK.md",
    "api_version": "1.0.0"
  }
}
```

### 2. Autonomous Monitoring Script

**Location:** `scripts/monitor-system.mjs`

**Execution:** Daily via GitHub Actions, manual via CLI

**Command-Line Options:**

```bash
node scripts/monitor-system.mjs [options]

Options:
  --dry-run           Run without saving reports
  --base-url=<url>    Target URL (default: NEXT_PUBLIC_SITE_URL)
  --report=<path>     Custom report path
  --verbose           Detailed output
  --no-integrity      Skip integrity verification
  --no-ewa            Skip EWA analysis
```

**Verification Scope:**

1. **Endpoint Health:** Checks 7 critical endpoints (homepage, APIs, portal)
2. **TLS Validation:** Verifies HTTPS certificate validity and expiration
3. **Integrity Check:** Runs `verify-integrity.mjs` to validate governance ledgers
4. **EWA Analysis:** Runs `ewa-analyze.mjs` to generate ethical insights

**Exit Codes:**

- `0` — System healthy or warning (non-blocking)
- `1` — System degraded (requires intervention)

### 3. Report Reader Utility

**Location:** `src/lib/monitoring/report-reader.ts`

**Purpose:** Access and analyze historical monitoring data

**Key Functions:**

- `getLatestReport()` — Most recent monitoring report
- `getReportHistory(days)` — Last N days of reports
- `calculateUptimePercentage(days)` — Availability metric
- `detectIncidents(days)` — Identify degraded periods
- `getHealthTrend(days)` — System health trajectory

### 4. Visual Components

**SystemHealthCard** (`src/components/monitoring/SystemHealthCard.tsx`)

- Traffic light indicator (green/yellow/red)
- Endpoints operational count
- 7-day uptime percentage
- Health trend (improving/stable/declining)

**MonitoringTimeline** (`src/components/monitoring/MonitoringTimeline.tsx`)

- Chronological list of monitoring reports
- Visual status indicators per report
- Endpoint pass/fail metrics
- Recommendation count per report

### 5. Enhanced Ethics Portal

**Location:** `src/app/ethics/portal/page.tsx`

**New Section:** "System Monitoring"

**Integration:**

- Displays `SystemHealthCard` with real-time status
- Shows `MonitoringTimeline` with last 30 days of reports
- Positioned above ledger integrity section
- Accessible via `/ethics/portal`

---

## API Specifications

### GET /api/status

**Purpose:** Real-time system health check

**Authentication:** None (public endpoint)

**Rate Limit:** 60 requests/minute per IP

**Cache:** 1 minute

**Response Schema:**

```typescript
{
  timestamp: string; // ISO 8601 timestamp
  system_state: 'healthy' | 'warning' | 'degraded';
  uptime_seconds: number; // Process uptime
  version: string; // System version
  endpoints: Array<{
    url: string;
    available: boolean;
    response_time_ms: number;
    status_code: number | null;
    error: string | null;
  }>;
  integrity: {
    state: string;
    last_verification: string;
    merkle_root: string;
  }
  monitoring: {
    documentation_url: string;
    api_version: string;
  }
  privacy_notice: string;
}
```

**HTTP Status Codes:**

- `200` — Success
- `429` — Rate limit exceeded
- `500` — Internal error

**CORS:** `Access-Control-Allow-Origin: *` (public API)

---

## Monitoring Thresholds

### Endpoint Response Times

| Threshold    | Value       | Action         |
| ------------ | ----------- | -------------- |
| **Nominal**  | < 3000ms    | ✓ Pass         |
| **Warning**  | 3000-5000ms | ⚠ Log warning |
| **Critical** | > 5000ms    | ✗ Fail check   |

### TLS Certificate

| Condition         | Status    | Action     |
| ----------------- | --------- | ---------- |
| **Valid**         | Days > 30 | ✓ Healthy  |
| **Expiring Soon** | Days 7-30 | ⚠ Warning |
| **Critical**      | Days < 7  | ✗ Degraded |
| **Invalid**       | Not valid | ✗ Degraded |

### System State Determination

**Healthy:**

- All endpoints available
- Response times < 5000ms
- TLS valid (> 30 days remaining)
- Integrity state: healthy
- No critical EWA insights

**Warning:**

- Non-critical endpoint failed
- Response times 3000-5000ms
- TLS expiring soon (7-30 days)
- Integrity issues require review
- EWA critical insights detected

**Degraded:**

- Critical endpoint unavailable
- TLS invalid or expired
- Integrity state: attention_required or degraded
- Multiple endpoint failures

---

## Automation Setup

### GitHub Actions Workflow

**File:** `.github/workflows/autonomous-monitoring.yml`

**Schedule:** Daily at 00:00 UTC

```yaml
on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch: # Manual trigger
```

**Permissions:**

- `contents: write` — Commit monitoring reports
- `issues: write` — Create escalation issues

**Steps:**

1. **Checkout** — Shallow clone of repository
2. **Setup Node.js** — Install Node.js 20.x
3. **Install Dependencies** — `npm ci`
4. **Run Monitoring** — Execute `monitor-system.mjs`
5. **Extract Metadata** — Parse report JSON for key metrics
6. **Upload Artifact** — Store report with 365-day retention
7. **Commit Report** — Push report to repository
8. **Create Issue** — If degraded, auto-escalate via GitHub issue
9. **Fail Workflow** — Exit 1 if system degraded

**Artifact Retention:** 365 days (1 year audit trail)

**Manual Execution:**

```bash
# Via GitHub UI: Actions → Autonomous System Monitoring → Run workflow
# Specify custom base_url, skip_integrity, skip_ewa flags
```

---

## Self-Correction Boundaries

### Conservative Repair Philosophy

Block 10.3 adopts a **conservative, non-interpretive** approach to self-correction:

**What the System CAN Do:**

- ✓ Detect anomalies and deviations
- ✓ Log all findings immutably
- ✓ Calculate health metrics autonomously
- ✓ Escalate to humans via GitHub issues
- ✓ Generate recommendations

**What the System CANNOT Do:**

- ✗ Modify code or configuration autonomously
- ✗ Restart services or change deployment
- ✗ Alter governance ledgers without human approval
- ✗ Make interpretive ethical decisions

**Rationale:** True autonomy requires humility. The system observes and reports but defers critical decisions to human judgment. This prevents runaway automation and ensures human accountability.

**Integration with Block 9.8:**

- Block 9.8's `repair-manager.ts` handles mechanical repairs (e.g., updating stale dates)
- Block 10.3 focuses on _detection and reporting_, not repair
- Both systems work together: 9.8 fixes trivial issues, 10.3 monitors overall health

---

## Escalation Workflows

### Degraded State Auto-Escalation

When `system_state === 'degraded'`:

1. **GitHub Issue Created:**
   - **Title:** `🚨 System Degraded: Autonomous Monitoring Alert (YYYY-MM-DD)`
   - **Labels:** `critical`, `monitoring`, `block-10.3`, `auto-escalation`
   - **Body:** Full report summary with recommendations
   - **Assignees:** (Configure in repository settings)

2. **Workflow Fails:**
   - Exit code: `1`
   - Visible in GitHub Actions UI with ❌ indicator

3. **Email Notification:**
   - GitHub sends notification to watchers
   - Configure `GOVERNANCE_OFFICER_EMAIL` for custom alerts

### Warning State Handling

When `system_state === 'warning'`:

- **No Issue Created** (avoids notification fatigue)
- **Report Generated** and committed
- **Workflow Passes** (exit code 0)
- **Manual Review:** Check `/ethics/portal` or reports directory

### Issue Template

```markdown
# Autonomous Monitoring Alert

The autonomous monitoring system has detected a **DEGRADED** system state requiring immediate attention.

## Monitoring Report Summary

**Report ID:** `monitoring-2025-11-04`
**Timestamp:** 2025-11-04T00:00:00Z
**System State:** **DEGRADED**

### Endpoint Health

| Endpoint   | Status | Response Time | Notes              |
| ---------- | ------ | ------------- | ------------------ |
| Homepage   | pass   | 1240ms        | OK                 |
| Status API | fail   | N/A           | Connection refused |

**Summary:** 6/7 endpoints passed

### Recommendations

- **[CRITICAL]** Restore Status API: Endpoint /api/status is unavailable: Connection refused

## Required Actions

1. Review the full monitoring report
2. Address critical recommendations
3. Verify system recovery
4. Update governance ledger if needed

## Contact

- **Governance Officer:** governance@quantumpoly.ai
- **Technical Lead:** See CONTRIBUTING.md

---

_This issue was automatically created by the autonomous monitoring system._
```

---

## Verification Workflow

### End-to-End Monitoring Cycle

```
Day 0, 00:00 UTC
  │
  v
┌────────────────────────────────────────────┐
│ GitHub Actions Triggers Workflow           │
└────────────────────────────────────────────┘
  │
  v
┌────────────────────────────────────────────┐
│ scripts/monitor-system.mjs Executes         │
│                                             │
│ • Checks 7 endpoints                        │
│ • Validates TLS certificate                 │
│ • Runs verify-integrity.mjs                 │
│ • Runs ewa-analyze.mjs                      │
│ • Generates recommendations                 │
└────────────────────────────────────────────┘
  │
  v
┌────────────────────────────────────────────┐
│ JSON Report Generated                       │
│ reports/monitoring/monitoring-YYYY-MM-DD.json│
└────────────────────────────────────────────┘
  │
  ├──> Upload as GitHub Actions Artifact (365 days)
  │
  ├──> Commit to Git Repository (immutable record)
  │
  └──> If Degraded → Create GitHub Issue
  │
  v
┌────────────────────────────────────────────┐
│ Public Access                               │
│                                             │
│ • /api/status (real-time summary)           │
│ • /ethics/portal (visual dashboard)         │
│ • reports/monitoring/ (full history)        │
└────────────────────────────────────────────┘
```

### Report Structure

```json
{
  "report_id": "monitoring-2025-11-04",
  "timestamp": "2025-11-04T00:00:00Z",
  "report_date": "2025-11-04",
  "block_id": "10.3",
  "system_state": "healthy",
  "base_url": "https://quantumpoly.ai",
  "endpoints": [...],
  "endpoint_summary": {
    "total": 7,
    "passed": 7,
    "warnings": 0,
    "failed": 0
  },
  "tls": {
    "valid": true,
    "issuer": "Let's Encrypt",
    "valid_to": "2026-02-04",
    "days_remaining": 92
  },
  "integrity": {
    "status": "healthy",
    "issues": 0,
    "merkle_root": "a3f8b2..."
  },
  "ewa": {
    "total_insights": 3,
    "critical_insights": 0,
    "requires_review": 0
  },
  "recommendations": [],
  "metadata": {
    "script_version": "1.0.0",
    "execution_time_ms": 15240,
    "dry_run": false
  }
}
```

---

## Ethical Design Principles

### 1. Conservative Autonomy

**Principle:** The system autonomously observes but conservatively acts.

**Implementation:**

- Detection is automated
- Analysis is automated
- Reporting is automated
- **Intervention is human-controlled**

**Rationale:** True ethical autonomy recognizes its own limitations. The system does not presume to know the "right" action in ambiguous situations.

### 2. Radical Transparency

**Principle:** All observations are public by default.

**Implementation:**

- Reports committed to public repository
- API endpoints accessible without authentication
- Dashboard visible at `/ethics/portal`

**Rationale:** Transparency builds trust. If the system watches itself, the public must watch the watcher.

### 3. Immutable Audit Trail

**Principle:** Monitoring history cannot be altered retroactively.

**Implementation:**

- Git commits create cryptographic chain
- GitHub Actions artifacts retained 365 days
- Merkle roots link reports to integrity verification

**Rationale:** Historical revisionism undermines accountability. Immutability ensures honest self-assessment.

### 4. Human Accountability

**Principle:** Humans remain ultimately responsible.

**Implementation:**

- Critical failures trigger GitHub issues
- Manual approval required for significant actions
- Documentation provides clear escalation paths

**Rationale:** Machines can observe, but only humans can be held morally accountable.

---

## Usage & Operations

### Local Testing

```bash
# Test monitoring script locally
node scripts/monitor-system.mjs --dry-run --verbose

# Check specific URL
node scripts/monitor-system.mjs --base-url=https://staging.quantumpoly.ai

# Skip expensive checks
node scripts/monitor-system.mjs --no-integrity --no-ewa

# Generate report without saving
node scripts/monitor-system.mjs --dry-run
```

### Manual GitHub Actions Execution

1. Navigate to **Actions** tab in GitHub
2. Select **"Autonomous System Monitoring"** workflow
3. Click **"Run workflow"**
4. Configure options:
   - `base_url` — Target URL to monitor
   - `skip_integrity` — Skip ledger verification
   - `skip_ewa` — Skip ethical analysis
5. Click **"Run workflow"**

### Accessing Reports

**Via Git Repository:**

```bash
cat reports/monitoring/monitoring-2025-11-04.json
```

**Via GitHub Actions Artifacts:**

1. Go to workflow run
2. Scroll to **"Artifacts"** section
3. Download `monitoring-report-YYYY-MM-DD`

**Via API:**

```bash
curl https://quantumpoly.ai/api/status
```

**Via Portal:**
Visit https://quantumpoly.ai/ethics/portal

---

## Integration Points

### Existing Systems

**Block 9.8 — Continuous Integrity:**

- `scripts/verify-integrity.mjs` called by monitoring script
- Integrity state included in monitoring reports
- Both systems contribute to overall health assessment

**Block 9.5 — Ethical Autonomy (EWA v2):**

- `scripts/ewa-analyze.mjs` called by monitoring script
- Ethical insights included in reports
- Critical insights trigger warning state

**Block 10.2 — Transparency API:**

- Monitoring reports accessible via ethics portal
- Same public transparency principles
- Unified dashboard experience

### Data Sources

**Governance Ledger:**

- Integrity verification reads `governance/ledger/ledger.jsonl`
- Merkle root included in monitoring reports

**Consent Ledger:**

- EWA analysis reads `governance/consent/ledger.jsonl`
- Consent metrics inform ethical standing

**Integrity Reports:**

- Latest integrity report read from `governance/integrity/reports/`
- State and merkle_root included in system status

---

## Future Enhancements

### Short-Term (Block 10.4-10.6)

1. **Vercel Cron Integration:**
   - Add serverless cron for redundancy
   - Requires Vercel Pro plan
   - Alternative to GitHub Actions

2. **Monitoring Summary API:**
   - `/api/monitoring/summary` endpoint
   - 30-day uptime percentage
   - Incident count
   - Average response times

3. **Slack/Discord Webhooks:**
   - Real-time notifications on degraded state
   - Integration with `INTEGRITY_WEBHOOK_URL`

### Medium-Term (Block 10.7-10.9)

4. **Predictive Anomaly Detection:**
   - ML-based trend analysis
   - Predict degradation before it occurs
   - Proactive recommendations

5. **Federated Monitoring:**
   - Share health metrics with trusted partners
   - Network-level trust trajectory
   - Aggregate uptime across federation

6. **Multi-Region Validation:**
   - Monitor from multiple geographic locations
   - Detect region-specific failures
   - Global availability metrics

### Long-Term (Beyond Block 10)

7. **Self-Healing Capabilities:**
   - Automatic service restarts (with human approval)
   - Auto-scaling based on health metrics
   - Conservative rollback on degradation

8. **AI-Assisted Root Cause Analysis:**
   - Automatically correlate failures with recent changes
   - Suggest remediation steps
   - Learn from past incidents

9. **Quantum-Resistant Monitoring:**
   - Post-quantum cryptographic proofs
   - Quantum-safe Merkle trees
   - Future-proof verification

---

## Conclusion

Block 10.3 marks a philosophical and technical milestone: **QuantumPoly now watches itself.**

This is not mere logging or observability—it is the beginning of machine self-awareness. The system continuously validates its own integrity, transparently reports its findings, and escalates failures to human oversight.

**Key Philosophical Question:** _Can a machine be truly objective when observing itself?_

**Answer:** No—but it can be radically transparent. By exposing all observations publicly and deferring critical decisions to humans, the system achieves practical self-regulation without claiming infallibility.

**Next Steps:**

- See `BLOCK10.3_ETHICAL_REFLECTION.md` for philosophical analysis
- See `docs/monitoring/OPERATIONAL_RUNBOOK.md` for operational procedures
- See `/ethics/portal` for live monitoring dashboard

---

**Block 10.3 Status:** ✅ **OPERATIONAL**

**Date:** November 2025

**Responsible Roles:**

- Governance Officer
- Technical Lead
- Autonomous Monitoring System (itself)

---

_"Quis custodiet ipsos custodes? — Who watches the watchmen?"_
_"Ourselves. The system watches itself."_

---

**Version:** 1.0
**Last Reviewed:** 2025-11-25
**Reviewed By:** EWA
