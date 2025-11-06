/**
 * @fileoverview Trust Scorer Tests
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 */

import {
  computeTrustScore,
  getTrustScoringConfig,
  isValidTrustScore,
  TRUST_SCORER_VERSION,
} from '@/lib/feedback/trust-scorer';
import type { TrustSignals } from '@/lib/feedback/types';

describe('Trust Scorer', () => {
  describe('computeTrustScore', () => {
    it('should return a score between 0 and 1', () => {
      const message = 'The dashboard has poor contrast in dark mode.';
      const signals: TrustSignals = {
        has_context: true,
        path: '/dashboard',
        locale: 'en',
      };
      
      const result = computeTrustScore(message, signals);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
    
    it('should include all component scores', () => {
      const message = 'Test feedback message.';
      const signals: TrustSignals = {};
      
      const result = computeTrustScore(message, signals);
      
      expect(result.components).toHaveProperty('signal_quality');
      expect(result.components).toHaveProperty('account_signals');
      expect(result.components).toHaveProperty('behavioral');
      expect(result.components).toHaveProperty('content_features');
    });
    
    it('should include version in result', () => {
      const message = 'Test message.';
      const signals: TrustSignals = {};
      
      const result = computeTrustScore(message, signals);
      
      expect(result.version).toBe(TRUST_SCORER_VERSION);
    });
    
    it('should score high-quality feedback higher', () => {
      const highQualityMessage = 'The governance dashboard has insufficient color contrast in dark mode for chart labels. This makes it difficult to read. I suggest increasing the contrast ratio to meet WCAG AA standards.';
      const lowQualityMessage = 'bad';
      
      const highQualitySignals: TrustSignals = {
        has_context: true,
        path: '/dashboard',
        locale: 'en',
        user_agent: 'Mozilla/5.0',
        verified: true,
        account_age_days: 90,
      };
      
      const lowQualitySignals: TrustSignals = {};
      
      const highScore = computeTrustScore(highQualityMessage, highQualitySignals);
      const lowScore = computeTrustScore(lowQualityMessage, lowQualitySignals);
      
      expect(highScore.score).toBeGreaterThan(lowScore.score);
    });
    
    it('should handle verified accounts appropriately', () => {
      const message = 'Good feedback with proper length and structure.';
      
      const verifiedSignals: TrustSignals = {
        verified: true,
        account_age_days: 100,
      };
      
      const unverifiedSignals: TrustSignals = {
        verified: false,
      };
      
      const verifiedScore = computeTrustScore(message, verifiedSignals);
      const unverifiedScore = computeTrustScore(message, unverifiedSignals);
      
      expect(verifiedScore.components.account_signals).toBeGreaterThan(
        unverifiedScore.components.account_signals
      );
    });
    
    it('should penalize very short messages', () => {
      const normalMessage = 'This is a reasonable feedback message with sufficient detail.';
      const shortMessage = 'bad';
      const signals: TrustSignals = {};
      
      const normalScore = computeTrustScore(normalMessage, signals);
      const shortScore = computeTrustScore(shortMessage, signals);
      
      expect(normalScore.score).toBeGreaterThan(shortScore.score);
    });
    
    it('should handle messages with good context', () => {
      const message = 'The button is hard to click on mobile devices.';
      
      const withContext: TrustSignals = {
        has_context: true,
        path: '/settings',
        locale: 'en',
        user_agent: 'Mozilla/5.0',
      };
      
      const withoutContext: TrustSignals = {};
      
      const withContextScore = computeTrustScore(message, withContext);
      const withoutContextScore = computeTrustScore(message, withoutContext);
      
      expect(withContextScore.components.signal_quality).toBeGreaterThan(
        withoutContextScore.components.signal_quality
      );
    });
    
    it('should round scores to 2 decimal places', () => {
      const message = 'Test message with reasonable length and structure.';
      const signals: TrustSignals = {
        has_context: true,
        verified: true,
      };
      
      const result = computeTrustScore(message, signals);
      
      // Check that score has at most 2 decimal places
      const decimalPlaces = (result.score.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
    
    it('should handle empty signals gracefully', () => {
      const message = 'Test feedback message.';
      const signals: TrustSignals = {};
      
      expect(() => computeTrustScore(message, signals)).not.toThrow();
      
      const result = computeTrustScore(message, signals);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
    
    it('should use custom weights when provided', () => {
      const message = 'Test message.';
      const signals: TrustSignals = {
        verified: true,
      };
      
      const customWeights = {
        signal_quality: 0.25,
        account_signals: 0.5, // Increased from default 0.25
        behavioral: 0.15,
        content_features: 0.1,
      };
      
      const defaultResult = computeTrustScore(message, signals);
      const customResult = computeTrustScore(message, signals, customWeights);
      
      // With higher account_signals weight, verified users should score higher
      expect(customResult.score).not.toBe(defaultResult.score);
    });
  });
  
  describe('getTrustScoringConfig', () => {
    it('should return current configuration', () => {
      const config = getTrustScoringConfig();
      
      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('weights');
      expect(config).toHaveProperty('thresholds');
      expect(config).toHaveProperty('bias_mitigation');
    });
    
    it('should return correct version', () => {
      const config = getTrustScoringConfig();
      expect(config.version).toBe(TRUST_SCORER_VERSION);
    });
    
    it('should have weights that sum to approximately 1', () => {
      const config = getTrustScoringConfig();
      const sum = Object.values(config.weights).reduce((a, b) => a + b, 0);
      
      expect(sum).toBeCloseTo(1.0, 2);
    });
  });
  
  describe('isValidTrustScore', () => {
    it('should accept valid scores', () => {
      expect(isValidTrustScore(0)).toBe(true);
      expect(isValidTrustScore(0.5)).toBe(true);
      expect(isValidTrustScore(1)).toBe(true);
      expect(isValidTrustScore(0.72)).toBe(true);
    });
    
    it('should reject invalid scores', () => {
      expect(isValidTrustScore(-0.1)).toBe(false);
      expect(isValidTrustScore(1.1)).toBe(false);
      expect(isValidTrustScore(NaN)).toBe(false);
      expect(isValidTrustScore(Infinity)).toBe(false);
      expect(isValidTrustScore(-Infinity)).toBe(false);
    });
    
    it('should reject non-number inputs', () => {
      expect(isValidTrustScore('0.5' as unknown as number)).toBe(false);
      expect(isValidTrustScore(null as unknown as number)).toBe(false);
      expect(isValidTrustScore(undefined as unknown as number)).toBe(false);
      expect(isValidTrustScore({} as unknown as number)).toBe(false);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(2000);
      const signals: TrustSignals = {};
      
      expect(() => computeTrustScore(longMessage, signals)).not.toThrow();
      
      const result = computeTrustScore(longMessage, signals);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
    
    it('should handle messages with special characters', () => {
      const message = 'Test with émojis 🎉 and spëcial çharacters!';
      const signals: TrustSignals = {};
      
      expect(() => computeTrustScore(message, signals)).not.toThrow();
    });
    
    it('should handle extreme account ages', () => {
      const message = 'Test message.';
      const signals: TrustSignals = {
        account_age_days: 10000, // Very old account
      };
      
      const result = computeTrustScore(message, signals);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
    
    it('should handle whitespace-only messages without division by zero', () => {
      // Test the guard against division by zero when messageLength is 0
      const whitespaceMessage = '   '; // This will trim to empty string
      const signals: TrustSignals = {};
      
      expect(() => computeTrustScore(whitespaceMessage, signals)).not.toThrow();
      
      const result = computeTrustScore(whitespaceMessage, signals);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.score).not.toBe(Infinity);
      expect(result.score).not.toBe(NaN);
    });
    
    it('should not flag empty messages as having excessive caps', () => {
      const emptyMessage = '';
      const signals: TrustSignals = {};
      
      const result = computeTrustScore(emptyMessage, signals);
      
      // Content features score should be low but not incorrectly penalized
      expect(result.components.content_features).toBeLessThan(0.5);
      expect(result.components.content_features).toBeGreaterThanOrEqual(0);
    });
  });
});

