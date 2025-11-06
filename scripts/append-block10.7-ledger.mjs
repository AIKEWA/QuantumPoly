#!/usr/bin/env node

/**
 * Append Block 10.7 Ledger Entry
 * 
 * Creates and appends the Block 10.7 activation entry to the governance ledger
 * with computed hash and Merkle root.
 */

import fs from 'fs';
import crypto from 'crypto';

function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Create ledger entry
const entry = {
  entry_id: "entry-block10.7-daily-reports",
  ledger_entry_type: "daily_heartbeat_activation",
  block_id: "10.7",
  title: "Daily Governance Reports — Ethical Heartbeat System Activated",
  version: "1.0.0",
  status: "approved",
  approved_date: "2025-11-05",
  timestamp: new Date().toISOString(),
  responsible_roles: [
    "Governance Officer",
    "Transparency Engineer",
    "EWA v2"
  ],
  regulations: [
    "GDPR 2016/679 Art. 5(2)",
    "DSG 2023 Art. 19, 25",
    "ISO 42001"
  ],
  documents: [
    "BLOCK10.7_DAILY_GOVERNANCE_REPORTS.md",
    "scripts/monitor-system.mjs",
    "scripts/daily-governance-report.mjs",
    "scripts/weekly-governance-summary.mjs",
    "scripts/verify-daily-reports.mjs",
    "schemas/daily-governance-report.schema.json",
    "schemas/weekly-governance-summary.schema.json",
    ".github/workflows/daily-governance-report.yml"
  ],
  summary: "Daily Governance Reports system operational. Automated daily reporting at 00:00 UTC, weekly summaries on Sundays at 23:59 UTC. 7-year retention via GitHub Actions artifacts. Zero PII exposure. Cryptographic integrity verification via SHA-256 hashing and ledger anchoring. Continuous ethical heartbeat established.",
  components: [
    "MonitoringScript",
    "DailyReportGenerator",
    "WeeklySummaryAggregator",
    "ReportVerifier",
    "GitHubActionsWorkflow"
  ],
  features: [
    "Autonomous system monitoring",
    "Daily governance reports (00:00 UTC)",
    "Weekly summaries (Sunday 23:59 UTC)",
    "SHA-256 integrity verification",
    "7-year artifact retention",
    "Zero PII exposure",
    "Ledger anchoring",
    "Anomaly detection",
    "Trust trend analysis",
    "EII 7-day rolling average",
    "Cryptographic proof chain",
    "Public verification APIs",
    "Manual trigger support",
    "Escalation on critical failures"
  ],
  metrics: {
    scripts_created: 4,
    schemas_created: 2,
    workflows_created: 1,
    documentation_pages: 1,
    retention_days: 2555,
    report_frequency_hours: 24,
    summary_frequency_days: 7
  },
  data_sources: [
    "governance/integrity/reports/*.json",
    "reports/monitoring/*.json",
    "governance/feedback/aggregates/*.json",
    "governance/ledger/ledger.jsonl",
    "governance/consent/ledger.jsonl",
    "governance/federation/ledger.jsonl"
  ],
  reporting_schedule: {
    daily: "00:00 UTC",
    weekly: "Sunday 23:59 UTC",
    retention: "7 years (GitHub Actions artifacts)"
  },
  next_review: "2026-05-05",
  hash: "",
  merkleRoot: "",
  signature: null
};

// Compute hash (exclude hash, merkleRoot, signature)
const entryForHash = { ...entry };
delete entryForHash.hash;
delete entryForHash.merkleRoot;
delete entryForHash.signature;

entry.hash = sha256(JSON.stringify(entryForHash, Object.keys(entryForHash).sort()));

// Compute Merkle root
const merkleComponents = [
  entry.entry_id,
  entry.timestamp,
  entry.block_id,
  JSON.stringify(entry.documents),
  entry.hash
];
entry.merkleRoot = sha256(merkleComponents.join(''));

// Append to ledger
const ledgerPath = 'governance/ledger/ledger.jsonl';
const ledgerLine = JSON.stringify(entry) + '\n';

fs.appendFileSync(ledgerPath, ledgerLine, 'utf8');

console.log('✅ Block 10.7 ledger entry appended');
console.log(`   Entry ID: ${entry.entry_id}`);
console.log(`   Hash: ${entry.hash.slice(0, 16)}...`);
console.log(`   Merkle Root: ${entry.merkleRoot.slice(0, 16)}...`);
console.log(`   Timestamp: ${entry.timestamp}`);

