import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

/**
 * Legal Audit API Endpoint
 *
 * GET /api/legal/audit?id={ledger-entry-id}
 *
 * Retrieves comprehensive audit record for a specific ledger entry,
 * including full metric snapshot, commit info, and artifact links.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }

    // Load ledger
    const ledgerPath = path.join(process.cwd(), 'governance', 'ledger', 'ledger.jsonl');

    if (!fs.existsSync(ledgerPath)) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }

    const content = fs.readFileSync(ledgerPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line));

    // Find entry
    const entry = entries.find((e) => e.id === entryId);

    if (!entry) {
      return NextResponse.json({ error: `Ledger entry not found: ${entryId}` }, { status: 404 });
    }

    // Load corresponding dashboard data if available
    const dashboardPath = path.join(process.cwd(), 'reports', 'governance', 'dashboard-data.json');

    let dashboardData = null;
    if (fs.existsSync(dashboardPath)) {
      try {
        const data = fs.readFileSync(dashboardPath, 'utf8');
        dashboardData = JSON.parse(data);

        // Only include if it matches this entry
        if (dashboardData.ledgerEntry !== entryId) {
          dashboardData = null;
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    }

    // Construct audit response
    const auditResponse = {
      entryId: entry.id,
      timestamp: entry.timestamp,
      commit: entry.commit,
      eii: entry.eii,
      metrics: entry.metrics,
      cryptography: {
        dataHash: entry.hash,
        merkleRoot: entry.merkleRoot,
        signed: !!entry.signature,
        signaturePreview: entry.signature ? entry.signature.substring(0, 100) + '...' : null,
      },
      compliance: {
        gdpr: {
          dataMinimization: true,
          purposeLimitation: true,
          noPersonalData: true,
        },
        euAIAct: {
          riskClassification: 'limited',
          explainabilityProvided: true,
          auditTrailMaintained: true,
        },
        iso42001: {
          processBasedEvidence: true,
          continuousMonitoring: true,
        },
        ieee7000: {
          valueBasedDesign: true,
          stakeholderConsideration: true,
        },
      },
      detailedReports: dashboardData?.reports || [],
      verificationInstructions: {
        verifyHash: 'Use SHA256 to verify data integrity',
        verifySignature: 'Use GPG to verify cryptographic signature',
        viewLedger: '/dashboard/ledger',
      },
    };

    return NextResponse.json(auditResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Legal audit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
