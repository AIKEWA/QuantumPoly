#!/usr/bin/env node
/**
 * Generate Stage VI Governance Closure Certificate PDF
 * Creates a formal certificate documenting Stage VI completion with cryptographic verification
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const MANIFEST_PATH = path.join(rootDir, 'governance', 'ledger', 'stageVI-hashes.json');
const LEDGER_ENTRY_PATH = path.join(rootDir, 'governance', 'ledger', 'entry-block10.9.jsonl');
const OUTPUT_PDF_PATH = path.join(rootDir, 'public', 'certificate-governance.pdf');

function calculateHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.error(`⚠️  Could not hash ${filePath}: ${error.message}`);
    return null;
  }
}

function generateCertificate() {
  console.log('📜 Generating Stage VI Governance Closure Certificate...\n');
  
  // Load manifest data
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifest not found. Run hash-stage-vi-artifacts.mjs first.');
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const manifestHash = calculateHash(MANIFEST_PATH);
  
  // Load ledger entry
  let ledgerEntry = null;
  if (fs.existsSync(LEDGER_ENTRY_PATH)) {
    const ledgerContent = fs.readFileSync(LEDGER_ENTRY_PATH, 'utf8').trim();
    ledgerEntry = JSON.parse(ledgerContent);
  }
  
  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'Stage VI Governance Closure Certificate',
      Author: 'QuantumPoly - Aykut Aydin & E.W. Armstrong',
      Subject: 'Formal Governance Closure Certificate',
      Keywords: 'governance, ethics, cryptographic verification, stage VI, closure',
      CreationDate: new Date(manifest.timestamp),
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
  doc.fontSize(22).font('Helvetica-Bold');
  doc.text('GOVERNANCE CLOSURE', 60, 80, { align: 'center' });
  doc.text('CERTIFICATE', 60, 105, { align: 'center' });
  
  // Subtitle
  doc.fontSize(11).font('Helvetica');
  doc.text('Stage VI — Blocks 10.2–10.9', 60, 135, { align: 'center' });
  doc.text('Cryptographically Verified & Dual-Signed', 60, 150, { align: 'center' });
  
  // Decorative line
  doc.moveTo(150, 175).lineTo(doc.page.width - 150, 175).stroke();
  
  // Product Info Section
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('GOVERNANCE FRAMEWORK:', 80, 205);
  doc.font('Helvetica');
  doc.text('QuantumPoly Ethical AI Platform v1.1', 280, 205);
  
  doc.font('Helvetica-Bold');
  doc.text('STAGE:', 80, 225);
  doc.font('Helvetica');
  doc.text('VI — Transparency & Accountability Infrastructure', 280, 225);
  
  doc.font('Helvetica-Bold');
  doc.text('COVERAGE:', 80, 245);
  doc.font('Helvetica');
  doc.text('Blocks 10.2–10.9 (8 blocks)', 280, 245);
  
  doc.font('Helvetica-Bold');
  doc.text('CLOSURE DATE:', 80, 265);
  doc.font('Helvetica');
  const closureDate = new Date(manifest.timestamp);
  doc.text(closureDate.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }), 280, 265);
  
  doc.font('Helvetica-Bold');
  doc.text('VALID UNTIL:', 80, 285);
  doc.font('Helvetica');
  doc.text('Permanent (Cryptographically Sealed)', 280, 285);
  
  // Scope Section
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('SCOPE OF STAGE VI', 80, 320);
  doc.fontSize(9).font('Helvetica');
  
  const scopeItems = [
    '• Transparency API & Public Ethics Portal (10.2)',
    '• Ethical Monitoring & Self-Checking Systems (10.3)',
    '• Governance Dashboard Refinement (10.4)',
    '• Legal & Accessibility Compliance (10.5)',
    '• Public Feedback & Trust Framework (10.6)',
    '• Daily Governance Monitoring Reports (10.7)',
    '• External Accessibility Certification (10.8)',
    '• Final Governance Closure & Handover (10.9)'
  ];
  
  let yPos = 340;
  for (const item of scopeItems) {
    doc.text(item, 85, yPos, { width: 450 });
    yPos += 15;
  }
  
  // Cryptographic Evidence Section
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('CRYPTOGRAPHIC EVIDENCE', 80, yPos + 10);
  doc.fontSize(9).font('Helvetica');
  
  yPos += 30;
  doc.text(`Total Artifacts Verified: ${manifest.summary.total_artifacts}`, 85, yPos);
  yPos += 15;
  doc.text(`Blocks Covered: ${manifest.summary.total_blocks}`, 85, yPos);
  yPos += 15;
  doc.text(`Hash Algorithm: SHA-256 (FIPS 180-4)`, 85, yPos);
  yPos += 20;
  
  doc.font('Helvetica-Bold');
  doc.text('Chain Checksum:', 85, yPos);
  doc.fontSize(7).font('Courier');
  doc.text(manifest.chain_checksum, 85, yPos + 12, { width: 450 });
  yPos += 30;
  
  // Manifest Hash
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('Manifest Hash (SHA-256):', 85, yPos);
  doc.fontSize(7).font('Courier');
  if (manifestHash) {
    doc.text(manifestHash.substring(0, 64), 85, yPos + 12, { width: 450 });
  }
  yPos += 30;
  
  // Signers Section
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('AUTHORIZED SIGNERS', 80, yPos);
  doc.fontSize(9).font('Helvetica');
  
  yPos += 20;
  doc.font('Helvetica-Bold');
  doc.text('Chief AI Engineer:', 85, yPos);
  doc.font('Helvetica');
  doc.text('Aykut Aydin (A.I.K.)', 85, yPos + 12);
  doc.fontSize(8);
  doc.text('Founder, Principal Architect', 85, yPos + 25);
  doc.text('Technical Implementation & Security Review', 85, yPos + 37);
  
  yPos += 55;
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('Governance Lead:', 85, yPos);
  doc.font('Helvetica');
  doc.text('E.W. Armstrong (EWA)', 85, yPos + 12);
  doc.fontSize(8);
  doc.text('Ethical Governance Supervisor', 85, yPos + 25);
  doc.text('Compliance Verification & Ethical Oversight', 85, yPos + 37);
  
  // Verification Section
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('VERIFICATION', 320, yPos - 55);
  doc.fontSize(8).font('Helvetica');
  doc.text('Ledger Reference:', 320, yPos - 35);
  doc.fontSize(7).font('Courier');
  doc.text('entry-block10.9-closure', 320, yPos - 25);
  
  doc.fontSize(8).font('Helvetica');
  doc.text('Public API:', 320, yPos - 10);
  doc.fontSize(7).font('Courier');
  doc.text('/api/ethics/ledger', 320, yPos);
  
  doc.fontSize(8).font('Helvetica');
  doc.text('Verification Script:', 320, yPos + 15);
  doc.fontSize(7).font('Courier');
  doc.text('verify-stage-vi-closure.mjs', 320, yPos + 25);
  
  // Certification Statement
  yPos = doc.page.height - 165;
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('CERTIFICATION STATEMENT', 80, yPos);
  doc.fontSize(8).font('Helvetica');
  doc.text(
    'This certificate confirms that QuantumPoly has successfully completed Stage VI of its Governance Framework, covering Blocks 10.2 through 10.9. All deliverables have been implemented, reviewed, cryptographically verified, and dual-signed by authorized governance leads. Complete evidence is publicly available and independently verifiable.',
    80, yPos + 15, { width: 450, align: 'justify' }
  );
  
  // Stage VII Handover Notice
  yPos = doc.page.height - 110;
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('STAGE VII HANDOVER', 80, yPos);
  doc.fontSize(8).font('Helvetica');
  doc.text(
    'Federation & Collective Ethics • Initiation: February 3, 2026',
    80, yPos + 15, { width: 450 }
  );
  
  // Footer - Contact & URLs
  yPos = doc.page.height - 75;
  doc.fontSize(8).font('Helvetica-Bold');
  doc.text('PUBLIC VERIFICATION', 80, yPos);
  doc.fontSize(7).font('Helvetica');
  doc.text('Manifest: governance/ledger/stageVI-hashes.json', 80, yPos + 12);
  doc.text('Ledger: governance/ledger/entry-block10.9.jsonl', 80, yPos + 23);
  doc.text('Verification: node scripts/verify-stage-vi-closure.mjs', 80, yPos + 34);
  
  doc.fontSize(8).font('Helvetica-Bold');
  doc.text('CONTACT', 320, yPos);
  doc.fontSize(7).font('Helvetica');
  doc.text('governance@quantumpoly.ai', 320, yPos + 12);
  doc.text('https://quantumpoly.ai/governance', 320, yPos + 23);
  
  // Final tagline
  doc.fontSize(8).font('Helvetica-Oblique');
  doc.text('Ethics Signed and Sealed — Transparency over Perfection', 60, doc.page.height - 30, { 
    align: 'center',
    width: doc.page.width - 120
  });
  
  doc.end();
  
  stream.on('finish', () => {
    const stats = fs.statSync(OUTPUT_PDF_PATH);
    const certHash = calculateHash(OUTPUT_PDF_PATH);
    
    console.log('✅ Certificate generated successfully!');
    console.log(`   Location: ${OUTPUT_PDF_PATH}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    if (certHash) {
      console.log(`   Certificate Hash: ${certHash}`);
    }
    console.log(`   Chain Checksum: ${manifest.chain_checksum}`);
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

