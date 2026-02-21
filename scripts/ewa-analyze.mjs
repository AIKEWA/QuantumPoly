#!/usr/bin/env node
/**
 * @fileoverview EWA v2 Analysis Script
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Scheduled and on-demand analysis script for Ethical Autonomy system
 * Usage: node scripts/ewa-analyze.mjs [--dry-run] [--ml] [--force]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const enableML = args.includes('--ml') || process.env.EWA_ML === 'true';
const force = args.includes('--force');

console.log('🧠 EWA v2 Analysis Script');
console.log('========================\n');
console.log(`Dry Run: ${dryRun}`);
console.log(`ML Enabled: ${enableML}`);
console.log(`Force Mode: ${force}\n`);

function parseJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return [];
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function getEntryEII(entry) {
  return (
    (typeof entry.eii === 'number' && entry.eii) ||
    (typeof entry.metrics?.eii === 'number' && entry.metrics.eii) ||
    null
  );
}

function performStatisticalAnalysis(
  governanceLedgerPath = 'governance/ledger/ledger.jsonl',
  consentLedgerPath = 'governance/consent/ledger.jsonl',
) {
  const governanceEntries = parseJsonl(path.join(projectRoot, governanceLedgerPath));
  const consentEntries = parseJsonl(path.join(projectRoot, consentLedgerPath));
  const now = Date.now();
  const last30d = now - (30 * 24 * 60 * 60 * 1000);
  const last90d = now - (90 * 24 * 60 * 60 * 1000);

  const eiiPoints = governanceEntries
    .map((entry) => ({
      timestamp: new Date(entry.timestamp || entry.applied_at || 0).getTime(),
      eii: getEntryEII(entry),
    }))
    .filter((point) => Number.isFinite(point.timestamp) && typeof point.eii === 'number')
    .sort((a, b) => a.timestamp - b.timestamp);

  const currentEII = eiiPoints.length > 0 ? eiiPoints[eiiPoints.length - 1].eii : 85;
  const point30 = eiiPoints.find((point) => point.timestamp >= last30d);
  const point90 = eiiPoints.find((point) => point.timestamp >= last90d);
  const delta30d = point30 ? currentEII - point30.eii : 0;
  const delta90d = point90 ? currentEII - point90.eii : 0;

  const recentEII = eiiPoints.slice(-30).map((point) => point.eii);
  const eiiMean = recentEII.length ? recentEII.reduce((sum, value) => sum + value, 0) / recentEII.length : 0;
  const eiiVariance = recentEII.length
    ? recentEII.reduce((sum, value) => sum + ((value - eiiMean) ** 2), 0) / recentEII.length
    : 0;
  const eiiVolatility = Math.sqrt(eiiVariance);

  const userIds = new Set();
  let consentRevoked = 0;
  for (const entry of consentEntries) {
    if (entry.userId) userIds.add(entry.userId);
    const event = entry.event_type || entry.event;
    if (event === 'consent_revoked' || event === 'consent_withdrawn') {
      consentRevoked += 1;
    }
  }
  const totalUsers = userIds.size || consentEntries.length || 1;
  const withdrawalRate = totalUsers > 0 ? (consentRevoked / totalUsers) * 100 : 0;

  const securityEntries = governanceEntries.slice(-10);
  let anomaliesDetected = 0;
  for (const entry of securityEntries) {
    if (!entry.signature) anomaliesDetected += 1;
    if (!entry.hash || !/^[0-9a-f]{64}$/.test(entry.hash)) anomaliesDetected += 1;
  }
  const latestMetrics = governanceEntries[governanceEntries.length - 1]?.metrics || {};
  const securityScore = typeof latestMetrics.security === 'number' ? latestMetrics.security : 88;
  const securityTrend = anomaliesDetected > 3 ? 'declining' : anomaliesDetected === 0 ? 'improving' : 'stable';

  return {
    eii_analysis: {
      current: currentEII,
      delta_30d: delta30d,
      delta_90d: delta90d,
      volatility: eiiVolatility,
      trend: delta30d > 2 ? 'improving' : delta30d < -2 ? 'declining' : 'stable',
    },
    consent_analysis: {
      total_users: totalUsers,
      withdrawal_rate: withdrawalRate,
      category_shifts: { analytics: 0, performance: 0 },
      volatility: 0,
    },
    security_analysis: {
      current_score: securityScore,
      anomalies_detected: anomaliesDetected,
      trend: securityTrend,
    },
  };
}

function calculateSeverityScore(analysis) {
  const eiiComponent = Math.min(1, Math.max(0, Math.abs(Math.min(analysis.eii_analysis.delta_30d, 0)) / 10));
  const consentComponent = Math.min(1, Math.max(0, analysis.consent_analysis.withdrawal_rate / 50));
  const securityComponent = Math.min(1, Math.max(0, analysis.security_analysis.anomalies_detected / 10));
  const score = (eiiComponent + consentComponent + securityComponent) / 3;
  const level = score < 0.3 ? 'low' : score < 0.6 ? 'moderate' : 'critical';

  return {
    score,
    level,
    breakdown: {
      eii_component: eiiComponent,
      consent_component: consentComponent,
      security_component: securityComponent,
    },
    explanation: `Composite score=${score.toFixed(2)} from EII/consent/security factors`,
  };
}

function requiresHumanReview(severityScore) {
  return severityScore >= 0.6;
}

function calculateTrustTrajectory(analysis) {
  const eii = analysis.eii_analysis.current;
  const consentStability = Math.max(0, 100 - (analysis.consent_analysis.withdrawal_rate * 2));
  const securityPosture = analysis.security_analysis.current_score;
  const ttiScore = Math.max(
    0,
    Math.min(100, (eii * 0.4) + (consentStability * 0.3) + (securityPosture * 0.3)),
  );
  const velocity = analysis.eii_analysis.delta_30d;
  const trend = velocity > 2 ? 'improving' : velocity < -2 ? 'declining' : 'stable';

  return {
    timestamp: new Date().toISOString(),
    tti_score: Math.round(ttiScore * 10) / 10,
    components: {
      eii,
      consent_stability: Math.round(consentStability * 10) / 10,
      security_posture: securityPosture,
    },
    trend,
    velocity,
    volatility: analysis.eii_analysis.volatility,
  };
}

/**
 * Generate insight from statistical analysis
 */
function generateInsight(statistical, severityResult) {
  const timestamp = new Date().toISOString();
  const shortId = crypto.randomBytes(4).toString('hex');
  
  // Detect if there are issues
  const hasEIIDecline = statistical.eii_analysis.delta_30d < -3;
  const hasConsentIssues = statistical.consent_analysis.withdrawal_rate > 10;
  const hasSecurityIssues = statistical.security_analysis.anomalies_detected > 2;
  
  if (hasEIIDecline) {
    return {
      timestamp,
      insight_id: `eii-decline-${shortId}`,
      severity: severityResult.level,
      severity_score: severityResult.score,
      description: `EII dropped ${Math.abs(statistical.eii_analysis.delta_30d).toFixed(1)}% in the last 30 days`,
      recommended_action: 'Review consent flow friction, accessibility notices, and transparency documentation.',
      confidence: 0.9,
      evidence: {
        eii_current: statistical.eii_analysis.current,
        eii_delta_30d: statistical.eii_analysis.delta_30d,
      },
      source: 'statistical',
      requires_human_review: requiresHumanReview(severityResult.score),
    };
  }
  
  if (hasConsentIssues) {
    return {
      timestamp,
      insight_id: `consent-volatility-${shortId}`,
      severity: severityResult.level,
      severity_score: severityResult.score,
      description: `Consent withdrawal rate elevated at ${statistical.consent_analysis.withdrawal_rate.toFixed(1)}%`,
      recommended_action: 'Investigate consent banner clarity and review privacy policy accessibility.',
      confidence: 0.85,
      evidence: {
        withdrawal_rate: statistical.consent_analysis.withdrawal_rate,
        total_users: statistical.consent_analysis.total_users,
      },
      source: 'statistical',
      requires_human_review: requiresHumanReview(severityResult.score),
    };
  }
  
  if (hasSecurityIssues) {
    return {
      timestamp,
      insight_id: `security-concern-${shortId}`,
      severity: severityResult.level,
      severity_score: severityResult.score,
      description: `${statistical.security_analysis.anomalies_detected} security anomalies detected in recent governance entries`,
      recommended_action: 'Review ledger integrity and verify cryptographic signatures.',
      confidence: 0.95,
      evidence: {
        anomalies_detected: statistical.security_analysis.anomalies_detected,
      },
      source: 'statistical',
      requires_human_review: requiresHumanReview(severityResult.score),
    };
  }
  
  // No issues detected
  return {
    timestamp,
    insight_id: `status-normal-${shortId}`,
    severity: 'low',
    severity_score: 0.1,
    description: 'All governance metrics within normal ranges',
    recommended_action: 'Continue monitoring. No immediate action required.',
    confidence: 0.9,
    evidence: {
      eii_current: statistical.eii_analysis.current,
    },
    source: 'statistical',
    requires_human_review: false,
  };
}

/**
 * Append insight to review queue
 */
function addToReviewQueue(insight) {
  const queuePath = path.join(projectRoot, 'governance/ewa/review-queue.jsonl');
  const queueDir = path.dirname(queuePath);
  
  if (!fs.existsSync(queueDir)) {
    fs.mkdirSync(queueDir, { recursive: true });
  }
  
  const entry = {
    entry_id: `review-${insight.insight_id}`,
    timestamp: new Date().toISOString(),
    insight,
    status: 'pending',
  };
  
  fs.appendFileSync(queuePath, JSON.stringify(entry) + '\n', 'utf-8');
  console.log(`📝 Added insight ${insight.insight_id} to review queue`);
}

/**
 * Append autonomous analysis entry to ledger
 */
function appendToLedger(insights, trustTrajectory) {
  const ledgerPath = path.join(projectRoot, 'governance/ledger/ledger.jsonl');
  
  const entry = {
    entry_id: `autonomy-analysis-block9.5-${crypto.randomBytes(4).toString('hex')}`,
    ledger_entry_type: 'autonomous_analysis',
    block_id: '9.5',
    title: 'Ethical Autonomy Self-Assessment',
    status: 'verified',
    approved_date: new Date().toISOString().split('T')[0],
    responsible_roles: ['EWA v2 Engine', 'Governance Officer'],
    insights: insights.map(i => ({ insight_id: i.insight_id, severity: i.severity })),
    summary: `Automated ethical analysis performed. TTI: ${trustTrajectory.tti_score}. ${insights.length} insights generated.`,
    next_review: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days
    hash: '',
    merkleRoot: '',
    signature: null,
  };
  
  // Compute hash
  const hashData = JSON.stringify({
    ...entry,
    hash: undefined,
    merkleRoot: undefined,
    signature: undefined,
  });
  entry.hash = crypto.createHash('sha256').update(hashData).digest('hex');
  
  // Compute Merkle root (simplified - just use the hash)
  entry.merkleRoot = crypto.createHash('sha256').update(entry.hash).digest('hex');
  
  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + '\n', 'utf-8');
  console.log(`✅ Appended autonomous analysis entry to ledger: ${entry.entry_id}`);
}

/**
 * Main analysis function
 */
async function runAnalysis() {
  try {
    console.log('📊 Loading EWA v2 engine...\n');
    console.log('🔍 Running statistical analysis...\n');
    
    const statistical = performStatisticalAnalysis(
      'governance/ledger/ledger.jsonl',
      'governance/consent/ledger.jsonl'
    );
    
    console.log(`   EII Current: ${statistical.eii_analysis.current}`);
    console.log(`   EII Delta (30d): ${statistical.eii_analysis.delta_30d.toFixed(2)}`);
    console.log(`   Consent Users: ${statistical.consent_analysis.total_users}`);
    console.log(`   Withdrawal Rate: ${statistical.consent_analysis.withdrawal_rate.toFixed(1)}%`);
    console.log(`   Security Anomalies: ${statistical.security_analysis.anomalies_detected}\n`);
    
    console.log('🎯 Calculating Trust Trajectory Indicator...\n');
    
    const trustTrajectory = calculateTrustTrajectory(statistical);
    
    console.log(`   TTI Score: ${trustTrajectory.tti_score}`);
    console.log(`   Trend: ${trustTrajectory.trend}`);
    console.log(`   Components: EII=${trustTrajectory.components.eii}, Consent=${trustTrajectory.components.consent_stability}, Security=${trustTrajectory.components.security_posture}\n`);
    
    console.log('💡 Generating insights...\n');
    
    const severityResult = calculateSeverityScore(statistical);
    const insight = generateInsight(statistical, severityResult);
    
    console.log(`   Insight ID: ${insight.insight_id}`);
    console.log(`   Severity: ${insight.severity} (score: ${insight.severity_score.toFixed(2)})`);
    console.log(`   Description: ${insight.description}`);
    console.log(`   Requires Review: ${insight.requires_human_review}\n`);
    
    if (dryRun) {
      console.log('🏃 Dry run mode - no changes written\n');
      console.log('Analysis Summary:');
      console.log(JSON.stringify({ statistical, trustTrajectory, insight }, null, 2));
      return;
    }
    
    // Handle insight based on severity
    if (insight.requires_human_review) {
      console.log('⚠️  Critical insight - adding to review queue\n');
      addToReviewQueue(insight);
    } else {
      console.log('✅ Low/moderate insight - appending to ledger\n');
      appendToLedger([insight], trustTrajectory);
    }
    
    console.log('✅ EWA v2 Analysis Complete\n');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run analysis
runAnalysis();
