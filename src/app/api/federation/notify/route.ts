/**
 * @fileoverview Federation Webhook Notification API
 * @module api/federation/notify
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Receives webhook notifications from federation partners.
 * Verifies HMAC-SHA256 signatures for authenticity.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { getPartnerById } from '@/lib/federation/partner-manager';
import { WebhookNotification } from '@/lib/federation/types';
import { verifyHmacSignature } from '@/lib/federation/verification';

/**
 * Rate limiting state
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 webhooks per minute per IP

/**
 * Simple rate limiter
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Append webhook event to federation ledger
 */
function appendWebhookEvent(notification: WebhookNotification): void {
  const ledgerDir = path.join(process.cwd(), 'governance', 'federation');
  const ledgerPath = path.join(ledgerDir, 'ledger.jsonl');

  const entry = {
    entry_id: `webhook-${notification.partner_id}-${Date.now()}`,
    ledger_entry_type: 'webhook_notification',
    block_id: '9.6',
    title: `Webhook Notification: ${notification.event_type}`,
    status: 'verified',
    approved_date: new Date().toISOString().split('T')[0],
    timestamp: notification.timestamp,
    responsible_roles: ['Federation Trust Officer'],
    summary: `Webhook received from ${notification.partner_id}: ${notification.event_type}`,
    next_review: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    webhook: {
      partner_id: notification.partner_id,
      event_type: notification.event_type,
      payload: notification.payload,
    },
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
  entry.merkleRoot = crypto.createHash('sha256').update(entry.hash).digest('hex');

  // Append to ledger
  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + '\n', 'utf-8');
}

/**
 * POST /api/federation/notify
 * Receive webhook notification from federation partner
 *
 * Request body:
 * {
 *   "partner_id": "string",
 *   "event_type": "merkle_update" | "trust_change" | "partner_added" | "partner_removed",
 *   "timestamp": "ISO-8601",
 *   "payload": { ... },
 *   "signature": "HMAC-SHA256 hex"
 * }
 *
 * Security:
 * - HMAC-SHA256 signature verification
 * - Rate limited (30 req/min per IP)
 * - Partner must be registered with webhook_secret
 * - Logs all webhook events to federation ledger
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Maximum 30 webhooks per minute allowed',
          retry_after: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const notification: WebhookNotification = body;

    // Validate required fields
    if (!notification.partner_id || !notification.event_type || !notification.signature) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Missing required fields: partner_id, event_type, signature',
        },
        { status: 400 }
      );
    }

    // Get partner
    const partner = getPartnerById(notification.partner_id);
    if (!partner) {
      return NextResponse.json(
        {
          error: 'Unknown partner',
          message: `Partner "${notification.partner_id}" is not registered`,
        },
        { status: 404 }
      );
    }

    // Check if partner has webhook secret configured
    if (!partner.webhook_secret) {
      return NextResponse.json(
        {
          error: 'Webhook not configured',
          message: `Partner "${notification.partner_id}" does not have webhook authentication configured`,
        },
        { status: 403 }
      );
    }

    // Verify HMAC signature
    const payload = JSON.stringify({
      partner_id: notification.partner_id,
      event_type: notification.event_type,
      timestamp: notification.timestamp,
      payload: notification.payload,
    });

    const isValid = verifyHmacSignature(payload, notification.signature, partner.webhook_secret);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid signature',
          message: 'HMAC signature verification failed',
        },
        { status: 401 }
      );
    }

    // Append webhook event to ledger
    try {
      appendWebhookEvent(notification);
    } catch (error) {
      console.error('Failed to append webhook event to ledger:', error);
      // Continue anyway - webhook was verified
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received and verified',
        partner_id: notification.partner_id,
        event_type: notification.event_type,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Federation webhook API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process webhook',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/federation/notify
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

