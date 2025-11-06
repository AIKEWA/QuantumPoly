/**
 * @fileoverview QR Code Generation for Trust Proofs
 * @module lib/trust/qr-generator
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Generates QR codes containing verification URLs for trust proofs.
 * QR codes are embedded in PDF reports to enable offline verification.
 */

import QRCode from 'qrcode';

import { generateAttestationPayload, createVerificationURL, getTrustProofConfig } from './token-generator';

/**
 * Generate QR code for an artifact
 * 
 * @param artifactId - Unique identifier for the artifact
 * @param artifactHash - SHA-256 hash of the artifact
 * @param metadata - Optional metadata
 * @returns QR code as data URL (base64 PNG)
 */
export async function generateQRCodeForArtifact(
  artifactId: string,
  artifactHash: string,
  _metadata?: Record<string, unknown>
): Promise<string> {
  // Generate attestation payload
  const payload = generateAttestationPayload(artifactId, artifactHash);
  
  // Create verification URL
  const verificationURL = createVerificationURL(payload.rid, payload.sig);
  
  // Generate QR code as data URL
  try {
    const qrDataURL = await QRCode.toDataURL(verificationURL, {
      errorCorrectionLevel: 'M', // Medium error correction
      type: 'image/png',
      width: 200, // 200px width for good scanning
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return qrDataURL;
  } catch (error) {
    console.error('[Trust Proof] QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer (for embedding in PDFs)
 * 
 * @param artifactId - Unique identifier for the artifact
 * @param artifactHash - SHA-256 hash of the artifact
 * @returns QR code as PNG buffer
 */
export async function generateQRCodeBuffer(
  artifactId: string,
  artifactHash: string
): Promise<Buffer> {
  const payload = generateAttestationPayload(artifactId, artifactHash);
  const verificationURL = createVerificationURL(payload.rid, payload.sig);
  
  try {
    const buffer = await QRCode.toBuffer(verificationURL, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return buffer;
  } catch (error) {
    console.error('[Trust Proof] QR code buffer generation failed:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}

/**
 * Embed QR code in PDF document
 * 
 * @param doc - PDFKit document instance
 * @param qrDataURL - QR code as data URL
 * @param options - Positioning and sizing options
 */
export function embedQRInPDF(
  doc: any,
  qrDataURL: string,
  options?: {
    x?: number;
    y?: number;
    width?: number;
    align?: 'left' | 'center' | 'right';
  }
): void {
  const opts = {
    x: options?.x || 50,
    y: options?.y || doc.page.height - 150,
    width: options?.width || 80,
    align: options?.align || 'center',
  };

  // Calculate x position for alignment
  let xPos = opts.x;
  if (opts.align === 'center') {
    xPos = (doc.page.width - opts.width) / 2;
  } else if (opts.align === 'right') {
    xPos = doc.page.width - opts.width - 50;
  }

  // Embed QR code image
  try {
    doc.image(qrDataURL, xPos, opts.y, {
      width: opts.width,
      height: opts.width, // Square QR code
    });
  } catch (error) {
    console.error('[Trust Proof] Failed to embed QR in PDF:', error);
  }
}

/**
 * Create complete trust proof footer for PDF
 * 
 * @param doc - PDFKit document instance
 * @param artifactId - Artifact identifier
 * @param artifactHash - Artifact hash
 * @param issuedAt - ISO timestamp when proof was issued
 * @param qrDataURL - QR code data URL
 */
export function createTrustProofFooter(
  doc: any,
  artifactId: string,
  artifactHash: string,
  issuedAt: string,
  qrDataURL: string
): void {
  // const config = getTrustProofConfig();
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;
  const footerY = pageHeight - 180;

  // Save current state
  doc.save();

  // Draw separator line
  doc
    .moveTo(50, footerY - 20)
    .lineTo(pageWidth - 50, footerY - 20)
    .stroke('#CCCCCC');

  // Title
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('QuantumPoly Trust Proof (Scan to Verify)', 50, footerY, {
      width: pageWidth - 100,
      align: 'center',
    });

  // QR Code (centered)
  const qrSize = 80;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = footerY + 20;

  doc.image(qrDataURL, qrX, qrY, {
    width: qrSize,
    height: qrSize,
  });

  // Information below QR code
  const infoY = qrY + qrSize + 10;
  
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#333333');

  doc.text(`Report ID: ${artifactId}`, 50, infoY, {
    width: pageWidth - 100,
    align: 'center',
  });

  doc.text(`Issued: ${new Date(issuedAt).toISOString().split('T')[0]}`, 50, infoY + 12, {
    width: pageWidth - 100,
    align: 'center',
  });

  doc.text('Verify: quantumpoly.ai/api/trust/proof', 50, infoY + 24, {
    width: pageWidth - 100,
    align: 'center',
  });

  // Hash (truncated for display)
  doc
    .fontSize(7)
    .fillColor('#666666')
    .text(`Hash: ${artifactHash.substring(0, 32)}...`, 50, infoY + 36, {
      width: pageWidth - 100,
      align: 'center',
    });

  // Restore state
  doc.restore();
}

/**
 * Generate verification instructions text
 * 
 * @param artifactId - Artifact identifier
 * @param signature - Verification signature
 * @returns Human-readable verification instructions
 */
export function generateVerificationInstructions(
  artifactId: string,
  signature: string
): string {
  const config = getTrustProofConfig();
  const verificationURL = createVerificationURL(artifactId, signature);

  return `
VERIFICATION INSTRUCTIONS
═════════════════════════

To verify the authenticity and integrity of this document:

1. SCAN THE QR CODE above with your mobile device
   OR
2. VISIT: ${verificationURL}
   OR
3. MANUAL VERIFICATION:
   - Go to: ${config.baseUrl}/api/trust/proof
   - Enter Report ID: ${artifactId}
   - Enter Signature: ${signature.substring(0, 32)}...

The verification API will return:
- Artifact hash (compare with document hash)
- Issuance timestamp
- Ledger reference
- Verification status (valid/expired/revoked)

For more information, visit:
${config.baseUrl}/governance/trust-proof

═════════════════════════
`.trim();
}

