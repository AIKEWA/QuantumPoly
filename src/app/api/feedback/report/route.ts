/**
 * @fileoverview Block 10.6 — Feedback Reporting API (Extended)
 * @see BLOCK10.1_POSTLAUNCH_FEEDBACK.md
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 *
 * POST /api/feedback/report
 *
 * Public endpoint for submitting ethical feedback, accessibility issues, and incidents
 * Extended in Block 10.6 with trust scoring, enhanced privacy, and stricter rate limits
 * Stores feedback in governance/feedback/feedback-YYYY-MM-DD.jsonl for transparency
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { computeTrustScore } from '@/lib/feedback/trust-scorer';
import type { TrustSignals } from '@/lib/feedback/types';

// Validation schema (Block 10.6 — Extended)
const FeedbackReportSchema = z
  .object({
    // Legacy type field (Block 10.1 — backward compatible)
    type: z.enum(['accessibility', 'ethics', 'incident']).optional(),
    // New topic field (Block 10.6)
    topic: z.enum(['governance', 'ethics', 'safety', 'ux', 'bug', 'other']).optional(),
    // Message content (trim whitespace and validate)
    message: z
      .string()
      .min(1, 'Message is required')
      .max(2000, 'Message must not exceed 2000 characters')
      .transform((val) => val.trim())
      .refine((val) => val.length > 0, 'Message cannot be empty or whitespace only'),
    // Contact consent (Block 10.6)
    consent_contact: z.boolean().optional().default(false),
    // Email (required only if consent_contact is true)
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    // Context information (Block 10.6)
    context: z
      .object({
        path: z.string().optional(),
        user_agent: z.string().optional(),
        locale: z.string().optional(),
      })
      .optional(),
    // Metadata for trust scoring (Block 10.6)
    metadata: z
      .object({
        trust_opt_in: z.boolean().optional(),
        signals: z
          .object({
            account_age_days: z.number().optional(),
            verified: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
    // Timestamp
    timestamp: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // Require either type or topic
      return data.type !== undefined || data.topic !== undefined;
    },
    {
      message: 'Either "type" or "topic" field must be provided',
      path: ['type'],
    },
  )
  .refine(
    (data) => {
      // If consent_contact is true, email is required
      if (data.consent_contact && (!data.email || data.email === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Email is required when consent_contact is true',
      path: ['email'],
    },
  );

type FeedbackReport = z.infer<typeof FeedbackReportSchema>;

/**
 * Rate limiting with token bucket algorithm (Block 10.6)
 * 5 requests per minute with burst capacity of 10
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitBuckets = new Map<string, TokenBucket>();

// Rate limit configuration from env or defaults
const RATE_LIMIT_WINDOW = Number(process.env.FEEDBACK_RATE_LIMIT_WINDOW) || 60000; // 1 minute
const RATE_LIMIT_MAX = Number(process.env.FEEDBACK_RATE_LIMIT_MAX) || 5; // 5 per minute
const RATE_LIMIT_BURST = Number(process.env.FEEDBACK_RATE_LIMIT_BURST) || 10; // Burst capacity

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  let bucket = rateLimitBuckets.get(identifier);

  // Initialize bucket if it doesn't exist
  if (!bucket) {
    bucket = {
      tokens: RATE_LIMIT_BURST,
      lastRefill: now,
    };
    rateLimitBuckets.set(identifier, bucket);
  }

  // Refill tokens based on time elapsed
  const timeSinceRefill = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timeSinceRefill / (RATE_LIMIT_WINDOW / RATE_LIMIT_MAX));

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_BURST, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Check if request can be allowed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }

  // Calculate retry-after in seconds
  const tokensNeeded = 1 - bucket.tokens;
  const retryAfter = Math.ceil((tokensNeeded * (RATE_LIMIT_WINDOW / RATE_LIMIT_MAX)) / 1000);

  return { allowed: false, retryAfter };
}

/**
 * Hash email address with salt (Block 10.6)
 */
function hashEmail(email: string): string {
  const salt = process.env.FEEDBACK_EMAIL_SALT || 'default-salt-change-in-production';
  return crypto
    .createHash('sha256')
    .update(email + salt)
    .digest('hex');
}

/**
 * Append feedback to daily JSONL file (Block 10.6 — Extended)
 */
function appendFeedback(
  feedback: FeedbackReport,
  entryId: string,
  trustScore?: { score: number; components: Record<string, unknown> },
): void {
  const date = new Date().toISOString().split('T')[0];
  const feedbackDir = process.env.FEEDBACK_STORAGE_DIR
    ? path.resolve(process.env.FEEDBACK_STORAGE_DIR)
    : path.join(process.cwd(), 'governance/feedback');
  const feedbackFile = path.join(feedbackDir, `feedback-${date}.jsonl`);

  // Ensure directory exists
  if (!fs.existsSync(feedbackDir)) {
    fs.mkdirSync(feedbackDir, { recursive: true });
  }

  // Hash email if provided (Block 10.6)
  const emailSha256 = feedback.email && feedback.email !== '' ? hashEmail(feedback.email) : null;

  // Create feedback entry (Block 10.6 format)
  const entry = {
    id: entryId,
    // Legacy type field (Block 10.1)
    type: feedback.type || undefined,
    // New topic field (Block 10.6)
    topic: feedback.topic || undefined,
    message: feedback.message,
    // Email hash (Block 10.6)
    email_sha256: emailSha256,
    consent_contact: feedback.consent_contact || false,
    // Context (Block 10.6)
    context: feedback.context || undefined,
    // Trust score (Block 10.6)
    trust_score: trustScore?.score,
    trust_components: trustScore?.components,
    // Timestamps
    timestamp: feedback.timestamp || new Date().toISOString(),
    received_at: new Date().toISOString(),
    date,
    status: 'pending',
    // Hash for integrity
    hash: crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          id: entryId,
          type: feedback.type,
          topic: feedback.topic,
          message: feedback.message,
          timestamp: feedback.timestamp || new Date().toISOString(),
        }),
      )
      .digest('hex'),
    // Version indicator (Block 10.6)
    version: '1.1.0',
  };

  // Append to JSONL file
  fs.appendFileSync(feedbackFile, JSON.stringify(entry) + '\n', 'utf-8');
}

/**
 * POST /api/feedback/report
 * Submit feedback report (Block 10.6 — Extended)
 */
export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting (IP or fallback)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const identifier = ip || 'fallback';

    // Check rate limit (Block 10.6 — Token bucket)
    const rateLimitResult = checkRateLimit(identifier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: '429_RATE_LIMIT',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        },
      );
    }

    // Check Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported media type',
          code: '415_UNSUPPORTED',
          detail: 'Content-Type must be application/json',
        },
        { status: 415 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = FeedbackReportSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: '400_VALIDATION',
          field: firstError.path.join('.'),
          detail: firstError.message,
          errors: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const feedback = validationResult.data;

    // Compute trust score if opted in (Block 10.6)
    let trustScore: { score: number; components: Record<string, unknown> } | undefined;
    if (feedback.metadata?.trust_opt_in) {
      const signals: TrustSignals = {
        has_context: !!feedback.context,
        path: feedback.context?.path,
        user_agent: feedback.context?.user_agent,
        locale: feedback.context?.locale,
        account_age_days: feedback.metadata.signals?.account_age_days,
        verified: feedback.metadata.signals?.verified,
      };

      const result = computeTrustScore(feedback.message, signals);
      trustScore = {
        score: result.score,
        components: result.components,
      };
    }

    // Generate entry ID (Block 10.6 format)
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const category = feedback.topic || feedback.type || 'general';
    const entryId = `fbk_${timestamp}_${category}_${random}`;

    // Append to feedback file (Block 10.6 — with trust score)
    appendFeedback(feedback, entryId, trustScore);

    // Log to console (for monitoring)
    console.log(
      `[Feedback Received] ${entryId} — Topic: ${feedback.topic || feedback.type} — Trust: ${trustScore?.score?.toFixed(2) || 'N/A'}`,
    );

    // Return success response (Block 10.6)
    return NextResponse.json(
      {
        success: true,
        id: entryId,
        stored_at: new Date().toISOString(),
        trust_score: trustScore?.score,
        message:
          'Feedback received successfully. Thank you for your contribution to governance transparency.',
        status: 'pending',
        next_steps:
          'Your feedback will be reviewed in the next governance cycle. For urgent matters, contact governance@quantumpoly.ai.',
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-Entry-Id': entryId,
        },
      },
    );
  } catch (error) {
    console.error('[Feedback API Error]', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: '500_INTERNAL',
        message:
          'Failed to process feedback. Please try again or contact governance@quantumpoly.ai.',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/feedback/report
 * Return API documentation (Block 10.6 — Updated)
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/feedback/report',
      description:
        'Submit ethical feedback, accessibility issues, or incident reports with optional trust scoring',
      method: 'POST',
      block_id: '10.6',
      version: '1.1.0',
      documentation: ['BLOCK10.1_POSTLAUNCH_FEEDBACK.md', 'BLOCK10.6_FEEDBACK_AND_TRUST.md'],
      schema: {
        topic: {
          type: 'string',
          enum: ['governance', 'ethics', 'safety', 'ux', 'bug', 'other'],
          required: 'either topic or type',
          description: 'Topic category (Block 10.6)',
        },
        type: {
          type: 'string',
          enum: ['accessibility', 'ethics', 'incident'],
          required: 'either topic or type',
          description: 'Legacy type field (Block 10.1, backward compatible)',
        },
        message: {
          type: 'string',
          minLength: 1,
          maxLength: 2000,
          required: true,
          description: 'Detailed feedback message',
        },
        consent_contact: {
          type: 'boolean',
          default: false,
          description: 'Whether user consents to follow-up contact',
        },
        email: {
          type: 'string',
          format: 'email',
          required: 'if consent_contact is true',
          description: 'Email address (hashed at rest with SHA-256)',
        },
        context: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path where feedback was submitted' },
            user_agent: { type: 'string', description: 'User agent string' },
            locale: { type: 'string', description: 'User locale' },
          },
          description: 'Submission context for trust scoring',
        },
        metadata: {
          type: 'object',
          properties: {
            trust_opt_in: { type: 'boolean', description: 'Opt into trust scoring' },
            signals: {
              type: 'object',
              properties: {
                account_age_days: { type: 'number' },
                verified: { type: 'boolean' },
              },
            },
          },
          description: 'Metadata for trust scoring',
        },
      },
      example: {
        topic: 'ux',
        message:
          'The governance dashboard has insufficient color contrast in dark mode for chart labels.',
        consent_contact: true,
        email: 'user@example.com',
        context: {
          path: '/dashboard',
          locale: 'en',
        },
        metadata: {
          trust_opt_in: true,
        },
      },
      rate_limit: '5 requests per minute per IP (burst: 10)',
      storage: 'governance/feedback/feedback-YYYY-MM-DD.jsonl',
      response: {
        success: true,
        id: 'fbk_1730819200000_ux_abcd1234',
        stored_at: new Date().toISOString(),
        trust_score: 0.72,
        status: 'pending',
      },
      contact: 'governance@quantumpoly.ai',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}

/**
 * OPTIONS /api/feedback/report
 * CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    },
  );
}
