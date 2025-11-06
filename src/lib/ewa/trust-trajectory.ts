/**
 * @fileoverview Trust Trajectory Indicator (TTI) Calculator
 * @module lib/ewa/trustTrajectory
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Calculates composite trust metric from EII, consent stability, and security posture
 */

import fs from 'fs';
import path from 'path';

import type { TrustTrajectory, StatisticalAnalysis } from './types';

/**
 * TTI configuration
 */
interface TTIConfig {
  version: string;
  weights: {
    eii: number;
    consent: number;
    security: number;
  };
  optional_factors: {
    eii_velocity: number;
    eii_volatility: number;
  };
}

/**
 * Load TTI configuration
 * @returns TTI configuration
 */
function loadTTIConfig(): TTIConfig {
  const configPath = path.join(
    process.cwd(),
    'src/lib/ewa/config/trustTrajectory.json'
  );

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as TTIConfig;
  } catch (error) {
    console.warn('Failed to load TTI config, using defaults');
    return {
      version: '1.0.0',
      weights: { eii: 0.4, consent: 0.3, security: 0.3 },
      optional_factors: { eii_velocity: 0.0, eii_volatility: 0.0 },
    };
  }
}

/**
 * Calculate Trust Trajectory Indicator
 * @param analysis Statistical analysis result
 * @returns Trust trajectory data
 */
export function calculateTrustTrajectory(
  analysis: StatisticalAnalysis
): TrustTrajectory {
  const config = loadTTIConfig();

  // Component 1: EII Score (normalized to 0-100)
  const eiiScore = analysis.eii_analysis.current;

  // Component 2: Consent Stability (inverse of withdrawal rate, normalized)
  const withdrawalRate = analysis.consent_analysis.withdrawal_rate;
  const consentStability = Math.max(0, 100 - withdrawalRate * 2); // 50% withdrawal = 0 stability

  // Component 3: Security Posture
  const securityScore = analysis.security_analysis.current_score;

  // Calculate weighted TTI
  let ttiScore =
    eiiScore * config.weights.eii +
    consentStability * config.weights.consent +
    securityScore * config.weights.security;

  // Apply optional factors
  const velocity = analysis.eii_analysis.delta_30d; // Rate of change
  const volatility = analysis.eii_analysis.volatility;

  if (config.optional_factors.eii_velocity !== 0) {
    ttiScore += velocity * config.optional_factors.eii_velocity;
  }

  if (config.optional_factors.eii_volatility !== 0) {
    ttiScore -= volatility * config.optional_factors.eii_volatility; // Volatility reduces trust
  }

  // Clamp to 0-100 range
  ttiScore = Math.max(0, Math.min(100, ttiScore));

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining';
  if (velocity > 2) {
    trend = 'improving';
  } else if (velocity < -2) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  return {
    timestamp: new Date().toISOString(),
    tti_score: Math.round(ttiScore * 10) / 10,
    components: {
      eii: eiiScore,
      consent_stability: Math.round(consentStability * 10) / 10,
      security_posture: securityScore,
    },
    trend,
    velocity,
    volatility,
  };
}

/**
 * Format TTI for display
 * @param tti Trust trajectory data
 * @returns Display properties
 */
export function formatTTI(tti: TrustTrajectory): {
  label: string;
  color: string;
  icon: string;
} {
  if (tti.tti_score >= 90) {
    return { label: 'Excellent', color: 'green', icon: '✓' };
  } else if (tti.tti_score >= 80) {
    return { label: 'Good', color: 'blue', icon: '✓' };
  } else if (tti.tti_score >= 70) {
    return { label: 'Fair', color: 'yellow', icon: '⚠' };
  } else {
    return { label: 'Needs Improvement', color: 'red', icon: '⚠️' };
  }
}

/**
 * Get TTI history over time
 * @param analyses Array of historical statistical analyses
 * @returns TTI history
 */
export function getTTIHistory(
  analyses: StatisticalAnalysis[]
): TrustTrajectory[] {
  return analyses.map((analysis) => calculateTrustTrajectory(analysis));
}

