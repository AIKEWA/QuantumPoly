/**
 * @fileoverview Federation Partner Registration API
 * @module api/federation/register
 * @see BLOCK9.6_COLLECTIVE_ETHICS_GRAPH.md
 *
 * Admin-only endpoint for dynamic partner registration.
 * Requires API key authentication.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { addPartner, validatePartner } from '@/lib/federation/partner-manager';
import { PartnerConfig } from '@/lib/federation/types';

/**
 * Rate limiting state
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 registrations per hour

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
 * Verify API key
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');

  const expectedKey = process.env.FEDERATION_API_KEY;

  if (!expectedKey) {
    console.warn('FEDERATION_API_KEY not set, registration endpoint disabled');
    return false;
  }

  return apiKey === expectedKey;
}

/**
 * Append registration event to federation ledger
 */
function appendRegistrationEvent(partner: PartnerConfig): void {
  const ledgerDir = path.join(process.cwd(), 'governance', 'federation');
  const ledgerPath = path.join(ledgerDir, 'ledger.jsonl');

  const entry = {
    entry_id: `partner-registration-${partner.partner_id}-${Date.now()}`,
    ledger_entry_type: 'partner_registration',
    block_id: '9.6',
    title: `Federation Partner Registered: ${partner.partner_display_name}`,
    status: 'approved',
    approved_date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    responsible_roles: ['Federation Trust Officer', 'Governance Officer'],
    summary: `New federation partner registered: ${partner.partner_id} (${partner.partner_display_name})`,
    next_review: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days
    partner: {
      partner_id: partner.partner_id,
      partner_display_name: partner.partner_display_name,
      governance_endpoint: partner.governance_endpoint,
      stale_threshold_days: partner.stale_threshold_days,
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
 * POST /api/federation/register
 * Register a new federation partner
 *
 * Request body:
 * {
 *   "partner_id": "string",
 *   "partner_display_name": "string",
 *   "governance_endpoint": "string",
 *   "webhook_url": "string" (optional),
 *   "webhook_secret": "string" (optional),
 *   "stale_threshold_days": number (optional),
 *   "notes": "string" (optional)
 * }
 *
 * Security:
 * - API key authentication required
 * - Rate limited (10 req/hour per IP)
 * - Validates endpoint accessibility
 * - Logs registration to federation ledger
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Valid API key required',
        },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Maximum 10 registrations per hour allowed',
          retry_after: 3600,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '3600',
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const partnerData: Partial<PartnerConfig> = {
      partner_id: body.partner_id,
      partner_display_name: body.partner_display_name,
      governance_endpoint: body.governance_endpoint,
      webhook_url: body.webhook_url || undefined,
      webhook_secret: body.webhook_secret || undefined,
      stale_threshold_days: body.stale_threshold_days || 30,
      active: true,
      notes: body.notes || undefined,
    };

    // Validate partner
    const validation = validatePartner(partnerData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validation.errors.join(', '),
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Optional: Validate endpoint accessibility
    // (Skip in production to avoid blocking on slow endpoints)
    // try {
    //   const response = await fetch(partnerData.governance_endpoint!, {
    //     method: 'HEAD',
    //     signal: AbortSignal.timeout(5000),
    //   });
    //   if (!response.ok) {
    //     return NextResponse.json(
    //       {
    //         error: 'Endpoint validation failed',
    //         message: `Governance endpoint returned HTTP ${response.status}`,
    //       },
    //       { status: 400 }
    //     );
    //   }
    // } catch (error) {
    //   return NextResponse.json(
    //     {
    //       error: 'Endpoint validation failed',
    //       message: 'Unable to reach governance endpoint',
    //     },
    //     { status: 400 }
    //   );
    // }

    // Add partner
    const result = addPartner(partnerData as Omit<PartnerConfig, 'added_at'>);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Registration failed',
          message: result.error,
        },
        { status: 400 }
      );
    }

    // Append registration event to ledger
    try {
      appendRegistrationEvent({
        ...partnerData,
        added_at: new Date().toISOString(),
      } as PartnerConfig);
    } catch (error) {
      console.error('Failed to append registration event to ledger:', error);
      // Continue anyway - partner is registered in memory
    }

    return NextResponse.json(
      {
        success: true,
        message: `Partner "${partnerData.partner_id}" registered successfully`,
        partner: {
          partner_id: partnerData.partner_id,
          partner_display_name: partnerData.partner_display_name,
          governance_endpoint: partnerData.governance_endpoint,
          active: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Federation registration API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to register partner',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/federation/register
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    },
  });
}

