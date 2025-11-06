/**
 * @fileoverview Tests for Report Generator
 * @see BLOCK9.4_PUBLIC_ETHICS_API.md
 */

import fs from 'fs';
import path from 'path';

import {
  generateEthicsReportJSON,
  computeReportHash,
} from '@/lib/governance/report-generator';

describe('Report Generator', () => {
  const testOutputDir = path.join(process.cwd(), 'reports', 'ethics', 'test');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('generateEthicsReportJSON', () => {
    it('should generate valid JSON report', () => {
      const report = generateEthicsReportJSON();

      expect(report).toHaveProperty('metadata');
      expect(report).toHaveProperty('governance');
      expect(report).toHaveProperty('ethics');
      expect(report).toHaveProperty('consent');
      expect(report).toHaveProperty('verification');
      expect(report).toHaveProperty('compliance');
      expect(report).toHaveProperty('responsibleRoles');
    });

    it('should include correct metadata', () => {
      const report = generateEthicsReportJSON();

      expect(report.metadata).toHaveProperty('reportId');
      expect(report.metadata).toHaveProperty('generatedAt');
      expect(report.metadata).toHaveProperty('reportDate');
      expect(report.metadata.version).toBe('1.0.0');
      expect(report.metadata.blockId).toBe('9.4');
    });

    it('should include EII data', () => {
      const report = generateEthicsReportJSON();

      expect(report.ethics.eii).toHaveProperty('current');
      expect(report.ethics.eii).toHaveProperty('avg90d');
      expect(report.ethics.eii).toHaveProperty('trend');
      expect(report.ethics.eii).toHaveProperty('breakdown');
      expect(typeof report.ethics.eii.current).toBe('number');
    });

    it('should include compliance baseline', () => {
      const report = generateEthicsReportJSON();

      expect(report.compliance.blocks).toContain('9.4');
      expect(report.compliance.regulations).toContain('GDPR 2016/679');
      expect(report.compliance.status).toBe('operational');
    });

    it('should save to file when path provided', () => {
      const outputPath = path.join(testOutputDir, 'test-report.json');
      const report = generateEthicsReportJSON(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      const savedReport = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      expect(savedReport.metadata.reportId).toBe(report.metadata.reportId);
    });
  });

  describe('computeReportHash', () => {
    it('should compute SHA-256 hash of file', () => {
      const testFile = path.join(testOutputDir, 'hash-test.txt');
      fs.writeFileSync(testFile, 'test content', 'utf8');

      const hash = computeReportHash(testFile);

      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce consistent hashes', () => {
      const testFile = path.join(testOutputDir, 'hash-test-2.txt');
      fs.writeFileSync(testFile, 'consistent content', 'utf8');

      const hash1 = computeReportHash(testFile);
      const hash2 = computeReportHash(testFile);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', () => {
      const testFile1 = path.join(testOutputDir, 'hash-test-3.txt');
      const testFile2 = path.join(testOutputDir, 'hash-test-4.txt');

      fs.writeFileSync(testFile1, 'content A', 'utf8');
      fs.writeFileSync(testFile2, 'content B', 'utf8');

      const hash1 = computeReportHash(testFile1);
      const hash2 = computeReportHash(testFile2);

      expect(hash1).not.toBe(hash2);
    });
  });
});

