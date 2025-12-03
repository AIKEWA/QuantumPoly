import fs from 'fs';

import { getIntegrityEIIHistory, verifyIntegrityLedger } from '@/lib/integrity';

jest.mock('fs');
jest.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
}));

describe('Integrity Module Performance', () => {
  const NUM_ENTRIES = 1000;
  let largeLedger: string;

  beforeAll(() => {
    // Generate large ledger
    const entries = [];
    const now = new Date();
    
    for (let i = 0; i < NUM_ENTRIES; i++) {
      const date = new Date(now.getTime() - (NUM_ENTRIES - i) * 86400000); // Daily entries
      entries.push({
        id: `entry-${i}`,
        timestamp: date.toISOString(),
        commit: `hash-${i}`,
        entryType: 'eii-baseline',
        eii: 70 + Math.random() * 20,
        metrics: {
          security: 70 + Math.random() * 20,
          accessibility: 70 + Math.random() * 20,
          transparency: 70 + Math.random() * 20,
          privacy: 70 + Math.random() * 20,
        },
        hash: 'a'.repeat(64), // Valid length hash
        merkleRoot: `root-${i}`,
      });
    }
    
    largeLedger = entries.map(e => JSON.stringify(e)).join('\n');
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it(`should parse and process ${NUM_ENTRIES} ledger entries efficiently`, () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(largeLedger);

    const start = performance.now();
    getIntegrityEIIHistory('governance/ledger/ledger.jsonl');
    const end = performance.now();
    
    const duration = end - start;
    console.log(`getIntegrityEIIHistory (${NUM_ENTRIES} entries): ${duration.toFixed(2)}ms`);
    
    // Simple assertion to ensure it's not terribly slow (e.g. < 500ms for 1000 entries)
    // This depends on the machine, so we keep it loose or just log it.
    expect(duration).toBeLessThan(1000);
  });

  it(`should verify ${NUM_ENTRIES} ledger entries efficiently`, () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(largeLedger);

    const start = performance.now();
    verifyIntegrityLedger('governance/ledger/ledger.jsonl');
    const end = performance.now();
    
    const duration = end - start;
    console.log(`verifyIntegrityLedger (${NUM_ENTRIES} entries): ${duration.toFixed(2)}ms`);
    
    expect(duration).toBeLessThan(1000);
  });
});

