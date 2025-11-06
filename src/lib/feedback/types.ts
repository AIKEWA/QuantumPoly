/**
 * @fileoverview Feedback & Trust System Type Definitions
 * @module lib/feedback/types
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 */

/**
 * Trust scoring signals extracted from feedback submission
 */
export interface TrustSignals {
  /** User account age in days (if authenticated) */
  account_age_days?: number;
  /** Whether user is verified (if authenticated) */
  verified?: boolean;
  /** Whether submission includes complete context */
  has_context?: boolean;
  /** User agent string for fingerprinting */
  user_agent?: string;
  /** Submission locale */
  locale?: string;
  /** Path where feedback was submitted */
  path?: string;
}

/**
 * Trust scoring weights configuration
 */
export interface TrustWeights {
  /** Weight for signal quality (context completeness, text coherence) */
  signal_quality: number;
  /** Weight for account signals (verified, age) */
  account_signals: number;
  /** Weight for behavioral signals (rate limit history, duplication) */
  behavioral: number;
  /** Weight for content features (length, toxicity) */
  content_features: number;
}

/**
 * Trust score computation result
 */
export interface TrustScore {
  /** Final trust score [0-1] */
  score: number;
  /** Breakdown of score components */
  components: {
    signal_quality: number;
    account_signals: number;
    behavioral: number;
    content_features: number;
  };
  /** Version of scoring algorithm used */
  version: string;
}

/**
 * Feedback submission context
 */
export interface FeedbackContext {
  /** Path where feedback was submitted */
  path?: string;
  /** User agent string */
  user_agent?: string;
  /** Submission locale */
  locale?: string;
}

/**
 * Feedback submission metadata
 */
export interface FeedbackMetadata {
  /** Whether user opted into trust scoring */
  trust_opt_in?: boolean;
  /** Trust signals for scoring */
  signals?: TrustSignals;
}

/**
 * Valid feedback topics
 */
export type FeedbackTopic = 
  | 'governance'
  | 'ethics'
  | 'safety'
  | 'ux'
  | 'bug'
  | 'other';

/**
 * Legacy feedback types (Block 10.1)
 */
export type LegacyFeedbackType = 
  | 'accessibility'
  | 'ethics'
  | 'incident';

/**
 * Complete feedback submission payload
 */
export interface FeedbackSubmission {
  /** New topic field (Block 10.6) */
  topic?: FeedbackTopic;
  /** Legacy type field (Block 10.1) */
  type?: LegacyFeedbackType;
  /** Feedback message content */
  message: string;
  /** Whether user consents to contact */
  consent_contact?: boolean;
  /** Optional email for follow-up (hashed at rest) */
  email?: string;
  /** Submission context */
  context?: FeedbackContext;
  /** Submission metadata */
  metadata?: FeedbackMetadata;
  /** Optional timestamp */
  timestamp?: string;
}

/**
 * Stored feedback entry (JSONL format)
 */
export interface FeedbackEntry {
  /** Unique entry identifier */
  id: string;
  /** Entry type or topic */
  type?: LegacyFeedbackType;
  topic?: FeedbackTopic;
  /** Feedback message */
  message: string;
  /** Hashed email (SHA-256) or null */
  email_sha256?: string | null;
  /** Contact consent flag */
  consent_contact?: boolean;
  /** Submission context */
  context?: FeedbackContext;
  /** Trust score (if opted in) */
  trust_score?: number;
  /** Trust score components (if opted in) */
  trust_components?: TrustScore['components'];
  /** Submission timestamp */
  timestamp: string;
  /** Receipt timestamp */
  received_at: string;
  /** Date string (YYYY-MM-DD) */
  date: string;
  /** Processing status */
  status: 'pending' | 'reviewed' | 'resolved';
  /** Entry hash for integrity */
  hash: string;
  /** Format version */
  version: string;
}

/**
 * Trust trend aggregate data
 */
export interface TrustTrendAggregate {
  /** Generation timestamp */
  generated_at: string;
  /** Analysis period */
  period: {
    start: string;
    end: string;
  };
  /** Trust metrics */
  trust_metrics: {
    /** 7-day exponential moving average */
    ema_7d: number;
    /** 30-day mean */
    mean_30d: number;
    /** Total submissions in period */
    total_submissions: number;
    /** Count of submissions with trust opt-in */
    opted_in_count: number;
  };
  /** Topic distribution histogram */
  topic_distribution: Record<string, number>;
  /** Data version */
  version: string;
}

