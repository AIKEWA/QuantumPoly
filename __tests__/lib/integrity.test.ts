import fs from 'fs';

import {
  getIntegrityEIIHistory,
  verifyIntegrityLedger,
  getIntegrityConsentMetrics,
} from '@/lib/integrity';
import { ConsentEventType, ConsentCategory } from '@/types/integrity';

jest.mock('fs');
jest.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
}));

describe('Integrity Module', () => {
  const now = new Date();
  const today = now.toISOString();
  const yesterday = new Date(now.getTime() - 86400000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();

  const mockGovernanceLedger = [
    {
      id: 'entry-1',
      timestamp: twoDaysAgo,
      commit: 'hash1',
      entryType: 'eii-baseline',
      eii: 80.0,
      metrics: {
        security: 80,
        accessibility: 80,
        transparency: 80,
        privacy: 80,
      },
      hash: 'a'.repeat(64),
      merkleRoot: 'm1',
    },
    {
      id: 'entry-2',
      timestamp: yesterday,
      commit: 'hash2',
      entryType: 'eii-baseline',
      eii: 82.0,
      metrics: {
        security: 82,
        accessibility: 82,
        transparency: 82,
        privacy: 82,
      },
      hash: 'b'.repeat(64),
      merkleRoot: 'm2',
    },
    {
      id: 'entry-3',
      timestamp: today,
      commit: 'hash3',
      entryType: 'eii-baseline',
      eii: 85.0,
      metrics: {
        security: 85,
        accessibility: 85,
        transparency: 85,
        privacy: 85,
      },
      hash: 'c'.repeat(64),
      merkleRoot: 'm3',
    },
  ];

  const mockConsentLedger = [
    {
      timestamp: twoDaysAgo,
      userId: 'user1',
      event: ConsentEventType.ConsentGiven,
      preferences: {
        essential: true,
        analytics: true,
        performance: false,
      },
      policyVersion: '1.0',
    },
    {
      timestamp: yesterday,
      userId: 'user2',
      event: ConsentEventType.ConsentGiven,
      preferences: {
        essential: true,
        analytics: false,
        performance: false,
      },
      policyVersion: '1.0',
    },
    {
      timestamp: today,
      userId: 'user1',
      event: ConsentEventType.ConsentUpdated,
      preferences: {
        essential: true,
        analytics: true,
        performance: true,
      },
      policyVersion: '1.0',
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getIntegrityEIIHistory', () => {
    it('should return correct history and statistics', () => {
      // Mock file system read for governance ledger
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        mockGovernanceLedger.map((e) => JSON.stringify(e)).join('\n')
      );

      const history = getIntegrityEIIHistory('governance/ledger/ledger.jsonl');

      expect(history.current).toBe(85.0);
      expect(history.average).toBe(82.3); // (80 + 82 + 85) / 3 = 82.33... -> 82.3
      expect(history.dataPoints).toHaveLength(3);
      expect(history.min).toBe(80.0);
      expect(history.max).toBe(85.0);
      expect(history.trend).toBe('stable'); // Need more data points for trend calc usually or specific logic
    });

    it('should handle empty ledger', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('');

      const history = getIntegrityEIIHistory('governance/ledger/ledger.jsonl');

      expect(history.current).toBe(0);
      expect(history.dataPoints).toHaveLength(0);
    });
  });

  describe('verifyIntegrityLedger', () => {
    it('should verify valid ledger', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        mockGovernanceLedger.map((e) => JSON.stringify(e)).join('\n')
      );

      const result = verifyIntegrityLedger('governance/ledger/ledger.jsonl');

      expect(result.verified).toBe(true);
      expect(result.totalEntries).toBe(3);
      expect(result.merkleRoot).toBe('m3');
    });

    it('should detect chronological violation', () => {
      const invalidLedger = [
        mockGovernanceLedger[1], // 2023-01-02
        mockGovernanceLedger[0], // 2023-01-01
      ];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        invalidLedger.map((e) => JSON.stringify(e)).join('\n')
      );

      const result = verifyIntegrityLedger('governance/ledger/ledger.jsonl');

      expect(result.verified).toBe(false);
    });

    it('should detect hash format violation', () => {
      const invalidHashLedger = [
        { ...mockGovernanceLedger[0], hash: 'invalid-hash' },
      ];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        invalidHashLedger.map((e) => JSON.stringify(e)).join('\n')
      );

      const result = verifyIntegrityLedger('governance/ledger/ledger.jsonl');

      expect(result.verified).toBe(false);
    });
  });

  describe('getIntegrityConsentMetrics', () => {
    it('should aggregate consent metrics correctly', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        mockConsentLedger.map((e) => JSON.stringify(e)).join('\n')
      );

      const metrics = getIntegrityConsentMetrics('governance/consent/ledger.jsonl');

      expect(metrics.totalEvents).toBe(3);
      expect(metrics.totalUsers).toBe(2);
      
      // User 1 final: All true
      // User 2 final: Ess=T, Ana=F, Perf=F
      
      // Essential: 2/2 = 100%
      expect(metrics.categoryMetrics.essential.optIn).toBe(2);
      expect(metrics.categoryMetrics.essential.rate).toBe(100);

      // Analytics: 1/2 = 50%
      expect(metrics.categoryMetrics.analytics.optIn).toBe(1);
      expect(metrics.categoryMetrics.analytics.rate).toBe(50);

      // Performance: 1/2 = 50%
      expect(metrics.categoryMetrics.performance.optIn).toBe(1);
      expect(metrics.categoryMetrics.performance.rate).toBe(50);
    });

    it('should handle missing file gracefully', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const metrics = getIntegrityConsentMetrics('governance/consent/ledger.jsonl');

      expect(metrics.totalEvents).toBe(0);
      expect(metrics.totalUsers).toBe(0);
    });
  });
});

