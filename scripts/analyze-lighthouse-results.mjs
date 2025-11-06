#!/usr/bin/env node
/**
 * Analyze Lighthouse Results for Block 10.8
 * Extracts accessibility violations from all Lighthouse JSON reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '..', 'reports', 'lighthouse', 'block10.8');

function extractAccessibilityViolations(lhr) {
  const violations = [];
  const a11yAudits = lhr.categories?.accessibility?.auditRefs ?? [];
  
  for (const auditRef of a11yAudits) {
    const audit = lhr.audits[auditRef.id];
    if (audit && audit.score !== null && audit.score < 1) {
      violations.push({
        id: auditRef.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        impact: auditRef.weight >= 7 ? 'serious' : auditRef.weight >= 3 ? 'moderate' : 'minor',
        details: audit.details?.items?.length ?? 0,
        items: audit.details?.items ?? []
      });
    }
  }
  
  return violations.sort((a, b) => a.score - b.score);
}

function analyzeLighthouseReport(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lhr = JSON.parse(content);
  
  const accessibilityScore = Math.round((lhr.categories?.accessibility?.score ?? 0) * 100);
  const performanceScore = Math.round((lhr.categories?.performance?.score ?? 0) * 100);
  
  const violations = extractAccessibilityViolations(lhr);
  
  return {
    url: lhr.requestedUrl || lhr.finalUrl,
    fetchTime: lhr.fetchTime,
    scores: {
      accessibility: accessibilityScore,
      performance: performanceScore
    },
    violations,
    lighthouseVersion: lhr.lighthouseVersion,
    axeCoreVersion: lhr.environment?.credits?.['axe-core'] || 'unknown'
  };
}

function main() {
  console.log('Analyzing Lighthouse reports for Block 10.8...\n');
  
  if (!fs.existsSync(REPORTS_DIR)) {
    console.error(`Reports directory not found: ${REPORTS_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('summary'));
  
  if (files.length === 0) {
    console.error('No Lighthouse JSON reports found.');
    process.exit(1);
  }
  
  const results = [];
  const summary = {
    totalReports: files.length,
    averageA11yScore: 0,
    totalViolations: 0,
    violationsBySeverity: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    },
    pagesBelowThreshold: []
  };
  
  for (const file of files) {
    const filepath = path.join(REPORTS_DIR, file);
    try {
      const result = analyzeLighthouseReport(filepath);
      results.push({
        file,
        ...result
      });
      
      summary.averageA11yScore += result.scores.accessibility;
      summary.totalViolations += result.violations.length;
      
      result.violations.forEach(v => {
        summary.violationsBySeverity[v.impact]++;
      });
      
      if (result.scores.accessibility < 95) {
        summary.pagesBelowThreshold.push({
          file,
          url: result.url,
          score: result.scores.accessibility
        });
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  summary.averageA11yScore = Math.round(summary.averageA11yScore / files.length);
  
  // Output summary
  console.log('═══════════════════════════════════════');
  console.log('  Block 10.8 Lighthouse Analysis');
  console.log('═══════════════════════════════════════\n');
  
  console.log(`Total Reports Analyzed: ${summary.totalReports}`);
  console.log(`Average A11y Score: ${summary.averageA11yScore}/100`);
  console.log(`Total Violations: ${summary.totalViolations}\n`);
  
  console.log('Violations by Severity:');
  console.log(`  Critical: ${summary.violationsBySeverity.critical}`);
  console.log(`  Serious:  ${summary.violationsBySeverity.serious}`);
  console.log(`  Moderate: ${summary.violationsBySeverity.moderate}`);
  console.log(`  Minor:    ${summary.violationsBySeverity.minor}\n`);
  
  if (summary.pagesBelowThreshold.length > 0) {
    console.log(`⚠️  Pages Below 95 Threshold: ${summary.pagesBelowThreshold.length}`);
    summary.pagesBelowThreshold.forEach(p => {
      console.log(`   - ${p.file}: ${p.score}/100`);
    });
    console.log('');
  }
  
  // Save detailed results
  const outputFile = path.join(REPORTS_DIR, 'lighthouse-analysis-summary.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary,
    results
  }, null, 2));
  
  console.log(`✅ Detailed analysis saved to: ${outputFile}\n`);
}

main();


