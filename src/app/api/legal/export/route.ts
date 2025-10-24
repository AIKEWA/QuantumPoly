import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

/**
 * Legal Export API Endpoint
 *
 * GET /api/legal/export?format={json|pdf}
 *
 * Exports comprehensive compliance report in requested format.
 * JSON: Full machine-readable dump
 * PDF: Human-readable summary (requires additional PDF generation library)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (!['json', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported: json, pdf' }, { status: 400 });
    }

    // Load dashboard data
    const dashboardPath = path.join(process.cwd(), 'reports', 'governance', 'dashboard-data.json');

    if (!fs.existsSync(dashboardPath)) {
      return NextResponse.json({ error: 'Dashboard data not found' }, { status: 404 });
    }

    const dashboardData = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));

    // Load ledger
    const ledgerPath = path.join(process.cwd(), 'governance', 'ledger', 'ledger.jsonl');
    let ledgerEntries = [];

    if (fs.existsSync(ledgerPath)) {
      const content = fs.readFileSync(ledgerPath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      ledgerEntries = lines.map((line) => JSON.parse(line));
    }

    // Construct export data
    const exportData = {
      reportType: 'Ethical Governance Compliance Report',
      generatedAt: new Date().toISOString(),
      project: {
        name: dashboardData.project,
        version: dashboardData.version,
        commit: dashboardData.commit,
      },
      ethicalIntegrityIndex: {
        score: dashboardData.eii,
        calculation: dashboardData.eiCalculation,
        metrics: dashboardData.metrics,
      },
      complianceFrameworks: {
        gdpr: {
          article5: 'Data minimization and purpose limitation enforced',
          article25: 'Privacy by design implemented',
          assessment: 'Compliant',
        },
        euAIAct2024: {
          classification: 'Limited risk AI system',
          requirements: [
            'Transparency provided',
            'Explainability implemented',
            'Audit trail maintained',
          ],
          assessment: 'Compliant',
        },
        iso42001: {
          processEvidence: 'Documented',
          continuousImprovement: 'Active',
          assessment: 'Aligned',
        },
        ieee7000: {
          ethicalValueSystem: 'Defined',
          stakeholderEngagement: 'Active',
          assessment: 'Aligned',
        },
      },
      detailedMetrics: dashboardData.reports || [],
      transparencyLedger: {
        totalEntries: ledgerEntries.length,
        latestEntry: ledgerEntries[ledgerEntries.length - 1],
        signedEntries: ledgerEntries.filter((e) => e.signature).length,
      },
      tags: dashboardData.tags || [],
      verification: {
        dataHash: dashboardData.hash,
        verifiedBy: dashboardData.verifiedBy,
        ledgerEntry: dashboardData.ledgerEntry,
      },
    };

    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ethics-compliance-report-${dashboardData.commit}.json"`,
        },
      });
    }

    // PDF export (placeholder - requires PDF generation library like puppeteer)
    if (format === 'pdf') {
      return NextResponse.json(
        {
          error: 'PDF export not yet implemented',
          message: 'Install puppeteer or similar library for PDF generation',
          jsonExportAvailable: '/api/legal/export?format=json',
        },
        { status: 501 },
      );
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Legal export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
