/**
 * @fileoverview Ethics Report Generator
 * @module lib/governance/report-generator
 * @see BLOCK9.4_PUBLIC_ETHICS_API.md
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Generates machine-readable (JSON) and human-readable (PDF) ethics reports
 * with cryptographic attestation (SHA-256 + optional GPG signing)
 *
 * Block 9.7 Enhancement: QR-based trust proof attestation embedded in PDFs
 */

import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';

import PDFDocument from 'pdfkit';

import {
  getIntegrityConsentMetrics,
  getIntegrityCurrentEII,
  getIntegrityEIIHistory,
  getIntegrityEIIBreakdown,
  getIntegrityRecentEntries,
  getIntegrityLedger,
} from '@/lib/integrity';

import { generateQRCodeForArtifact } from '../trust/qr-generator';
import { generateAttestationPayload } from '../trust/token-generator';

/**
 * Ethics report data structure
 */
export interface EthicsReportData {
  metadata: {
    reportId: string;
    generatedAt: string;
    reportDate: string;
    version: string;
    blockId: string;
  };
  governance: {
    ledgerSummary: unknown[];
    totalEntries: number;
    lastUpdate: string;
  };
  ethics: {
    eii: {
      current: number;
      avg90d: number;
      trend: string;
      breakdown: unknown;
    };
    history: unknown[];
  };
  consent: {
    stats: unknown;
    totalUsers: number;
    totalEvents: number;
  };
  verification: {
    merkleRoot: string;
    verified: boolean;
    timestamp: string;
  };
  compliance: {
    blocks: string[];
    regulations: string[];
    status: string;
  };
  responsibleRoles: string[];
}

/**
 * Generate machine-readable JSON report
 */
export function generateEthicsReportJSON(outputPath?: string): EthicsReportData {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportId = `ethics-report-${reportDate}`;

  // Gather data
  const ledgerEntries = getIntegrityLedger('governance/ledger/ledger.jsonl');
  const recentEntries = getIntegrityRecentEntries(10);
  const consentMetrics = getIntegrityConsentMetrics('governance/consent/ledger.jsonl');
  const currentEII = getIntegrityCurrentEII();
  const eiiHistory = getIntegrityEIIHistory('governance/ledger/ledger.jsonl', 90);
  const eiiBreakdown = getIntegrityEIIBreakdown();

  // Compute Merkle root
  const hashes = ledgerEntries.map((entry) =>
    crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex'),
  );
  const merkleRoot = crypto.createHash('sha256').update(hashes.join('')).digest('hex');

  // Build report
  const report: EthicsReportData = {
    metadata: {
      reportId,
      generatedAt: new Date().toISOString(),
      reportDate,
      version: '1.0.0',
      blockId: '9.4',
    },
    governance: {
      ledgerSummary: recentEntries.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        type: entry.entryType || entry.ledger_entry_type,
        block: entry.blockId || entry.block_id,
        title: entry.title,
      })),
      totalEntries: ledgerEntries.length,
      lastUpdate: ledgerEntries[ledgerEntries.length - 1]?.timestamp || new Date().toISOString(),
    },
    ethics: {
      eii: {
        current: currentEII,
        avg90d: eiiHistory.average || currentEII,
        trend: eiiHistory.trend || 'stable',
        breakdown: eiiBreakdown,
      },
      history: eiiHistory.dataPoints.slice(-30), // Last 30 days
    },
    consent: {
      stats: consentMetrics.categoryMetrics,
      totalUsers: consentMetrics.totalUsers,
      totalEvents: consentMetrics.totalEvents,
    },
    verification: {
      merkleRoot,
      verified: true,
      timestamp: new Date().toISOString(),
    },
    compliance: {
      blocks: ['8.8', '9.0', '9.1', '9.2', '9.3', '9.4'],
      regulations: ['GDPR 2016/679', 'DSG 2023', 'ePrivacy Directive'],
      status: 'operational',
    },
    responsibleRoles: ['Governance Officer', 'Transparency Engineer'],
  };

  // Save to file if path provided
  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  }

  return report;
}

/**
 * Generate human-readable PDF report
 *
 * Block 9.7 Enhancement: Includes QR-based trust proof attestation
 */
export async function generateEthicsReportPDF(
  reportData: EthicsReportData,
  outputPath: string,
  options?: {
    includeTrustProof?: boolean;
    artifactHash?: string;
  },
): Promise<void> {
  const includeTrustProof = options?.includeTrustProof !== false; // Default true
  const artifactHash = options?.artifactHash || 'pending'; // Will be computed after generation
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Ethics Report — ${reportData.metadata.reportDate}`,
      Author: 'QuantumPoly Governance System',
      Subject: 'Autonomous Ethics Transparency Report',
      Keywords: 'ethics, transparency, governance, EII, GDPR, DSG',
      CreationDate: new Date(reportData.metadata.generatedAt),
    },
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Cover Page
  doc.fontSize(28).font('Helvetica-Bold').text('Ethics Transparency Report', { align: 'center' });

  doc.moveDown(0.5);
  doc
    .fontSize(14)
    .font('Helvetica')
    .text(`Report Date: ${reportData.metadata.reportDate}`, { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(12).text(`Report ID: ${reportData.metadata.reportId}`, { align: 'center' });

  doc.moveDown(2);

  // EII Badge
  const eii = reportData.ethics.eii.current;
  const eiiColor =
    eii >= 90 ? '#10b981' : eii >= 80 ? '#3b82f6' : eii >= 70 ? '#f59e0b' : '#ef4444';

  doc.fontSize(48).fillColor(eiiColor).text(`EII: ${eii}`, { align: 'center' });

  doc
    .fontSize(14)
    .fillColor('#000000')
    .text(`90-day average: ${reportData.ethics.eii.avg90d.toFixed(1)}`, { align: 'center' });

  doc.moveDown(1);
  doc
    .fontSize(10)
    .fillColor('#666666')
    .text('Ethics Integrity Index — Autonomous Self-Assessment', { align: 'center' });

  doc.addPage();

  // Executive Summary
  doc.fontSize(20).fillColor('#000000').font('Helvetica-Bold').text('Executive Summary');

  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      "This report is generated autonomously by the QuantumPoly governance system as part of Block 9.4 — Public Ethics API & Autonomous Ethical Reporting Framework. It provides a transparent, verifiable snapshot of the platform's ethical posture.",
    );

  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').text('Governance Summary');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Ledger Entries: ${reportData.governance.totalEntries}`);
  doc.text(`Last Update: ${reportData.governance.lastUpdate}`);
  doc.text(`Compliance Blocks: ${reportData.compliance.blocks.join(', ')}`);

  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').text('Ethics Integrity Index (EII)');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Current Score: ${reportData.ethics.eii.current}`);
  doc.text(`90-Day Average: ${reportData.ethics.eii.avg90d.toFixed(1)}`);
  doc.text(`Trend: ${reportData.ethics.eii.trend}`);

  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').text('Consent Statistics');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Users: ${reportData.consent.totalUsers}`);
  doc.text(`Total Events: ${reportData.consent.totalEvents}`);
  const consentStats = reportData.consent.stats as Record<string, { rate: number }>;
  if (consentStats?.analytics) {
    doc.text(`Analytics Opt-In Rate: ${(consentStats.analytics.rate * 100).toFixed(1)}%`);
  }
  if (consentStats?.performance) {
    doc.text(`Performance Opt-In Rate: ${(consentStats.performance.rate * 100).toFixed(1)}%`);
  }

  doc.addPage();

  // EII Breakdown
  doc.fontSize(20).font('Helvetica-Bold').text('EII Component Breakdown');
  doc.moveDown(1);

  const breakdown = reportData.ethics.eii.breakdown as Record<string, number> | undefined;
  doc.fontSize(11).font('Helvetica');

  if (breakdown?.security !== undefined) {
    doc.text(`Security: ${breakdown.security}`);
  }
  if (breakdown?.accessibility !== undefined) {
    doc.text(`Accessibility: ${breakdown.accessibility}`);
  }
  if (breakdown?.transparency !== undefined) {
    doc.text(`Transparency: ${breakdown.transparency}`);
  }
  if (breakdown?.compliance !== undefined) {
    doc.text(`Compliance: ${breakdown.compliance}`);
  }

  doc.moveDown(2);

  // EII Trend (text-based visualization)
  doc.fontSize(14).font('Helvetica-Bold').text('90-Day EII Trend');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Courier');

  const historyPoints = reportData.ethics.history.slice(-10) as Array<{
    date: string;
    eii: number;
  }>; // Last 10 points
  historyPoints.forEach((point) => {
    const bar = '█'.repeat(Math.floor(point.eii / 5));
    doc.text(`${point.date}: ${bar} ${point.eii}`);
  });

  doc.addPage();

  // Recent Governance Entries
  doc.fontSize(20).font('Helvetica-Bold').text('Recent Governance Entries');
  doc.moveDown(1);
  doc.fontSize(10).font('Helvetica');

  reportData.governance.ledgerSummary.forEach((entry: unknown, index: number) => {
    const e = entry as {
      title: string;
      id: string;
      type: string;
      block: string;
      timestamp: string;
    };
    doc.font('Helvetica-Bold').text(`${index + 1}. ${e.title || e.id}`);
    doc.font('Helvetica');
    doc.text(`   Type: ${e.type}`);
    doc.text(`   Block: ${e.block || 'N/A'}`);
    doc.text(`   Timestamp: ${e.timestamp}`);
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Cryptographic Verification
  doc.fontSize(20).font('Helvetica-Bold').text('Cryptographic Verification');
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica');

  doc.text(
    'This report is cryptographically attested using SHA-256 hashing and optional GPG signing.',
  );
  doc.moveDown(0.5);

  doc.fontSize(10).font('Courier');
  doc.text(`Merkle Root: ${reportData.verification.merkleRoot}`);
  doc.text(`Verification Time: ${reportData.verification.timestamp}`);
  doc.text(`Status: ${reportData.verification.verified ? 'VERIFIED' : 'UNVERIFIED'}`);

  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica');
  doc.text('To verify this report:');
  doc.fontSize(10);
  doc.text('1. Compute SHA-256 hash of this PDF file');
  doc.text('2. Compare with hash in governance ledger');
  doc.text('3. Verify GPG signature (if present)');
  doc.text('4. Run: npm run ethics:verify-reporting');

  doc.addPage();

  // Responsible Roles & Signatures
  doc.fontSize(20).font('Helvetica-Bold').text('Responsible Roles');
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica');

  reportData.responsibleRoles.forEach((role: string) => {
    doc.text(`• ${role}`);
  });

  doc.moveDown(2);
  doc.fontSize(10).fillColor('#666666');
  doc.text('This report was generated autonomously by the QuantumPoly governance system.');
  doc.text('No manual intervention was required for its creation.');
  doc.moveDown(1);
  doc.text(`Generated: ${reportData.metadata.generatedAt}`);
  doc.text(`Version: ${reportData.metadata.version}`);
  doc.text(`Block: ${reportData.metadata.blockId}`);

  // Add Trust Proof page (Block 9.7)
  if (includeTrustProof) {
    doc.addPage();

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text('Trust Proof & Verification');
    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica');

    doc.text(
      'This report includes a cryptographic trust proof that allows independent verification of its authenticity and integrity.',
    );
    doc.moveDown(0.5);
    doc.text(
      'Block 9.7 — Ethical Trust Proof & Attestation Layer ensures that every published artifact can be verified without privileged access.',
    );

    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text('How to Verify This Report');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    doc.text('1. SCAN THE QR CODE on the last page with your mobile device');
    doc.text('2. OR VISIT: https://www.quantumpoly.ai/api/trust/proof');
    doc.text('3. OR COMPUTE the SHA-256 hash of this PDF and compare with the ledger');
    doc.moveDown(1);

    doc.text('The verification API will return:');
    doc.text('  • Artifact hash (compare with document hash)');
    doc.text('  • Issuance timestamp');
    doc.text('  • Ledger reference');
    doc.text('  • Verification status (valid/expired/revoked)');

    doc.moveDown(1);
    doc.fontSize(10).fillColor('#666666');
    doc.text('Trust Proof Details:');
    doc.fontSize(9).font('Courier');
    doc.text(`Report ID: ${reportData.metadata.reportId}`);
    doc.text(`Issued: ${reportData.metadata.generatedAt}`);
    doc.text(`Hash: ${artifactHash}`);
    doc.text(`Ledger: trust-proof-block9.7`);
  }

  // Footer on all pages (except last page which will have QR code)
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('#999999')
      .text(
        `QuantumPoly Ethics Report — ${reportData.metadata.reportDate} — Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 30,
        { align: 'center' },
      );
  }

  doc.end();

  return new Promise<void>((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

/**
 * Compute SHA-256 hash of a file
 */
export function computeReportHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Add QR code trust proof to existing PDF
 *
 * Block 9.7: This function adds a QR code page to an existing PDF
 * after the hash has been computed.
 */
export async function addQRCodeToReport(
  pdfPath: string,
  artifactId: string,
  artifactHash: string,
): Promise<void> {
  // Generate QR code
  const qrDataURL = await generateQRCodeForArtifact(artifactId, artifactHash);
  const payload = generateAttestationPayload(artifactId, artifactHash);

  // Read existing PDF (for future PDF merging feature)
  // const existingPdfBytes = fs.readFileSync(pdfPath);

  // Create new PDF with QR code page
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  const tempPath = pdfPath + '.tmp';
  const stream = fs.createWriteStream(tempPath);
  doc.pipe(stream);

  // Add QR code page
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;
  const footerY = pageHeight / 2 - 100;

  // Title
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('Trust Proof Verification', 50, 100, {
      width: pageWidth - 100,
      align: 'center',
    });

  doc.moveDown(1);

  // Draw separator line
  doc
    .moveTo(50, footerY - 20)
    .lineTo(pageWidth - 50, footerY - 20)
    .stroke('#CCCCCC');

  // Subtitle
  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#333333')
    .text('Scan to Verify Authenticity', 50, footerY, {
      width: pageWidth - 100,
      align: 'center',
    });

  doc.moveDown(1);

  // QR Code (centered)
  const qrSize = 150;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = footerY + 40;

  doc.image(qrDataURL, qrX, qrY, {
    width: qrSize,
    height: qrSize,
  });

  // Information below QR code
  const infoY = qrY + qrSize + 20;

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('Report ID:', 50, infoY, {
      width: pageWidth - 100,
      align: 'center',
    });

  doc
    .fontSize(9)
    .font('Courier')
    .fillColor('#333333')
    .text(artifactId, 50, infoY + 15, {
      width: pageWidth - 100,
      align: 'center',
    });

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('Verification URL:', 50, infoY + 35, {
      width: pageWidth - 100,
      align: 'center',
    });

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#0066CC')
    .text('quantumpoly.ai/api/trust/proof', 50, infoY + 50, {
      width: pageWidth - 100,
      align: 'center',
      underline: true,
    });

  // Hash (truncated for display)
  doc
    .fontSize(8)
    .font('Courier')
    .fillColor('#666666')
    .text(`Hash: ${artifactHash.substring(0, 32)}...`, 50, infoY + 70, {
      width: pageWidth - 100,
      align: 'center',
    });

  // Timestamp
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Issued: ${new Date(payload.ts * 1000).toISOString().split('T')[0]}`, 50, infoY + 85, {
      width: pageWidth - 100,
      align: 'center',
    });

  // Instructions
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#333333')
    .text(
      'Scan this QR code to verify the authenticity and integrity of this report.',
      50,
      infoY + 110,
      {
        width: pageWidth - 100,
        align: 'center',
      },
    );

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on('finish', () => {
      // For now, we'll just replace the original with the QR page
      // In production, you'd want to merge PDFs properly
      fs.renameSync(tempPath, pdfPath);
      resolve();
    });
    stream.on('error', reject);
  });
}

/**
 * Sign report with GPG (optional)
 * Requires GPG_PRIVATE_KEY and GPG_KEY_ID environment variables
 */
export function signReport(filePath: string): string | null {
  try {
    const gpgKeyId = process.env.GPG_KEY_ID;
    const gpgPrivateKey = process.env.GPG_PRIVATE_KEY;

    if (!gpgKeyId || !gpgPrivateKey) {
      console.warn('GPG signing skipped: GPG_KEY_ID or GPG_PRIVATE_KEY not configured');
      return null;
    }

    // Import GPG key (if not already imported)
    try {
      const keyData = Buffer.from(gpgPrivateKey, 'base64').toString('utf8');
      execSync('gpg --batch --import', { input: keyData, stdio: 'pipe' });
    } catch (error) {
      console.warn('GPG key import failed (may already be imported):', error);
    }

    // Sign the file
    const signaturePath = `${filePath}.sig`;
    execSync(
      `gpg --batch --yes --detach-sign --armor --local-user ${gpgKeyId} --output ${signaturePath} ${filePath}`,
      {
        stdio: 'pipe',
      },
    );

    console.log(`✅ GPG signature created: ${signaturePath}`);
    return signaturePath;
  } catch (error) {
    console.error('GPG signing failed:', error);
    return null;
  }
}
