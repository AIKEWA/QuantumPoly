const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

describe('daily-governance-report script', () => {
  it('preserves zero EII instead of converting it to null', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qp-daily-report-'));
    const ledgerDir = path.join(tempDir, 'governance', 'ledger');
    const outputPath = path.join(tempDir, 'reports', 'monitoring-2026-02-21.json');
    const scriptPath = path.join(process.cwd(), 'scripts', 'daily-governance-report.mjs');

    try {
      fs.mkdirSync(ledgerDir, { recursive: true });
      fs.writeFileSync(
        path.join(ledgerDir, 'ledger.jsonl'),
        `${JSON.stringify({ timestamp: '2026-02-21T00:00:00.000Z', eii: 0 })}\n`,
        'utf8'
      );

      const result = spawnSync(
        process.execPath,
        [scriptPath, '--date=2026-02-21', `--output=${outputPath}`],
        { cwd: tempDir, encoding: 'utf8' }
      );

      expect([0, 1]).toContain(result.status);
      expect(fs.existsSync(outputPath)).toBe(true);

      const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      expect(report.ethical_metrics.eii_current).toBe(0);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
