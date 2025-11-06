# Block 10.1 — Post-Launch Monitoring & Ethical Feedback Loop

**Subtitle:** "QuantumPoly monitors itself and learns."

**Status:** ✅ **IMPLEMENTED**  
**Date:** 4 November 2025  
**Author:** Aykut Aydin (A.I.K)  
**Ledger Reference:** `postlaunch-monitoring-2025-11-04`

---

## Executive Summary

Block 10.1 establishes continuous post-launch monitoring of technical integrity, ethical transparency, and governance continuity after the public release of QuantumPoly v1.1.

This is not passive logging. It is an active, autonomous system that:
- Monitors critical endpoints daily
- Captures ethical feedback from the public
- Records evidence in the governance ledger
- Escalates warnings automatically
- Operates without manual intervention

**Core Achievement:**

> **"QuantumPoly is not just released — it monitors itself, learns from feedback, and maintains continuous governance accountability."**

---

## 1. System Architecture

### 1.1 Monitoring Components

Block 10.1 consists of four integrated components:

| Component | Purpose | Schedule | Output |
|-----------|---------|----------|--------|
| **Monitoring Script** | Daily health checks of endpoints, TLS, and ledger | 02:00 UTC daily | JSON report + ledger entry |
| **GitHub Actions Workflow** | Automated execution and artifact retention | 02:00 UTC daily | Report artifacts (365 days) |
| **Feedback API** | Public endpoint for ethical feedback submission | Always available | JSONL feedback log |
| **Governance Documentation** | Evidence chain and escalation procedures | Static reference | This document |

---

### 1.2 Design Principles

**Hybrid Modular Approach:**
- Console logging for v1.1 (no secrets required)
- Prepared hook functions for future webhook/email integration (Block 10.2/10.3)
- Environment-based configuration for flexibility

**Audit-Proof Evidence:**
- Daily reports with cryptographic hashes
- JSONL storage for transparency
- Ledger integration with Merkle roots
- 365-day artifact retention

**Non-Terminating Error Handling:**
- Script always generates a report, even on failure
- Degraded status triggers escalation but doesn't stop monitoring
- Error reports stored for forensic analysis

---

## 2. Monitoring Framework

### 2.1 Endpoints Monitored

| Endpoint | Purpose | Success Criteria | Threshold | Escalation |
|----------|---------|------------------|-----------|------------|
| `/` | Homepage availability | HTTP 200, TLS valid | < 3000ms response | Warning if > 5000ms |
| `/accessibility-statement.html` | WCAG compliance proof | HTTP 200, content valid | < 2000ms response | Critical if unavailable |
| `/governance/review` | Governance dashboard | HTTP 200, authenticated | < 3000ms response | Warning if > 5000ms |
| `/api/status` | System health API | HTTP 200, JSON valid | < 1000ms response | Critical if unavailable |

---

### 2.2 Status Levels

| Status | Definition | Trigger | Action |
|--------|------------|---------|--------|
| **valid** | All systems operational | All endpoints OK, TLS valid, response times acceptable | Continue monitoring |
| **warning** | Non-critical issues detected | 1+ non-critical endpoints slow/failed, or ledger sync delayed | Log warning, notify governance console |
| **degraded** | Critical systems impaired | Critical endpoints failed, TLS invalid, or multiple failures | Exit code 1, create GitHub issue, notify governance@quantumpoly.ai |

---

### 2.3 TLS/SSL Verification

**Requirements:**
- Valid HTTPS certificate
- Certificate not expired
- Secure TLS protocol (1.2+)
- Proper domain binding

**Verification Method:**
```javascript
const response = await fetch(baseURL, { method: 'HEAD' });
// Validates HTTPS connectivity and certificate chain
```

**Escalation:**
- Invalid TLS → **degraded** status
- Certificate expiring < 30 days → **warning** status (future enhancement)

---

### 2.4 Optional Ledger Integrity Check

**Environment Variable:** `CHECK_LEDGER=true`

**Verification:**
- Ledger file exists (`governance/ledger/ledger.jsonl`)
- File is readable and contains valid entries
- Last modified within expected timeframe
- Entry count increasing (no deletions)

**Implementation:**
```bash
CHECK_LEDGER=true node scripts/ewa-postlaunch.mjs
```

---

## 3. Feedback API

### 3.1 Endpoint Specification

**URL:** `POST /api/feedback/report`

**Purpose:** Public endpoint for submitting ethical feedback, accessibility issues, and incidents

**Authentication:** None (public endpoint with rate limiting)

**Rate Limit:** 10 requests per hour per IP address

---

### 3.2 Request Schema

```typescript
{
  "type": "accessibility" | "ethics" | "incident",
  "message": "string",         // 10-5000 characters
  "contact": "string",         // Optional email
  "timestamp": "ISO-8601"      // Optional, auto-generated if not provided
}
```

**Validation:**
- `type`: Must be one of `accessibility`, `ethics`, or `incident`
- `message`: Required, 10-5000 characters
- `contact`: Optional, valid email format if provided
- `timestamp`: Optional, ISO-8601 datetime format

---

### 3.3 Example Request

```bash
curl -X POST https://quantumpoly.ai/api/feedback/report \
  -H "Content-Type: application/json" \
  -d '{
    "type": "accessibility",
    "message": "The governance dashboard has insufficient color contrast in dark mode for chart labels. Tested with Chrome 119 on macOS.",
    "contact": "user@example.com",
    "timestamp": "2025-11-04T14:30:00.000Z"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "entry_id": "feedback-accessibility-1730729400000-a3f2b1c4",
  "message": "Feedback received successfully. Thank you for your contribution to governance transparency.",
  "status": "pending",
  "next_steps": "Your feedback will be reviewed in the next governance cycle. For urgent matters, contact governance@quantumpoly.ai."
}
```

---

### 3.4 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 201 | Created | Feedback successfully received and stored |
| 400 | Bad Request | Validation error (invalid type, message too short/long, etc.) |
| 429 | Too Many Requests | Rate limit exceeded (10 requests/hour) |
| 500 | Internal Server Error | Server error (feedback not stored) |

---

### 3.5 Feedback Storage

**File Path:** `governance/feedback/feedback-YYYY-MM-DD.jsonl`

**Format:** JSON Lines (one entry per line)

**Entry Structure:**
```json
{
  "entry_id": "feedback-accessibility-1730729400000-a3f2b1c4",
  "type": "accessibility",
  "message": "The governance dashboard has insufficient color contrast...",
  "contact": "user@example.com",
  "timestamp": "2025-11-04T14:30:00.000Z",
  "received_at": "2025-11-04T14:30:15.234Z",
  "date": "2025-11-04",
  "status": "pending",
  "hash": "8f3b2c1d..."
}
```

**Retention:** Indefinite (part of governance audit trail)

---

### 3.6 Feedback Review Process

**Frequency:** Quarterly (integrated with governance reviews)

**Workflow:**
1. Feedback collected in daily JSONL files
2. Aggregated monthly via `npm run feedback:aggregate`
3. Reviewed by Governance Officer during quarterly review
4. Action items created for valid issues
5. Responses sent to contacts (if provided)
6. Results published in governance ledger

**Next Review:** 2026-02-10 (Quarterly Governance Review)

---

## 4. Automated Monitoring

### 4.1 Daily Execution Schedule

**Cron Schedule:** `0 2 * * *` (02:00 UTC daily)

**Why 02:00 UTC?**
- Low traffic period for accurate measurements
- Consistent with other monitoring workflows (integrity-verification, ewa-analysis)
- Post-midnight for daily date alignment

---

### 4.2 GitHub Actions Workflow

**File:** `.github/workflows/ewa-postlaunch.yml`

**Triggers:**
- **Scheduled:** Daily at 02:00 UTC
- **Manual:** `workflow_dispatch` with options:
  - `dry_run`: Test mode (no ledger writes)
  - `base_url`: Override monitoring URL
  - `check_ledger`: Enable ledger integrity check

**Steps:**
1. Checkout repository
2. Setup Node.js 20
3. Install dependencies (`npm ci --legacy-peer-deps`)
4. Run monitoring script
5. Check monitoring status
6. Commit results (if not dry-run)
7. Upload report artifacts (365-day retention)
8. Notify on warnings/degraded status
9. Verify ledger integrity (if enabled)
10. Generate workflow summary

---

### 4.3 Monitoring Script

**File:** `scripts/ewa-postlaunch.mjs`

**Features:**
- Node 20 compatible (global `fetch`)
- Environment-based configuration
- Non-terminating error handling
- Console-based notifications with prepared webhook hooks
- Daily JSON report generation
- Ledger integration with cryptographic hashes

**Execution:**
```bash
# Default (production monitoring)
node scripts/ewa-postlaunch.mjs

# Dry run (no file writes)
node scripts/ewa-postlaunch.mjs --dry-run

# Custom base URL
MONITOR_BASE_URL=http://localhost:3000 node scripts/ewa-postlaunch.mjs

# With ledger integrity check
CHECK_LEDGER=true node scripts/ewa-postlaunch.mjs
```

---

### 4.4 Report Output

**File Path:** `reports/postlaunch-status-YYYY-MM-DD.json`

**Structure:**
```json
{
  "report_id": "postlaunch-2025-11-04",
  "block_id": "10.1",
  "timestamp": "2025-11-04T02:00:15.234Z",
  "date": "2025-11-04",
  "base_url": "https://quantumpoly.ai",
  "overall_status": "valid",
  "checks": {
    "endpoints": [
      {
        "endpoint": "/",
        "url": "https://quantumpoly.ai/",
        "status": 200,
        "statusText": "OK",
        "responseTime": 245,
        "ok": true,
        "timestamp": "2025-11-04T02:00:15.234Z"
      }
    ],
    "tls": {
      "valid": true,
      "protocol": "https",
      "timestamp": "2025-11-04T02:00:15.234Z"
    },
    "ledger": null
  },
  "summary": {
    "total_endpoints": 4,
    "successful_endpoints": 4,
    "failed_endpoints": 0,
    "avg_response_time": 312,
    "max_response_time": 456
  },
  "metadata": {
    "script_version": "1.0.0",
    "node_version": "v20.17.25",
    "dry_run": false,
    "check_ledger": false
  }
}
```

---

## 5. Governance Integration

### 5.1 Ledger Entries

**Entry Type:** `postlaunch_monitoring`

**Frequency:** Daily (one entry per monitoring run)

**Entry Structure:**
```json
{
  "entry_id": "postlaunch-monitoring-2025-11-04",
  "ledger_entry_type": "postlaunch_monitoring",
  "block_id": "10.1",
  "title": "Post-Launch Daily Monitoring",
  "status": "verified",
  "approved_date": "2025-11-04",
  "responsible_roles": ["Post-Launch Monitor", "Governance Officer"],
  "monitoring_result": {
    "overall_status": "valid",
    "successful_endpoints": 4,
    "failed_endpoints": 0,
    "avg_response_time": 312,
    "tls_valid": true
  },
  "summary": "Daily post-launch monitoring completed. Status: valid. 4/4 endpoints operational.",
  "report_reference": "reports/postlaunch-status-2025-11-04.json",
  "next_review": "2025-11-05",
  "hash": "8f3b2c1d...",
  "merkleRoot": "a1b2c3d4...",
  "signature": null
}
```

**Verification:**
```bash
npm run ethics:verify-ledger
```

---

### 5.2 Escalation Paths

**Console Warning (Status: warning):**
- Logged to console output
- Captured in GitHub Actions summary
- No external notifications

**GitHub Issue (Status: degraded):**
- Automatically created via GitHub Actions
- Labels: `monitoring`, `governance`, `critical`, `block-10.1`
- Assigned to: Governance Officer
- Includes: Report artifact link, failed endpoints, action items

**Future Integration (Block 10.2/10.3):**
- Webhook notification to status page
- Email notification to governance@quantumpoly.ai
- Slack/Discord alerts for on-call team

---

### 5.3 Notification Hook Function

**Current Implementation:**
```javascript
async function notifyGovernance(message, severity = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = severity === 'warning' ? '⚠️' : severity === 'error' ? '❌' : 'ℹ️';
  console.log(`${prefix} [EWA Governance] ${timestamp} — ${message}`);
  
  // Future integration point:
  // if (process.env.GOVERNANCE_WEBHOOK_URL) {
  //   await fetch(process.env.GOVERNANCE_WEBHOOK_URL, { ... });
  // }
}
```

**Future Enhancement (Block 10.2):**
- Add `GOVERNANCE_WEBHOOK_URL` environment variable
- Implement webhook payload structure
- Add retry logic and timeout handling
- Log webhook responses to audit trail

---

## 6. Evidence Chain

### 6.1 Verification Commands

**Run Monitoring Locally:**
```bash
node scripts/ewa-postlaunch.mjs
```

**Check Report:**
```bash
cat reports/postlaunch-status-$(date +%Y-%m-%d).json | jq '.overall_status'
```

**Verify Ledger Entry:**
```bash
grep "postlaunch-monitoring-$(date +%Y-%m-%d)" governance/ledger/ledger.jsonl | jq
```

**Test Feedback API:**
```bash
curl -X POST http://localhost:3000/api/feedback/report \
  -H "Content-Type: application/json" \
  -d '{"type":"ethics","message":"Test feedback for governance transparency validation."}'
```

**View Feedback Logs:**
```bash
cat governance/feedback/feedback-$(date +%Y-%m-%d).jsonl | jq
```

---

### 6.2 Artifact Locations

| Artifact | Path | Retention |
|----------|------|-----------|
| Daily monitoring reports | `reports/postlaunch-status-YYYY-MM-DD.json` | Indefinite (git) |
| GitHub Actions artifacts | Workflow run artifacts | 365 days |
| Feedback submissions | `governance/feedback/feedback-YYYY-MM-DD.jsonl` | Indefinite (git) |
| Ledger entries | `governance/ledger/ledger.jsonl` | Indefinite (git) |
| Workflow logs | GitHub Actions logs | 90 days (default) |

---

### 6.3 Audit Trail

**Continuous Evidence:**
- Daily monitoring reports with timestamps
- Ledger entries with cryptographic hashes
- GitHub commit history for all changes
- Workflow execution logs with summaries

**Quarterly Evidence:**
- Aggregated feedback summaries
- Monitoring trend analysis
- Governance review reports
- Action item tracking

---

## 7. Success Criteria

### 7.1 Definition of Done

Block 10.1 is complete when ALL of the following are verified:

- [x] Monitoring script created (`scripts/ewa-postlaunch.mjs`)
- [x] GitHub Actions workflow created (`.github/workflows/ewa-postlaunch.yml`)
- [x] Feedback API implemented (`src/app/api/feedback/report/route.ts`)
- [x] Governance documentation complete (`BLOCK10.1_POSTLAUNCH_FEEDBACK.md`)
- [ ] First monitoring run executed successfully
- [ ] First feedback submission recorded
- [ ] Ledger entry created and verified
- [ ] Workflow artifacts uploaded and accessible

---

### 7.2 Operational Readiness

**Pre-Production Checklist:**
- [ ] Run monitoring script locally against production URL
- [ ] Verify TLS certificate validity
- [ ] Test feedback API with all feedback types
- [ ] Confirm ledger write permissions
- [ ] Validate GitHub Actions workflow execution
- [ ] Review escalation procedures with team

**Post-Production Validation:**
- [ ] First daily monitoring run completed (2025-11-05 02:00 UTC)
- [ ] Report artifact uploaded to GitHub
- [ ] Ledger entry created and verified
- [ ] Feedback API responding to public requests
- [ ] No critical errors in workflow logs

---

## 8. Future Enhancements

### 8.1 Block 10.2 — Real-Time Status Page

**Planned Features:**
- Public status page (`/status`)
- Real-time endpoint monitoring
- Historical uptime metrics
- Incident timeline
- Webhook notifications

**Implementation Date:** Q1 2026

---

### 8.2 Block 10.3 — Federated Trust Monitoring

**Planned Features:**
- Monitor federated partner endpoints
- Cross-validate trust proofs
- Automated partner health checks
- Federated incident response

**Implementation Date:** Q1 2026

---

### 8.3 Enhanced Feedback Processing

**Planned Features:**
- AI-powered feedback categorization
- Automated triage and routing
- Public feedback dashboard
- Response time tracking
- Feedback impact metrics

**Implementation Date:** Q2 2026

---

## 9. Known Limitations

### 9.1 Current Limitations

**Rate Limiting:**
- Basic in-memory rate limiting (resets on server restart)
- Not suitable for high-volume public traffic
- **Mitigation:** Implement Redis/database-backed rate limiting in Block 10.2

**Notification System:**
- Console logging only (no external alerts)
- Manual review of GitHub issues required
- **Mitigation:** Implement webhook/email notifications in Block 10.2

**Feedback Processing:**
- Manual review required (no automated triage)
- No public acknowledgment of feedback status
- **Mitigation:** Implement automated feedback dashboard in Block 10.3

**Monitoring Scope:**
- Basic HTTP checks only (no deep content validation)
- No performance metrics (Core Web Vitals, etc.)
- **Mitigation:** Integrate with Lighthouse CI and Web Vitals API in Block 10.2

---

### 9.2 Security Considerations

**Public Feedback API:**
- Open to spam/abuse (mitigated by rate limiting)
- No authentication required (by design)
- **Monitoring:** Review feedback logs daily for abuse patterns

**Ledger Write Permissions:**
- Script requires write access to `governance/ledger/ledger.jsonl`
- GitHub Actions bot has repository write permissions
- **Safeguard:** All changes committed to git with audit trail

---

## 10. Compliance & Governance

### 10.1 Alignment with QuantumPoly Governance Framework

| Block | Integration Point | Evidence |
|-------|-------------------|----------|
| 9.0 — Legal Compliance | GDPR-compliant feedback collection (optional contact) | Feedback API schema |
| 9.2 — Consent Management | No tracking cookies, transparent data handling | API documentation |
| 9.3 — Transparency Framework | Public feedback API, daily monitoring reports | JSONL storage |
| 9.5 — Ethical Autonomy | Autonomous monitoring, self-assessment | Monitoring script |
| 9.8 — Continuous Integrity | Daily integrity checks, ledger verification | Ledger integration |
| 10.0 — Public Baseline | Post-launch operational accountability | This block |

---

### 10.2 Responsible Parties

| Role | Responsibility | Contact |
|------|----------------|---------|
| **Governance Officer** | Review monitoring reports, respond to feedback, escalate issues | governance@quantumpoly.ai |
| **Technical Lead** | Maintain monitoring scripts, troubleshoot failures, update endpoints | engineering@quantumpoly.ai |
| **Accessibility Reviewer** | Review accessibility feedback, prioritize remediation | accessibility@quantumpoly.ai |
| **Security Officer** | Review incident reports, coordinate responses | security@quantumpoly.ai |

---

### 10.3 Review Schedule

| Review Type | Frequency | Scope | Next Review |
|-------------|-----------|-------|-------------|
| **Daily Monitoring** | Daily 02:00 UTC | Automated endpoint checks | Continuous |
| **Weekly Feedback** | Weekly | Review new feedback submissions | Ongoing |
| **Monthly Reports** | Monthly | Aggregate monitoring trends | 2025-12-01 |
| **Quarterly Governance** | 90 days | Full system review, feedback synthesis | 2026-02-10 |

---

## 11. Conclusion

Block 10.1 establishes continuous post-launch monitoring and ethical feedback loops, ensuring QuantumPoly maintains operational accountability after public release.

The system is designed to be:
- **Autonomous**: Runs daily without manual intervention
- **Transparent**: All reports and feedback stored in governance audit trail
- **Modular**: Prepared for future webhook/email integration
- **Audit-proof**: Cryptographic hashes, ledger entries, 365-day artifact retention

**The governance principle:**

> **"QuantumPoly is not just released — it monitors itself, learns from feedback, and maintains continuous governance accountability."**

This block is operational and will begin daily execution on 2025-11-05 at 02:00 UTC.

---

## 12. Appendices

### 12.1 Related Documents

- **Block 10.0:** `BLOCK10.0_PUBLIC_BASELINE_RELEASE.md`
- **Block 9.8:** `BLOCK9.8_CONTINUOUS_INTEGRITY.md`
- **Block 9.5:** `BLOCK9.5_ETHICAL_AUTONOMY.md`
- **Integrity Monitoring:** `.github/workflows/integrity-verification.yml`
- **EWA Analysis:** `scripts/ewa-analyze.mjs`

---

### 12.2 npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "postlaunch:monitor": "node scripts/ewa-postlaunch.mjs",
    "postlaunch:monitor:dry-run": "node scripts/ewa-postlaunch.mjs --dry-run",
    "postlaunch:check-report": "cat reports/postlaunch-status-$(date +%Y-%m-%d).json | jq",
    "feedback:view": "cat governance/feedback/feedback-$(date +%Y-%m-%d).jsonl | jq"
  }
}
```

---

### 12.3 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONITOR_BASE_URL` | `https://quantumpoly.ai` | Base URL for endpoint monitoring |
| `CHECK_LEDGER` | `false` | Enable ledger integrity verification |
| `GOVERNANCE_WEBHOOK_URL` | _(none)_ | Future: Webhook URL for notifications |

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-04  
**Status:** ✅ **IMPLEMENTED**  
**Next Review:** 2025-12-01 (Monthly Report)

---

*This document is part of the QuantumPoly Governance Architecture and is maintained under version control with cryptographic integrity verification.*

