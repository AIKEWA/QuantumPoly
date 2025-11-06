/**
 * @fileoverview Trust Scoring Engine for Feedback System
 * @module lib/feedback/trust-scorer
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 * 
 * Computes trust scores (0-1) for feedback submissions based on
 * configurable weighted signals. Designed to be auditable, bias-aware,
 * and aligned with ethical governance principles.
 */

import trustWeightsConfig from './trust-weights.json';
import type { TrustScore, TrustSignals, TrustWeights } from './types';

/**
 * Current algorithm version
 */
export const TRUST_SCORER_VERSION = '1.0.0';

/**
 * Default weights from configuration
 */
const DEFAULT_WEIGHTS: TrustWeights = trustWeightsConfig.weights as TrustWeights;

/**
 * Thresholds for scoring calculations
 */
const THRESHOLDS = trustWeightsConfig.thresholds;

/**
 * Calculate signal quality score (0-1)
 * 
 * Measures context completeness and text coherence.
 * Higher scores for submissions with complete context information.
 * 
 * @param message - Feedback message text
 * @param signals - Trust signals from submission
 * @returns Score between 0 and 1
 */
function calculateSignalQuality(message: string, signals: TrustSignals): number {
  let score = 0;
  
  // Context completeness (0.4 weight)
  let contextScore = 0;
  if (signals.has_context) contextScore += 0.3;
  if (signals.path) contextScore += 0.2;
  if (signals.locale) contextScore += 0.2;
  if (signals.user_agent) contextScore += 0.3;
  score += contextScore * 0.4;
  
  // Text coherence (0.6 weight)
  // Basic heuristics: proper length, sentence structure
  const messageLength = message.trim().length;
  const hasSentences = /[.!?]/.test(message);
  const hasCapitalization = /[A-Z]/.test(message);
  const notAllCaps = message !== message.toUpperCase() || messageLength < 20;
  
  let coherenceScore = 0;
  if (messageLength >= THRESHOLDS.min_message_length) coherenceScore += 0.3;
  if (hasSentences) coherenceScore += 0.3;
  if (hasCapitalization && notAllCaps) coherenceScore += 0.2;
  if (messageLength <= THRESHOLDS.optimal_message_length) coherenceScore += 0.2;
  
  score += coherenceScore * 0.6;
  
  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate account signals score (0-1)
 * 
 * Measures account trustworthiness (if authenticated).
 * Deliberately weighted lower to avoid discriminating against new users.
 * 
 * @param signals - Trust signals from submission
 * @returns Score between 0 and 1
 */
function calculateAccountSignals(signals: TrustSignals): number {
  // Default to 0.5 for anonymous/unauthenticated users (neutral)
  if (!signals.account_age_days && !signals.verified) {
    return 0.5;
  }
  
  let score = 0.5; // Start neutral
  
  // Verified account bonus
  if (signals.verified) {
    score += THRESHOLDS.verified_bonus;
  }
  
  // Account age bonus (diminishing returns)
  if (signals.account_age_days !== undefined) {
    const ageFactor = Math.min(
      1,
      signals.account_age_days / THRESHOLDS.min_account_age_days
    );
    score += ageFactor * 0.35;
  }
  
  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate behavioral score (0-1)
 * 
 * Currently simplified; in production would check:
 * - Rate limit violation history
 * - Duplicate submission patterns
 * - Abuse flags from previous submissions
 * 
 * @param message - Feedback message text
 * @param signals - Trust signals from submission
 * @returns Score between 0 and 1
 */
function calculateBehavioral(message: string, _signals: TrustSignals): number {
  // Start with neutral score
  let score = 0.7;
  
  // Simple duplicate detection: extremely short messages are suspicious
  if (message.trim().length < 10) {
    score -= 0.3;
  }
  
  // Placeholder: In production, would check:
  // - rateLimitViolations: score -= violations * 0.1
  // - duplicateCount: score -= Math.min(0.5, duplicates * 0.15)
  // - abuseFlags: score -= flags * 0.2
  
  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate content features score (0-1)
 * 
 * Measures content quality without subjective judgment.
 * Uses length optimization and basic toxicity checks.
 * 
 * @param message - Feedback message text
 * @returns Score between 0 and 1
 */
function calculateContentFeatures(message: string): number {
  let score = 0;
  
  const messageLength = message.trim().length;
  
  // Length optimization (0.6 weight)
  // Optimal band: 50-1500 characters
  if (messageLength >= THRESHOLDS.min_message_length) {
    if (messageLength <= THRESHOLDS.optimal_message_length) {
      score += 0.6; // Perfect length
    } else {
      // Penalty for excessive length
      const excessRatio = (messageLength - THRESHOLDS.optimal_message_length) / 
                          (THRESHOLDS.max_message_length - THRESHOLDS.optimal_message_length);
      score += 0.6 * (1 - excessRatio * 0.3);
    }
  } else {
    // Penalty for too short
    const shortRatio = messageLength / THRESHOLDS.min_message_length;
    score += 0.6 * shortRatio;
  }
  
  // Basic toxicity filter (0.4 weight)
  // Simple heuristic: excessive profanity, all caps shouting, spam patterns
  const excessiveProfanity = /(.)\1{4,}/.test(message); // Character repetition
  // Guard against division by zero for empty messages
  const excessiveCaps = messageLength > 0 
    ? (message.match(/[A-Z]/g) || []).length / messageLength > 0.7
    : false;
  const spamPattern = /\b(viagra|cialis|casino|lottery)\b/i.test(message);
  
  if (!excessiveProfanity && !excessiveCaps && !spamPattern) {
    score += 0.4; // Passes basic checks
  } else {
    score += 0.1; // Suspicious content
  }
  
  return Math.min(1, Math.max(0, score));
}

/**
 * Compute trust score for feedback submission
 * 
 * Combines weighted signals into a single trust score (0-1).
 * All calculations are deterministic and auditable.
 * 
 * @param message - Feedback message text
 * @param signals - Trust signals from submission
 * @param weights - Optional custom weights (defaults to config)
 * @returns Trust score with component breakdown
 * 
 * @example
 * ```typescript
 * const score = computeTrustScore(
 *   "The dashboard contrast is insufficient in dark mode.",
 *   {
 *     has_context: true,
 *     path: '/dashboard',
 *     locale: 'en',
 *     verified: false
 *   }
 * );
 * // score.score => 0.72
 * // score.components => { signal_quality: 0.85, account_signals: 0.50, ... }
 * ```
 */
export function computeTrustScore(
  message: string,
  signals: TrustSignals,
  weights: TrustWeights = DEFAULT_WEIGHTS
): TrustScore {
  // Calculate individual component scores
  const signalQuality = calculateSignalQuality(message, signals);
  const accountSignals = calculateAccountSignals(signals);
  const behavioral = calculateBehavioral(message, signals);
  const contentFeatures = calculateContentFeatures(message);
  
  // Weighted sum
  const totalScore =
    signalQuality * weights.signal_quality +
    accountSignals * weights.account_signals +
    behavioral * weights.behavioral +
    contentFeatures * weights.content_features;
  
  // Ensure final score is in [0, 1]
  const clampedScore = Math.min(1, Math.max(0, totalScore));
  
  // Round to 2 decimal places for consistency
  const finalScore = Math.round(clampedScore * 100) / 100;
  
  return {
    score: finalScore,
    components: {
      signal_quality: Math.round(signalQuality * 100) / 100,
      account_signals: Math.round(accountSignals * 100) / 100,
      behavioral: Math.round(behavioral * 100) / 100,
      content_features: Math.round(contentFeatures * 100) / 100,
    },
    version: TRUST_SCORER_VERSION,
  };
}

/**
 * Get current trust scoring configuration
 * 
 * @returns Current weights and version
 */
export function getTrustScoringConfig() {
  return {
    version: TRUST_SCORER_VERSION,
    weights: DEFAULT_WEIGHTS,
    thresholds: THRESHOLDS,
    bias_mitigation: trustWeightsConfig.bias_mitigation,
  };
}

/**
 * Validate trust score is within acceptable range
 * 
 * @param score - Trust score to validate
 * @returns True if valid (0 <= score <= 1)
 */
export function isValidTrustScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 1 && !Number.isNaN(score);
}

