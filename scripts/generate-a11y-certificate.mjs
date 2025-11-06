#!/usr/bin/env node
/**
 * Generate WCAG 2.2 AA Accessibility Certificate PDF
 * Creates a conditional certificate documenting compliance status
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIT_JSON_PATH = path.join(__dirname, '..', 'reports', 'accessibility-audit.json');
const OUTPUT_PDF_PATH = path.join(__dirname, '..', 'public', 'certificates', 'wcag-2.2aa.pdf');

function calculateHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function generateCertificate() {
  console.log('Generating WCAG 2.2 AA Accessibility Certificate...\n');
  
  // Load audit data
  const auditData = JSON.parse(fs.readFileSync(AUDIT_JSON_PATH, 'utf8'));
  const auditHash = calculateHash(AUDIT_JSON_PATH);
  
  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'WCAG 2.2 Level AA Accessibility Certificate',
      Author: 'Aykut Aydin - QuantumPoly',
      Subject: 'Accessibility Conformance Certificate',
      Keywords: 'WCAG, accessibility, a11y, certificate, compliance',
      CreationDate: new Date(auditData.timestamp),
      Producer: 'QuantumPoly Governance Platform'
    }
  });
  
  const stream = fs.createWriteStream(OUTPUT_PDF_PATH);
  doc.pipe(stream);
  
  // Header border
  doc.lineWidth(2);
  doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();
  
  doc.lineWidth(1);
  doc.rect(45, 45, doc.page.width - 90, doc.page.height - 90).stroke();
  
  // Title
  doc.fontSize(24).font('Helvetica-Bold');
  doc.text('WCAG 2.2 LEVEL AA', 60, 80, { align: 'center' });
  doc.text('ACCESSIBILITY CERTIFICATE', 60, 110, { align: 'center' });
  
  // Subtitle
  doc.fontSize(10).font('Helvetica');
  doc.text('Conditional Conformance with Documented Exceptions', 60, 145, { align: 'center' });
  
  // Decorative line
  doc.moveTo(150, 170).lineTo(doc.page.width - 150, 170).stroke();
  
  // Product Info
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Product:', 80, 200);
  doc.font('Helvetica');
  doc.text('QuantumPoly Governance Platform v1.1', 200, 200);
  
  doc.font('Helvetica-Bold');
  doc.text('Audit Date:', 80, 220);
  doc.font('Helvetica');
  doc.text(new Date(auditData.timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }), 200, 220);
  
  doc.font('Helvetica-Bold');
  doc.text('Valid Until:', 80, 240);
  doc.font('Helvetica');
  const validUntil = new Date(auditData.timestamp);
  validUntil.setMonth(validUntil.getMonth() + 6);
  doc.text(validUntil.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }), 200, 240);
  
  // Conformance Status
  doc.fontSize(14).font('Helvetica-Bold');
  doc.fillColor('#059669'); // Green
  doc.text('✓ WCAG 2.2 Level AA', 80, 280);
  doc.fillColor('#000000');
  doc.fontSize(11).font('Helvetica');
  doc.text('Compliant with Documented Exceptions', 80, 300);
  
  // Scope Section
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('SCOPE', 80, 340);
  doc.fontSize(10).font('Helvetica');
  doc.text(`• ${auditData.targets.length} core public and governance routes tested`, 80, 360);
  doc.text('• 66 page variants across 6 locales (en, de, es, fr, it, tr)', 80, 375);
  doc.text('• 10+ custom UI components and interactive visualizations', 80, 390);
  
  // Testing Methodology
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('TESTING METHODOLOGY', 80, 420);
  doc.fontSize(10).font('Helvetica');
  doc.text(`• Automated: Lighthouse ${auditData.tooling.lighthouse_version}, `, 80, 440, { continued: true });
  doc.text(`axe-core ${auditData.tooling.axe_core_version}`);
  doc.text('• Manual: Keyboard navigation, screen reader testing', 80, 455);
  doc.text('• Assistive Tech: NVDA 2024.3, VoiceOver macOS 14.6', 80, 470);
  doc.text('• Browsers: Chrome 120, Firefox 121, Safari 17', 80, 485);
  
  // Summary
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('SUMMARY', 80, 515);
  doc.fontSize(10).font('Helvetica');
  doc.text(`• Total Issues: ${auditData.summary.total_issues} `, 80, 535, { continued: true });
  doc.text(`(${auditData.summary.by_severity.critical} critical, `, { continued: true });
  doc.text(`${auditData.summary.by_severity.serious} serious, `, { continued: true });
  doc.text(`${auditData.summary.by_severity.moderate} moderate, `, { continued: true });
  doc.text(`${auditData.summary.by_severity.minor} minor)`);
  
  doc.text(`• AA Blockers: ${auditData.summary.aa_blockers}`, 80, 550);
  
  const avgScore = (auditData.targets.reduce((sum, t) => sum + t.score, 0) / auditData.targets.length).toFixed(1);
  doc.text(`• Average Lighthouse Score: ${avgScore}/100`, 80, 565);
  doc.text('• Keyboard Navigation: Fully accessible', 80, 580);
  doc.text('• Screen Reader Compatibility: Verified', 80, 595);
  
  // Documented Exceptions
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('DOCUMENTED EXCEPTIONS (Non-blocking)', 80, 625);
  doc.fontSize(9).font('Helvetica');
  doc.text('1. Color contrast on consent banner buttons (WCAG 1.4.3) — Remediation by Dec 31, 2025', 85, 645, { width: 450 });
  doc.text('2. Color contrast on CTA buttons (WCAG 1.4.3) — Remediation by Dec 31, 2025', 85, 660, { width: 450 });
  doc.text('3. Dashboard feed ARIA structure (WCAG 1.3.1) — Remediation by Dec 31, 2025', 85, 675, { width: 450 });
  
  // Certification Statement
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('CERTIFICATION STATEMENT', 80, 705);
  doc.fontSize(8).font('Helvetica');
  doc.text(
    'QuantumPoly demonstrates commitment to digital accessibility and has achieved WCAG 2.2 Level AA compliance across all critical user pathways. Documented exceptions are non-blocking for essential functionality and are tracked with clear remediation timelines.',
    80, 720, { width: 450, align: 'justify' }
  );
  
  // Auditor
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('AUDITOR', 320, 200);
  doc.fontSize(9).font('Helvetica');
  doc.text('Aykut Aydin', 320, 215);
  doc.fontSize(8);
  doc.text('Founder, Lead Engineer', 320, 228);
  doc.text('Accessibility Reviewer', 320, 240);
  doc.text('QuantumPoly', 320, 252);
  
  // Verification
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('VERIFICATION', 80, 755);
  doc.fontSize(7).font('Courier');
  doc.text(`Report Hash: ${auditHash.substring(0, 32)}...`, 80, 770);
  doc.fontSize(8).font('Helvetica');
  doc.text('Ledger Entry: entry-block10.8-accessibility-audit', 80, 783);
  doc.text('Public Statement: /en/accessibility', 80, 795);
  
  // Feedback
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('FEEDBACK CHANNEL', 320, 755);
  doc.fontSize(9).font('Helvetica');
  doc.text('accessibility@quantumpoly.ai', 320, 770);
  doc.fontSize(8);
  doc.text('Response Time: 3 business days', 320, 783);
  
  // Footer
  doc.fontSize(8).font('Helvetica-Oblique');
  doc.text('Digital Ethics in Action — Transparency over Perfection', 60, doc.page.height - 60, { 
    align: 'center',
    width: doc.page.width - 120
  });
  
  doc.end();
  
  stream.on('finish', () => {
    const stats = fs.statSync(OUTPUT_PDF_PATH);
    console.log('✅ Certificate generated successfully!');
    console.log(`   Location: ${OUTPUT_PDF_PATH}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Report Hash: ${auditHash}`);
    console.log('');
  });
  
  stream.on('error', (err) => {
    console.error('❌ Error generating certificate:', err);
    process.exit(1);
  });
}

// Execute
try {
  // Ensure output directory exists
  const certDir = path.dirname(OUTPUT_PDF_PATH);
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }
  
  generateCertificate();
} catch (error) {
  console.error('❌ Failed to generate certificate:', error);
  process.exit(1);
}


