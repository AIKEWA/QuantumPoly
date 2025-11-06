/**
 * @fileoverview EWA v2 Main Engine Orchestrator
 * @module lib/ewa/engine
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Main orchestrator for Ethical Autonomy & Self-Learning Governance
 * Coordinates statistical analysis, optional ML layer, insight generation, and ledger integration
 */

import { performMLAnalysis, isMLEnabled } from './engine/ml';
import { performStatisticalAnalysis } from './engine/statistics';
import { generateInsights } from './insights';
import { generateRecommendations } from './recommendations';
import { calculateTrustTrajectory } from './trust-trajectory';
import type { AnalysisResult } from './types';

/**
 * Engine configuration
 */
export interface EngineConfig {
  governanceLedgerPath?: string;
  consentLedgerPath?: string;
  enableML?: boolean;
  dryRun?: boolean;
}

/**
 * Run complete EWA v2 analysis
 * @param config Engine configuration
 * @returns Analysis result with insights and recommendations
 */
export async function runAnalysis(
  config: EngineConfig = {}
): Promise<AnalysisResult> {
  const {
    governanceLedgerPath = 'governance/ledger/ledger.jsonl',
    consentLedgerPath = 'governance/consent/ledger.jsonl',
    enableML = isMLEnabled(),
  } = config;

  console.log('🔍 EWA v2 Analysis Starting...');
  console.log(`   Governance Ledger: ${governanceLedgerPath}`);
  console.log(`   Consent Ledger: ${consentLedgerPath}`);
  console.log(`   ML Layer: ${enableML ? 'Enabled' : 'Disabled'}`);

  // Step 1: Statistical Analysis
  console.log('\n📊 Running statistical analysis...');
  const statistical = performStatisticalAnalysis(
    governanceLedgerPath,
    consentLedgerPath
  );

  console.log(`   EII Current: ${statistical.eii_analysis.current}`);
  console.log(`   EII Delta (30d): ${statistical.eii_analysis.delta_30d.toFixed(2)}`);
  console.log(`   Consent Users: ${statistical.consent_analysis.total_users}`);
  console.log(`   Security Anomalies: ${statistical.security_analysis.anomalies_detected}`);

  // Step 2: Optional ML Analysis
  let ml = undefined;
  if (enableML) {
    console.log('\n🤖 Running ML analysis...');
    ml = performMLAnalysis(statistical);
    if (ml) {
      console.log(`   Anomalies Detected: ${ml.anomalies.length}`);
      console.log(`   Patterns Detected: ${ml.patterns.length}`);
      console.log(`   EII Forecast (30d): ${ml.forecast.eii_30d.toFixed(1)}`);
    }
  }

  // Step 3: Generate Insights
  console.log('\n💡 Generating insights...');
  const insights = generateInsights(statistical, ml || undefined);
  console.log(`   Total Insights: ${insights.length}`);
  console.log(`   Critical: ${insights.filter((i) => i.severity === 'critical').length}`);
  console.log(`   Moderate: ${insights.filter((i) => i.severity === 'moderate').length}`);
  console.log(`   Low: ${insights.filter((i) => i.severity === 'low').length}`);
  console.log(`   Requiring Review: ${insights.filter((i) => i.requires_human_review).length}`);

  // Step 4: Calculate Trust Trajectory
  console.log('\n🎯 Calculating Trust Trajectory Indicator...');
  const trustTrajectory = calculateTrustTrajectory(statistical);
  console.log(`   TTI Score: ${trustTrajectory.tti_score}`);
  console.log(`   Trend: ${trustTrajectory.trend}`);
  console.log(`   Components: EII=${trustTrajectory.components.eii}, Consent=${trustTrajectory.components.consent_stability}, Security=${trustTrajectory.components.security_posture}`);

  // Step 5: Generate Recommendations
  console.log('\n📋 Generating recommendations...');
  const recommendations = generateRecommendations(insights, statistical);
  console.log(`   Total Recommendations: ${recommendations.length}`);
  console.log(`   High Priority: ${recommendations.filter((r) => r.priority === 'high').length}`);

  console.log('\n✅ EWA v2 Analysis Complete\n');

  return {
    timestamp: new Date().toISOString(),
    statistical,
    ml: ml || undefined,
    insights,
    trust_trajectory: trustTrajectory,
  };
}

/**
 * Run analysis and return summary
 * @param config Engine configuration
 * @returns Analysis summary
 */
export async function runAnalysisSummary(
  config: EngineConfig = {}
): Promise<{
  timestamp: string;
  tti_score: number;
  insights_count: number;
  critical_insights: number;
  recommendations_count: number;
  requires_review: boolean;
}> {
  const result = await runAnalysis(config);

  return {
    timestamp: result.timestamp,
    tti_score: result.trust_trajectory.tti_score,
    insights_count: result.insights.length,
    critical_insights: result.insights.filter((i) => i.severity === 'critical')
      .length,
    recommendations_count: generateRecommendations(
      result.insights,
      result.statistical
    ).length,
    requires_review: result.insights.some((i) => i.requires_human_review),
  };
}

