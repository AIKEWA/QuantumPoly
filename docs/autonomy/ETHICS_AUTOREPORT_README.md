# Ethics Autonomous Reporting System

**Version:** 1.0.0  
**Block:** 9.4  
**Status:** Operational

---

## Overview

The Ethics Autonomous Reporting System generates periodic transparency reports without manual intervention. Reports include:

- Ethics Integrity Index (EII) scores and trends
- Governance ledger summaries
- Consent statistics (aggregated, privacy-preserving)
- Cryptographic verification proofs
- Compliance baseline status

Reports are generated monthly via GitHub Actions, cryptographically signed, and committed to the repository for public transparency.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIGGER MECHANISMS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • GitHub Actions (Cron: 1st of month, 00:00 UTC)           │
│  • Manual: workflow_dispatch                                │
│  • API: POST /api/ethics/report/generate                    │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  REPORT GENERATION                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  scripts/autonomous-report.mjs                               │
│  └─> Fetch data → Generate JSON → Generate PDF              │
│      → Compute hashes → Sign (optional) → Update ledger     │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    OUTPUT ARTIFACTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  reports/ethics/                                             │
│  ├── ETHICS_REPORT_YYYY-MM-DD.json                          │
│  ├── ETHICS_REPORT_YYYY-MM-DD.pdf                           │
│  └── ETHICS_REPORT_YYYY-MM-DD.pdf.sig (if signed)           │
│                                                              │
│  governance/ledger/ledger.jsonl                              │
│  └── New entry: ethics-report-YYYY-MM-DD                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites

1. **Node.js 20+**
2. **npm dependencies installed:**

   ```bash
   npm ci --legacy-peer-deps
   ```

3. **GPG key (optional, for signing):**
   - Generate: `gpg --full-generate-key`
   - Export private key: `gpg --export-secret-keys --armor KEY_ID | base64`
   - Export public key: `gpg --export --armor KEY_ID | base64`

### Environment Variables

**For Local Development:**

```bash
# Optional: Enable GPG signing
export GPG_PRIVATE_KEY="<base64-encoded-private-key>"
export GPG_KEY_ID="<your-key-id>"

# Optional: API key for manual trigger endpoint
export ETHICS_REPORT_API_KEY="<your-secret-key>"
```

**For GitHub Actions:**

Add secrets in repository settings:

- `GPG_PRIVATE_KEY` — Base64-encoded GPG private key
- `GPG_KEY_ID` — GPG key ID (e.g., `0x1234ABCD`)
- `GPG_PUBLIC_KEY` — Base64-encoded GPG public key (for verification)

---

## CLI Usage

### Basic Commands

**Generate Report (Dry Run):**

```bash
npm run ethics:report:dry-run
```

Output: Preview report structure without saving files or updating ledger.

**Generate Report (Production):**

```bash
npm run ethics:report
```

Output:

- `reports/ethics/ETHICS_REPORT_YYYY-MM-DD.json`
- `reports/ethics/ETHICS_REPORT_YYYY-MM-DD.pdf`
- Ledger entry in `governance/ledger/ledger.jsonl`

**Generate Report (With GPG Signing):**

```bash
npm run ethics:report -- --sign
```

Output: Same as production, plus `ETHICS_REPORT_YYYY-MM-DD.pdf.sig`

**Direct Script Invocation:**

```bash
node scripts/autonomous-report.mjs [options]
```

Options:

- `--dry-run` — Generate without saving
- `--sign` — Enable GPG signing
- `--upload` — Flag for CI/CD (indicates commit intent)

---

### Example Workflow

**1. Test Report Generation:**

```bash
# Dry run to preview
npm run ethics:report:dry-run

# Check output
echo "Report would be saved to: reports/ethics/ETHICS_REPORT_$(date +%Y-%m-%d).json"
```

**2. Generate Production Report:**

```bash
# Generate with signing
npm run ethics:report -- --sign

# Verify files created
ls -lh reports/ethics/ETHICS_REPORT_$(date +%Y-%m-%d)*
```

**3. Verify Report Integrity:**

```bash
# Run verification script
npm run ethics:verify-reporting

# Check ledger integrity
npm run ethics:verify-ledger -- --scope=all
```

**4. Commit to Repository:**

```bash
git add reports/ethics/ governance/ledger/ledger.jsonl
git commit -m "chore(ethics): autonomous report $(date +%Y-%m-%d)"
git push
```

---

## Scheduling

### GitHub Actions (Recommended)

The system includes a pre-configured workflow: `.github/workflows/ethics-reporting.yml`

**Schedule:** 1st day of every month at 00:00 UTC

**Manual Trigger:**

1. Go to GitHub Actions tab
2. Select "Ethics Reporting" workflow
3. Click "Run workflow"
4. Configure options:
   - Enable GPG signing: `true` (default)
   - Dry run mode: `false` (default)

**Workflow Steps:**

1. Checkout repository
2. Install dependencies
3. Configure GPG (if signing enabled)
4. Generate report
5. Verify ledger integrity
6. Upload artifacts (365-day retention)
7. Commit reports to repository
8. Verify report integrity

---

### Cron Configuration

**Default Schedule:**

```yaml
schedule:
  - cron: '0 0 1 * *' # Monthly: 1st day at 00:00 UTC
```

**Alternative Schedules:**

```yaml
# Weekly: Every Sunday at 00:00 UTC
- cron: '0 0 * * 0'

# Bi-weekly: 1st and 15th at 00:00 UTC
- cron: '0 0 1,15 * *'

# Quarterly: 1st day of Jan, Apr, Jul, Oct
- cron: '0 0 1 1,4,7,10 *'
```

---

### Local Cron (Alternative)

**macOS/Linux:**

```bash
# Edit crontab
crontab -e

# Add entry (monthly on 1st at 00:00)
0 0 1 * * cd /path/to/quantumpoly && npm run ethics:report -- --sign
```

**Windows Task Scheduler:**

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Monthly, 1st day, 00:00
4. Action: Start a program
   - Program: `node`
   - Arguments: `scripts/autonomous-report.mjs --sign`
   - Start in: `C:\path\to\quantumpoly`

---

## Storage & Retention

### File Locations

| File Type     | Path                                              | Purpose                     |
| ------------- | ------------------------------------------------- | --------------------------- |
| JSON Report   | `reports/ethics/ETHICS_REPORT_YYYY-MM-DD.json`    | Machine-readable data       |
| PDF Report    | `reports/ethics/ETHICS_REPORT_YYYY-MM-DD.pdf`     | Human-readable document     |
| GPG Signature | `reports/ethics/ETHICS_REPORT_YYYY-MM-DD.pdf.sig` | Cryptographic attestation   |
| Ledger Entry  | `governance/ledger/ledger.jsonl`                  | Immutable governance record |

### Retention Policy

**Repository (Git):**

- ✅ Retained indefinitely
- ✅ Version controlled
- ✅ Publicly accessible
- ✅ Immutable history

**GitHub Actions Artifacts:**

- ✅ Retained for 365 days
- ✅ Downloadable via Actions UI
- ✅ Separate from repository (backup)

**Cleanup:**

Reports are never automatically deleted. Manual cleanup (if needed):

```bash
# List old reports
ls -lh reports/ethics/

# Remove reports older than 2 years (example)
find reports/ethics/ -name "ETHICS_REPORT_*.json" -mtime +730 -delete
find reports/ethics/ -name "ETHICS_REPORT_*.pdf" -mtime +730 -delete
```

---

## Verification

### Verify Report Integrity

**Automated Verification:**

```bash
npm run ethics:verify-reporting
```

Checks:

- ✅ API endpoints exist
- ✅ Scripts and libraries present
- ✅ Report files generated
- ✅ Hashes match ledger entries
- ✅ GPG signatures valid (if present)
- ✅ Ledger integrity verified

**Manual Hash Verification:**

```bash
# Compute PDF hash
sha256sum reports/ethics/ETHICS_REPORT_2025-10-28.pdf

# Compare with ledger entry
grep "ethics-report-2025-10-28" governance/ledger/ledger.jsonl | jq '.hash'
```

**GPG Signature Verification:**

```bash
# Verify signature
gpg --verify reports/ethics/ETHICS_REPORT_2025-10-28.pdf.sig \
              reports/ethics/ETHICS_REPORT_2025-10-28.pdf

# Expected output:
# gpg: Good signature from "QuantumPoly Governance <governance@quantumpoly.ai>"
```

---

## Troubleshooting

### Issue: Report Generation Fails

**Symptoms:**

- Script exits with error
- No files created in `reports/ethics/`

**Diagnosis:**

```bash
# Run in dry-run mode to see errors
npm run ethics:report:dry-run

# Check ledger files exist
ls -lh governance/ledger/ledger.jsonl
ls -lh governance/consent/ledger.jsonl
```

**Solutions:**

1. **Missing dependencies:**

   ```bash
   npm ci --legacy-peer-deps
   ```

2. **Ledger file missing:**

   ```bash
   # Create empty ledger
   touch governance/ledger/ledger.jsonl
   ```

3. **Permission errors:**
   ```bash
   # Ensure reports directory is writable
   chmod -R u+w reports/ethics/
   ```

---

### Issue: GPG Signing Fails

**Symptoms:**

- Report generated but no `.sig` file
- Warning: "GPG signing skipped"

**Diagnosis:**

```bash
# Check GPG environment variables
echo $GPG_KEY_ID
echo $GPG_PRIVATE_KEY | wc -c  # Should be > 0

# Test GPG import
echo "$GPG_PRIVATE_KEY" | base64 -d | gpg --import
```

**Solutions:**

1. **GPG not configured:**

   ```bash
   # Generate key
   gpg --full-generate-key

   # Export and set environment variable
   export GPG_KEY_ID="0x1234ABCD"
   export GPG_PRIVATE_KEY=$(gpg --export-secret-keys --armor $GPG_KEY_ID | base64)
   ```

2. **Key already imported:**
   - This is normal, signing should still work
   - Check for `.sig` file after generation

3. **GPG not installed:**

   ```bash
   # macOS
   brew install gnupg

   # Ubuntu/Debian
   sudo apt-get install gnupg
   ```

---

### Issue: Ledger Entry Not Created

**Symptoms:**

- Report files generated
- No new entry in `ledger.jsonl`

**Diagnosis:**

```bash
# Check last ledger entry
tail -1 governance/ledger/ledger.jsonl | jq .

# Check script output for errors
npm run ethics:report 2>&1 | grep -i error
```

**Solutions:**

1. **Dry-run mode active:**

   ```bash
   # Run without --dry-run flag
   npm run ethics:report
   ```

2. **Ledger file permissions:**

   ```bash
   chmod u+w governance/ledger/ledger.jsonl
   ```

3. **Duplicate entry:**
   - Script may skip if entry already exists for today
   - Check: `grep "ethics-report-$(date +%Y-%m-%d)" governance/ledger/ledger.jsonl`

---

### Issue: GitHub Actions Workflow Fails

**Symptoms:**

- Workflow runs but fails
- Red X in Actions tab

**Diagnosis:**

1. Check workflow logs in GitHub Actions UI
2. Look for specific error messages

**Common Solutions:**

1. **Missing secrets:**
   - Go to Settings → Secrets → Actions
   - Add `GPG_PRIVATE_KEY` and `GPG_KEY_ID`

2. **Permission errors:**
   - Workflow needs `contents: write` permission
   - Check `.github/workflows/ethics-reporting.yml`

3. **Dependency installation fails:**
   - Check `npm ci --legacy-peer-deps` step
   - May need to update `package-lock.json`

---

## API Integration

### Manual Report Generation via API

**Endpoint:** `POST /api/ethics/report/generate`

**Example:**

```bash
# Generate report via API
curl -X POST https://www.quantumpoly.ai/api/ethics/report/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"sign": true, "dryRun": false}'
```

**Response:**

```json
{
  "status": "success",
  "message": "Report generated successfully",
  "report": {
    "date": "2025-10-28",
    "json_url": "/reports/ethics/ETHICS_REPORT_2025-10-28.json",
    "pdf_url": "/reports/ethics/ETHICS_REPORT_2025-10-28.pdf",
    "signature_url": "/reports/ethics/ETHICS_REPORT_2025-10-28.pdf.sig",
    "json_hash": "...",
    "pdf_hash": "..."
  },
  "execution": {
    "dry_run": false,
    "signed": true,
    "timestamp": "2025-10-28T12:00:00Z"
  }
}
```

**Rate Limiting:** 1 request per hour per IP

---

## Security Considerations

### Cryptographic Attestation

**SHA-256 Hashing:**

- Every report file is hashed
- Hash stored in ledger entry
- Enables tamper detection

**GPG Signing (Optional):**

- Provides legal verifiability
- Proves authorship
- Requires private key (kept secret)

**Merkle Root:**

- Global proof of ledger integrity
- Combines governance + consent ledgers
- Publicly verifiable

### Privacy Guarantees

✅ **No Personal Data in Reports**

- Consent statistics are aggregated
- No user IDs, emails, or IP addresses
- No individual behavior tracking

✅ **Aggregation at Source**

- Data is aggregated before report generation
- Raw logs never included
- Pseudonymization enforced

---

## Performance

**Report Generation Time:**

- JSON: ~1-2 seconds
- PDF: ~3-5 seconds
- GPG signing: ~1-2 seconds
- **Total:** ~5-10 seconds

**Resource Usage:**

- CPU: Low (Node.js script)
- Memory: ~50-100 MB
- Disk: ~500 KB per report (JSON + PDF)

**Scalability:**

- Monthly reports: ~6 MB/year
- Ledger growth: ~1 KB per entry
- No performance impact on production site

---

## Future Enhancements

**Planned (Q1 2026):**

1. EII qualitative labels in PDF ("Excellent", "Good", etc.)
2. Historical trend charts (1-year view)
3. Industry benchmark comparisons
4. QR code for mobile verification
5. Multi-language report generation (DE, FR, ES)

**Under Consideration:**

1. Real-time EII dashboard widget
2. Email notifications for report generation
3. Automated social media posting (transparency)
4. Third-party audit integration (API webhooks)

---

## Support

**Documentation:**

- Main: `BLOCK09.4_PUBLIC_ETHICS_API.md`
- OpenAPI: `public/api-schema.json`
- Governance: `governance/README.md`

**Scripts:**

- Generation: `scripts/autonomous-report.mjs`
- Verification: `scripts/verify-ethics-reporting.mjs`
- Ledger verification: `scripts/verify-ledger.mjs`

**Contact:**

- Governance Officer: governance@quantumpoly.ai
- Technical Lead: tech@quantumpoly.ai

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-28  
**Status:** ✅ Operational

---

_This guide is part of the QuantumPoly Governance Architecture and is maintained under version control._
