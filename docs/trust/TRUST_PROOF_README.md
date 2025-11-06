# Trust Proof Developer Guide

**Block:** 9.7 — Ethical Trust Proof & Attestation Layer  
**Audience:** Developers, Integration Engineers  
**Version:** 1.0.0

---

## Quick Start

### Generate a Trust Token

```typescript
import { generateTrustToken } from '@/lib/trust/token-generator';

const token = generateTrustToken(
  'ETHICS_REPORT_2025-11-05',
  '7b3c9e4d3f2b1a0c5e6d7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7e91a',
  { report_type: 'ethics', block_id: '9.4' }
);

console.log(token);
// {
//   artifact_id: 'ETHICS_REPORT_2025-11-05',
//   artifact_hash: '7b3c...',
//   issued_at: '2025-11-05T13:20:00Z',
//   signature: '9f21c91a4c...',
//   ...
// }
```

### Verify a Trust Token

```typescript
import { verifyArtifactProof } from '@/lib/trust/proof-verifier';

const response = verifyArtifactProof(token);

console.log(response.status); // 'valid', 'expired', 'revoked', etc.
```

### Generate QR Code

```typescript
import { generateQRCodeForArtifact } from '@/lib/trust/qr-generator';

const qrDataURL = await generateQRCodeForArtifact(
  'ETHICS_REPORT_2025-11-05',
  '7b3c9e4d3f2b1a0c5e6d7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7e91a'
);

// qrDataURL is a base64 PNG data URL
// Can be embedded in HTML: <img src={qrDataURL} />
// Or in PDF: doc.image(qrDataURL, x, y, { width: 80 })
```

---

## API Integration

### Verify Proof via API

```bash
# Using artifact ID and signature
curl "https://www.quantumpoly.ai/api/trust/proof?rid=ETHICS_REPORT_2025-11-05&sig=9f21c91a4c..."

# Using full token
curl "https://www.quantumpoly.ai/api/trust/proof?token=eyJhcnRpZmFjdF9pZCI6..."
```

### Response Handling

```typescript
const response = await fetch(
  '/api/trust/proof?rid=ETHICS_REPORT_2025-11-05&sig=...'
);

const proof = await response.json();

if (proof.status === 'valid') {
  console.log('✅ Proof is valid');
  console.log('Hash:', proof.artifact_hash);
  console.log('Issued:', proof.issued_at);
} else {
  console.error('❌ Proof verification failed:', proof.notes);
}
```

---

## Adding QR Codes to Custom Reports

### Step 1: Generate Report

```typescript
import { generateEthicsReportPDF } from '@/lib/governance/report-generator';

await generateEthicsReportPDF(reportData, outputPath, {
  includeTrustProof: true,
  artifactHash: 'pending', // Will be computed after generation
});
```

### Step 2: Compute Hash

```typescript
import { computeReportHash } from '@/lib/governance/report-generator';

const hash = computeReportHash(outputPath);
```

### Step 3: Add QR Code

```typescript
import { addQRCodeToReport } from '@/lib/governance/report-generator';

await addQRCodeToReport(outputPath, artifactId, hash);
```

### Step 4: Record Proof

```typescript
import fs from 'fs';

const proofRecord = {
  artifact_id: artifactId,
  artifact_hash: hash,
  token: token,
  issued_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  ledger_reference: 'trust-proof-block9.7',
  status: 'active',
  artifact_type: 'custom_report',
  file_path: outputPath,
};

fs.appendFileSync(
  'governance/trust-proofs/active-proofs.jsonl',
  JSON.stringify(proofRecord) + '\n'
);
```

---

## Token Expiry and Renewal

### Check if Token is Expired

```typescript
function isExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

if (isExpired(token.expires_at)) {
  console.log('⚠️  Token has expired');
  // Regenerate report with new token
}
```

### Renew Expired Proof

```bash
# Regenerate report (automatically creates new proof)
npm run ethics:report
```

---

## Testing and Verification

### Verify All Proofs

```bash
npm run trust:verify
```

### Check Proof Status

```bash
npm run trust:status
```

### Test QR Verification

```bash
npm run trust:test-qr
```

### Revoke a Proof

```bash
npm run trust:revoke -- \
  --artifact-id=ETHICS_REPORT_2025-11-05 \
  --reason="Methodology error" \
  --revoked-by="Governance Officer"
```

---

## Environment Configuration

### Required Environment Variables

```bash
# .env.local
TRUST_PROOF_SECRET=your-hmac-secret-key-here
TRUST_PROOF_EXPIRY_DAYS=90
TRUST_PROOF_ISSUER=trust-attestation-service@quantumpoly
NEXT_PUBLIC_BASE_URL=https://www.quantumpoly.ai
```

### Production Deployment

1. Generate strong secret key:
   ```bash
   openssl rand -hex 32
   ```

2. Set environment variable:
   ```bash
   export TRUST_PROOF_SECRET=<generated-key>
   ```

3. Verify configuration:
   ```bash
   npm run trust:status
   ```

---

## Troubleshooting

### "Invalid token signature"

**Cause:** HMAC secret mismatch  
**Solution:** Ensure `TRUST_PROOF_SECRET` is set correctly

### "Hash mismatch"

**Cause:** File modified after proof generation  
**Solution:** Regenerate proof or investigate tampering

### "Proof not found"

**Cause:** Artifact not in `active-proofs.jsonl`  
**Solution:** Verify proof was recorded during generation

### "Rate limit exceeded"

**Cause:** Too many API requests  
**Solution:** Wait 60 seconds or reduce request frequency

---

## Best Practices

1. **Always verify proofs after generation**
   ```bash
   npm run trust:verify
   ```

2. **Store HMAC secret securely**
   - Never commit to version control
   - Use environment variables
   - Rotate annually

3. **Monitor expiry dates**
   - Set up alerts for proofs expiring soon
   - Regenerate reports before expiry

4. **Document revocations**
   - Always provide clear reason
   - Update governance ledger
   - Notify stakeholders

5. **Test verification flow**
   - Regularly test QR code scanning
   - Verify API responses
   - Check ledger integrity

---

## API Reference

See `BLOCK9.7_TRUST_PROOF_FRAMEWORK.md` for complete API specification.

---

## Support

**Documentation:** https://www.quantumpoly.ai/governance/trust-proof  
**Governance Officer:** governance@quantumpoly.ai  
**Transparency Engineer:** transparency@quantumpoly.ai

---

**Last Updated:** 2025-11-05  
**Version:** 1.0.0  
**Block:** 9.7

