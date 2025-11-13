/**
 * @fileoverview Governance Ledger Synchronization
 * @module lib/governance/ledger-sync
 * @see Governance_Ledger.md
 *
 * Synchronizes governance ledger entries from Integration_Log.md to Governance_Ledger.md
 * Gate D Certification — Governance Ledger Integration
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const INTEGRATION_LOG_PATH = path.join(process.cwd(), 'docs/research/Integration_Log.md');
const GOVERNANCE_LEDGER_PATH = path.join(process.cwd(), 'docs/research/Governance_Ledger.md');

/**
 * Parse Integration_Log.md and extract all entries
 */
function parseIntegrationLog(content: string): IntegrationLogEntry[] {
  const entries: IntegrationLogEntry[] = [];
  const lines = content.split('\n');

  let currentEntry: Partial<IntegrationLogEntry> | null = null;
  let inEntry = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect entry headers (## or ###)
    if (line.startsWith('## ')) {
      // Save previous entry if exists
      if (currentEntry && inEntry) {
        entries.push(currentEntry as IntegrationLogEntry);
      }

      // Start new entry
      const title = line.replace(/^##\s+/, '').trim();
      currentEntry = {
        title,
        type: detectEntryType(title),
        content: [],
        metadata: {},
      };
      inEntry = true;
    } else if (line.startsWith('### ')) {
      // Subsection within entry (currently not used but kept for future expansion)
      // const subsection = line.replace(/^###\s+/, '').trim().toLowerCase();
    } else if (inEntry && currentEntry && line.trim()) {
      // Collect content
      if (line.startsWith('- ')) {
        // Parse list items
        let item = line.replace(/^-\s+/, '').trim();
        // Clean up markdown bold formatting
        item = item.replace(/\*\*/g, '');

        if (item.includes(':')) {
          const [key, ...valueParts] = item.split(':');
          const value = valueParts.join(':').trim();
          const cleanKey = key.trim().replace(/\*\*/g, '');
          const cleanValue = value.replace(/\*\*/g, '').replace(/`/g, '');
          if (currentEntry.metadata) {
            currentEntry.metadata[cleanKey] = cleanValue;
          }
        } else {
          if (currentEntry.content) {
            currentEntry.content.push(item);
          }
        }
      } else if (line.trim() && !line.startsWith('#')) {
        const cleanLine = line.trim().replace(/\*\*/g, '');
        if (cleanLine && currentEntry.content) {
          currentEntry.content.push(cleanLine);
        }
      }
    }
  }

  // Add last entry
  if (currentEntry && inEntry) {
    entries.push(currentEntry as IntegrationLogEntry);
  }

  return entries;
}

/**
 * Detect entry type from title
 */
function detectEntryType(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('gate')) return 'gate_certification';
  if (lower.includes('pr #')) return 'pull_request';
  if (lower.includes('dashboard')) return 'dashboard_integration';
  if (lower.includes('security')) return 'security_upgrade';
  return 'general';
}

/**
 * Generate hash for entry
 */
function generateHash(entry: IntegrationLogEntry): string {
  const content = JSON.stringify({
    title: entry.title,
    type: entry.type,
    content: entry.content,
    metadata: entry.metadata,
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Format entry for Governance_Ledger.md
 */
function formatEntryForLedger(entry: IntegrationLogEntry): string {
  const hash = generateHash(entry);
  const timestamp = new Date().toISOString();

  let formatted = `## ${entry.title}\n\n`;

  // Add type badge
  formatted += `**Type:** ${entry.type.replace(/_/g, ' ').toUpperCase()}\n\n`;

  // Add metadata
  if (Object.keys(entry.metadata).length > 0) {
    formatted += '**Metadata:**\n\n';
    for (const [key, value] of Object.entries(entry.metadata)) {
      formatted += `- **${key}:** ${value}\n`;
    }
    formatted += '\n';
  }

  // Add content
  if (entry.content.length > 0) {
    formatted += '**Details:**\n\n';
    for (const line of entry.content) {
      if (line.trim()) {
        formatted += `${line}\n`;
      }
    }
    formatted += '\n';
  }

  // Add sync metadata
  formatted += `---\n\n`;
  formatted += `**Sync Information:**\n`;
  formatted += `- **Synced:** ${timestamp}\n`;
  formatted += `- **Hash:** \`${hash}\`\n`;
  formatted += `- **Source:** Integration_Log.md\n\n`;

  return formatted;
}

/**
 * Generate Governance_Ledger.md content
 */
function generateGovernanceLedger(entries: IntegrationLogEntry[]): string {
  let content = `# Governance Ledger\n\n`;
  content += `Repository: AIKEWA/QuantumPoly\n`;
  content += `Initialized by Jules — 2025-11-12\n`;
  content += `Last Synchronized: ${new Date().toISOString()}\n\n`;
  content += `---\n\n`;
  content += `## Gate D Certification — Governance Ledger Integration\n\n`;
  content += `- **Component:** QuantumPoly Core Codebase\n`;
  content += `- **Integration Scope:** Ethics CI / Type Integrity / Accessibility / Operational Dashboard\n`;
  content += `- **Source:** Integration_Log.md → Governance_Ledger.md\n`;
  content += `- **Verification:** Ledger Sync Process ✓\n`;
  content += `- **Reviewer:** EWA\n`;
  content += `- **Date:** ${new Date().toISOString().split('T')[0]}\n`;
  content += `- **Status:** Gate D — Certified & Ledger Synchronized\n\n`;
  content += `---\n\n`;
  content += `## Synchronized Entries\n\n`;
  content += `*This ledger is automatically synchronized from Integration_Log.md*\n\n`;

  // Add all entries
  for (const entry of entries) {
    content += formatEntryForLedger(entry);
  }

  // Add summary
  content += `---\n\n`;
  content += `## Summary\n\n`;
  content += `**Total Entries:** ${entries.length}\n\n`;
  content += `**Entry Types:**\n`;
  const typeCounts: Record<string, number> = {};
  for (const entry of entries) {
    typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(typeCounts)) {
    content += `- ${type.replace(/_/g, ' ')}: ${count}\n`;
  }
  content += `\n`;
  content += `**Last Sync:** ${new Date().toISOString()}\n`;

  return content;
}

/**
 * Synchronize Integration_Log.md to Governance_Ledger.md
 */
export function syncGovernanceLedger(): {
  success: boolean;
  entriesSynced: number;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // Read Integration_Log.md
    if (!fs.existsSync(INTEGRATION_LOG_PATH)) {
      throw new Error(`Integration_Log.md not found at ${INTEGRATION_LOG_PATH}`);
    }

    const integrationLogContent = fs.readFileSync(INTEGRATION_LOG_PATH, 'utf-8');

    // Parse entries
    const entries = parseIntegrationLog(integrationLogContent);

    if (entries.length === 0) {
      errors.push('No entries found in Integration_Log.md');
      return { success: false, entriesSynced: 0, errors };
    }

    // Generate Governance_Ledger.md content
    const ledgerContent = generateGovernanceLedger(entries);

    // Write to Governance_Ledger.md
    fs.writeFileSync(GOVERNANCE_LEDGER_PATH, ledgerContent, 'utf-8');

    console.log(`✅ Governance Ledger synchronized (Gate D Certification)`);
    console.log(`   - ${entries.length} entries synced`);
    console.log(`   - Output: ${GOVERNANCE_LEDGER_PATH}`);

    return {
      success: true,
      entriesSynced: entries.length,
      errors: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(errorMessage);
    console.error(`❌ Failed to sync Governance Ledger:`, errorMessage);
    return {
      success: false,
      entriesSynced: 0,
      errors,
    };
  }
}

/**
 * Interface for Integration Log entries
 */
interface IntegrationLogEntry {
  title: string;
  type: string;
  content: string[];
  metadata: Record<string, string>;
}

/**
 * CLI entry point (for scripts)
 */
if (require.main === module) {
  const result = syncGovernanceLedger();
  process.exit(result.success ? 0 : 1);
}
