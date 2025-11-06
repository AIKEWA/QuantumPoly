/**
 * @fileoverview API endpoint for consent event recording
 * @module api/consent
 * @see BLOCK9.2_CONSENT_MANAGEMENT_FRAMEWORK.md
 *
 * Compliance:
 * - GDPR Art. 7(1): Demonstrable consent requirement
 * - GDPR Art. 30: Records of processing activities
 * - DSG Art. 6: Data processing principles
 */

import { appendFile, mkdir } from 'fs/promises';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { ConsentCategory, ConsentEventType } from '@/types/consent';

/**
 * Zod schema for consent event validation
 */
const ConsentEventSchema = z.object({
  userId: z.string().uuid(),
  event: z.nativeEnum(ConsentEventType),
  preferences: z.object({
    [ConsentCategory.Essential]: z.literal(true),
    [ConsentCategory.Analytics]: z.boolean(),
    [ConsentCategory.Performance]: z.boolean(),
  }),
  policyVersion: z.string().regex(/^v\d+\.\d+\.\d+$/),
  userAgent: z.string().optional(),
});

/**
 * Anonymize IP address for GDPR compliance
 * Removes last octet for IPv4, last 80 bits for IPv6
 */
function anonymizeIp(ip: string | null): string {
  if (!ip) return 'unknown';

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts.slice(0, 4).join(':')}::`;
  }

  return 'unknown';
}

/**
 * Get client IP address from request headers
 */
function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}

/**
 * Append consent event to governance ledger
 */
async function appendToLedger(eventData: z.infer<typeof ConsentEventSchema>, ip: string): Promise<void> {
  const ledgerDir = path.join(process.cwd(), 'governance', 'consent');
  const ledgerPath = path.join(ledgerDir, 'ledger.jsonl');

  // Ensure directory exists
  await mkdir(ledgerDir, { recursive: true });

  const ledgerEntry = {
    userId: eventData.userId,
    timestamp: new Date().toISOString(),
    event: eventData.event,
    preferences: eventData.preferences,
    policyVersion: eventData.policyVersion,
    userAgent: eventData.userAgent,
    ipAddress: ip,
  };

  // Append as JSONL (one JSON object per line)
  await appendFile(ledgerPath, JSON.stringify(ledgerEntry) + '\n', 'utf-8');
}

/**
 * POST /api/consent
 * Record a consent event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = ConsentEventSchema.parse(body);

    // Anonymize IP address
    const clientIp = getClientIp(request);
    const anonymizedIp = anonymizeIp(clientIp);

    // Append to ledger
    await appendToLedger(validatedData, anonymizedIp);

    return NextResponse.json(
      {
        success: true,
        message: 'Consent event recorded successfully',
        recordedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Consent recording error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid consent data',
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/consent
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    endpoint: '/api/consent',
    methods: ['POST'],
    version: '1.0.0',
  });
}

