/**
 * @fileoverview Trust Proof Configuration
 * @module config/trust-proof
 * @see BLOCK9.7_TRUST_PROOF_FRAMEWORK.md
 *
 * Configuration for the Trust Proof & Attestation Layer.
 * Can be overridden via environment variables.
 */

/**
 * Trust Proof Configuration
 */
export const trustProofConfig = {
  /**
   * HMAC secret key for token signing
   * MUST be set via TRUST_PROOF_SECRET environment variable in production
   */
  secret: process.env.TRUST_PROOF_SECRET || 'default-dev-secret-change-in-production',

  /**
   * Token expiry duration in days
   * Default: 90 days
   */
  expiryDays: parseInt(process.env.TRUST_PROOF_EXPIRY_DAYS || '90', 10),

  /**
   * Issuer identifier
   */
  issuer: process.env.TRUST_PROOF_ISSUER || 'trust-attestation-service@quantumpoly',

  /**
   * Base URL for verification
   */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.quantumpoly.ai',

  /**
   * Governance block reference
   */
  governanceBlock: '9.7',

  /**
   * Compliance stage
   */
  complianceStage: 'Stage VII — Trust Proof & Attestation',

  /**
   * Hash algorithm (fixed)
   */
  hashAlgorithm: 'SHA-256',

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    /** Requests per minute for verification API */
    verificationApiLimit: 60,
    /** Time window in milliseconds */
    windowMs: 60 * 1000,
  },

  /**
   * QR Code configuration
   */
  qrCode: {
    /** Error correction level: L, M, Q, H */
    errorCorrectionLevel: 'M',
    /** QR code width in pixels */
    width: 200,
    /** Margin around QR code */
    margin: 2,
    /** Colors */
    colors: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  },

  /**
   * Storage paths
   */
  storage: {
    /** Active proofs storage */
    activeProofs: 'governance/trust-proofs/active-proofs.jsonl',
    /** Revoked proofs storage */
    revokedProofs: 'governance/trust-proofs/revoked-proofs.jsonl',
    /** Governance ledger */
    ledger: 'governance/ledger/ledger.jsonl',
  },

  /**
   * Revocation policy
   */
  revocation: {
    /** Require governance approval for revocation */
    requireApproval: true,
    /** Allowed revocation roles */
    authorizedRoles: [
      'Governance Officer',
      'Transparency Engineer',
      'External Audit Witness',
    ],
  },
};

export default trustProofConfig;

