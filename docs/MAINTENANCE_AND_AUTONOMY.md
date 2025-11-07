# 🧭 QuantumPoly Maintenance & Autonomy Manual

_Last Updated: 2025-11-06 by A.I.K & EWA_

## 1. Monitoring & Cron Jobs (UTC)

- **Daily Governance Report** — 00:00 UTC → `/reports/monitoring-YYYY-MM-DD.json`
- **Weekly Summary** — Sunday 23:59 UTC → `/reports/weekly-summary-YYYY-WW.json`
- **Audit Cycle** — Every 90 days → `/reports/audit-YYYY-MM.json`

## 2. Ledger Verification (Command & Success Signal)

```bash
node scripts/verify-stage-vi-closure.mjs
```

**Success criteria:** exit code `0` and line `LEDGER_VERIFIED:true` in `/reports/ledger-verify-YYYY-MM-DD.json`.

## 3. Feedback & Trust Monitoring

- Aggregates: `governance/feedback/aggregates/trust-trend.json`
- Required keys: `trust_score`, `consent_score`, `engagement_index`
- Alerts: email to `governance@quantumpoly.ai` (optional `.mailhook`)

## 4. Accessibility Re-Audit Cycles

- Automated every 90 days via `a11y.yml`
- Report: `/reports/accessibility-audit.json`
- Gate: any `a11y_violation=true` triggers escalation (see §5)

## 5. Human Intervention (and only then)

Triggers: `ledger_break`, `audit_fail`, `security_violation`
Actions:

1. Pause affected workflows
2. File incident under `/incidents/INC-YYYYMMDD-<slug>.md`
3. Run hotfix playbook and document decisions

## 6. Responsibilities (2025–2026)

| Name                 | Role                     | Period    |
| -------------------- | ------------------------ | --------- |
| Aykut Aydin (A.I.K.) | Engineering & Infra Lead | 2025–2026 |
| E.W. Armstrong (EWA) | Governance & Ethics Lead | 2025–2026 |

## 7. Acceptance Criteria (Doc-Driven)

- `reports/monitoring-<date>.json` exists after daily run
- `reports/weekly-summary-<week>.json` exists after weekly run
- `governance/feedback/aggregates/trust-trend.json` present with all keys
- `accessibility-audit.json` present or scheduled within next 90-day window
- `LEDGER_VERIFIED:true` emitted within last 24h

## 8. Security Notes

- Store `GPG_KEY_ID`, `GPG_PRIVATE_KEY` in GitHub **repository secrets**
- No secrets in repo files; enforce least privilege on CI tokens

## 9. Troubleshooting Quick Wins

- YAML multiline: wrap any Markdown/logs in `run: |`
- Cron not firing: check repo visibility & default branch protection
- Missing reports: confirm write path and Action artifact retention
- Node drift: pin to Node `v20.17.25`
- Email alerts: ensure `.mailhook` contains `governance@quantumpoly.ai`
