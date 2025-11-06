#!/usr/bin/env node

/**
 * Weekly Governance Summary Generator
 * 
 * Aggregates 7 daily reports into weekly trend analysis with statistical metrics.
 * 
 * Block 10.7 — Daily Governance Reports
 * 
 * Usage:
 *   node scripts/weekly-governance-summary.mjs [options]
 * 
 * Options:
 *   --week=<YYYY-WNN>     ISO week number (default: current week)
 *   --output=<path>       Output file path (default: reports/governance-summary.json)
 *   --verbose             Detailed output
 * 
 * Exit Codes:
 *   0 - Summary generated successfully
 *   1 - Summary generated with warnings
 *   2 - Failed to generate summary
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command-line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');

const weekArg = args.find(arg => arg.startsWith('--week='));
const outputArg = args.find(arg => arg.startsWith('--output='));
const outputPath = outputArg 
  ? outputArg.split('=')[1]
  : 'reports/governance-summary.json';

/**
 * Log message if verbose mode enabled
 */
function log(message) {
  if (verbose) {
    console.log(message);
  }
}

/**
 * Compute SHA-256 hash
 */
function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get ISO week number for a date
 */
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Get start and end dates for an ISO week
 */
function getWeekDates(isoWeek) {
  const [year, weekStr] = isoWeek.split('-W');
  const weekNum = parseInt(weekStr, 10);
  
  // January 4th is always in week 1
  const jan4 = new Date(parseInt(year, 10), 0, 4);
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (weekNum - 1) * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0]
  };
}

/**
 * Get all dates in a week range
 */
function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Read JSON file safely
 */
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Warning: Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Calculate statistical metrics
 */
function calculateStats(values) {
  if (values.length === 0) {
    return { mean: null, stddev: null, min: null, max: null };
  }
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);
  
  return {
    mean: Math.round(mean * 100) / 100,
    stddev: Math.round(stddev * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

/**
 * Detect anomalies (values beyond 2σ from mean)
 */
function detectAnomalies(dailyReports) {
  const anomalies = [];
  
  // Collect all EII values
  const eiiValues = dailyReports
    .map(r => r.report?.ethical_metrics?.eii_current)
    .filter(v => v !== null && v !== undefined);
  
  if (eiiValues.length < 3) {
    return anomalies; // Not enough data for anomaly detection
  }
  
  const stats = calculateStats(eiiValues);
  const threshold = 2 * stats.stddev;
  
  // Check each daily report
  dailyReports.forEach(({ date, report }) => {
    if (!report) return;
    
    // Check for degraded/critical state
    if (report.system_health?.status === 'degraded' || report.system_health?.status === 'attention_required') {
      anomalies.push({
        date,
        type: report.system_health.status === 'attention_required' ? 'critical_state' : 'degraded_state',
        reason: `System entered ${report.system_health.status} state`,
        resolved: false // Would need to check subsequent days
      });
    }
    
    // Check for EII anomalies
    const eii = report.ethical_metrics?.eii_current;
    if (eii !== null && eii !== undefined && stats.mean !== null) {
      const deviation = Math.abs(eii - stats.mean);
      if (deviation > threshold) {
        anomalies.push({
          date,
          type: 'data_quality_issue',
          reason: `EII value ${eii} deviates ${Math.round(deviation)} points from weekly mean ${stats.mean}`,
          resolved: true
        });
      }
    }
    
    // Check for integrity issues
    if (report.integrity_status?.open_issues > 5) {
      anomalies.push({
        date,
        type: 'integrity_break',
        reason: `${report.integrity_status.open_issues} integrity issues detected`,
        resolved: report.integrity_status.pending_reviews === 0
      });
    }
    
    // Check for performance degradation
    if (report.system_health?.response_time_avg_ms > 3000) {
      anomalies.push({
        date,
        type: 'performance_degradation',
        reason: `Average response time ${report.system_health.response_time_avg_ms}ms exceeds threshold`,
        resolved: false
      });
    }
  });
  
  return anomalies;
}

/**
 * Generate recommendations based on weekly trends
 */
function generateRecommendations(dailyReports, stats, anomalies) {
  const recommendations = [];
  
  // Check EII trend
  if (stats.eii?.mean !== null && stats.eii?.mean < 80) {
    recommendations.push({
      priority: 'high',
      action: 'Review ethical integrity processes',
      rationale: `Weekly average EII (${stats.eii.mean}) is below target threshold of 80`
    });
  }
  
  // Check for recurring anomalies
  const recurringAnomalies = anomalies.filter(a => !a.resolved);
  if (recurringAnomalies.length > 2) {
    recommendations.push({
      priority: 'high',
      action: 'Investigate recurring system issues',
      rationale: `${recurringAnomalies.length} unresolved anomalies detected this week`
    });
  }
  
  // Check trust score trend
  if (stats.trust_score?.mean !== null && stats.trust_score?.mean < 0.5) {
    recommendations.push({
      priority: 'medium',
      action: 'Improve community trust mechanisms',
      rationale: `Average trust score (${stats.trust_score.mean}) indicates low confidence`
    });
  }
  
  // Check response time
  if (stats.response_time?.mean > 2000) {
    recommendations.push({
      priority: 'medium',
      action: 'Optimize API performance',
      rationale: `Average response time (${stats.response_time.mean}ms) exceeds 2-second target`
    });
  }
  
  // Check data completeness
  const avgCompleteness = dailyReports.reduce((sum, r) => 
    sum + (r.report?.data_quality?.completeness_score || 0), 0) / dailyReports.length;
  
  if (avgCompleteness < 0.75) {
    recommendations.push({
      priority: 'low',
      action: 'Improve data collection coverage',
      rationale: `Average data completeness (${Math.round(avgCompleteness * 100)}%) below 75% target`
    });
  }
  
  return recommendations;
}

/**
 * Main summary generation function
 */
async function main() {
  console.log('\n📊 Weekly Governance Summary Generator');
  console.log('========================================\n');
  
  // Determine week to process
  const currentWeek = getISOWeek(new Date());
  const targetWeek = weekArg ? weekArg.split('=')[1] : currentWeek;
  
  console.log(`Target Week: ${targetWeek}`);
  console.log(`Verbose: ${verbose ? 'Yes' : 'No'}`);
  console.log('');
  
  const { start, end } = getWeekDates(targetWeek);
  const dates = getDateRange(start, end);
  
  log(`Week period: ${start} to ${end}`);
  log(`Dates to process: ${dates.join(', ')}`);
  log('');
  
  // Load daily reports
  console.log('📋 Loading daily reports...\n');
  
  const dailyReports = [];
  const reportFiles = [];
  
  for (const date of dates) {
    const reportPath = `reports/monitoring-${date}.json`;
    const report = readJSON(reportPath);
    
    if (report) {
      dailyReports.push({ date, report });
      reportFiles.push(reportPath);
      console.log(`  ✅ ${date}: Report loaded`);
    } else {
      console.log(`  ⚠️  ${date}: Report not found`);
    }
  }
  
  console.log('');
  
  if (dailyReports.length === 0) {
    console.error('❌ No daily reports found for the specified week\n');
    process.exit(2);
  }
  
  console.log(`Loaded ${dailyReports.length}/7 reports\n`);
  
  // Calculate system health summary
  log('Calculating system health summary...');
  
  const healthyDays = dailyReports.filter(r => r.report.system_health?.status === 'healthy').length;
  const degradedDays = dailyReports.filter(r => r.report.system_health?.status === 'degraded').length;
  const criticalDays = dailyReports.filter(r => r.report.system_health?.status === 'attention_required').length;
  
  const responseTimes = dailyReports
    .map(r => r.report.system_health?.response_time_avg_ms)
    .filter(v => v !== null && v !== undefined);
  
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;
  
  // Calculate integrity summary
  log('Calculating integrity summary...');
  
  const totalVerifications = dailyReports.filter(r => r.report.integrity_status).length;
  const autoRepairs = dailyReports.reduce((sum, r) => 
    sum + (r.report.integrity_status?.auto_repaired || 0), 0);
  const pendingReviews = dailyReports.map(r => r.report.integrity_status?.pending_reviews || 0);
  const avgPendingReviews = pendingReviews.length > 0
    ? Math.round((pendingReviews.reduce((a, b) => a + b, 0) / pendingReviews.length) * 10) / 10
    : 0;
  
  // Calculate ethical metrics summary
  log('Calculating ethical metrics summary...');
  
  const eiiValues = dailyReports
    .map(r => r.report.ethical_metrics?.eii_current)
    .filter(v => v !== null && v !== undefined);
  
  const trustScores = dailyReports
    .map(r => r.report.ethical_metrics?.trust_score_avg)
    .filter(v => v !== null && v !== undefined);
  
  const eiiStats = calculateStats(eiiValues);
  const trustStats = calculateStats(trustScores);
  
  // Determine trust trend
  let trustTrend = 'stable';
  if (trustScores.length >= 2) {
    const firstHalf = trustScores.slice(0, Math.floor(trustScores.length / 2));
    const secondHalf = trustScores.slice(Math.floor(trustScores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) trustTrend = 'improving';
    else if (change < -5) trustTrend = 'declining';
  }
  
  // Calculate feedback summary
  log('Calculating feedback summary...');
  
  const newSubmissions = dailyReports.reduce((sum, r) => 
    sum + (r.report.feedback_summary?.new_submissions_24h || 0), 0);
  const resolvedItems = dailyReports.reduce((sum, r) => 
    sum + (r.report.feedback_summary?.resolved_items || 0), 0);
  const lastReport = dailyReports[dailyReports.length - 1];
  const openItemsEOW = lastReport?.report.feedback_summary?.open_items || 0;
  
  // Detect anomalies
  log('Detecting anomalies...');
  const anomalies = detectAnomalies(dailyReports);
  
  // Generate recommendations
  log('Generating recommendations...');
  const stats = {
    eii: eiiStats,
    trust_score: trustStats,
    response_time: { mean: avgResponseTime }
  };
  const recommendations = generateRecommendations(dailyReports, stats, anomalies);
  
  // Build summary
  const timestamp = new Date().toISOString();
  const summaryId = `weekly-${targetWeek}`;
  
  const summary = {
    summary_id: summaryId,
    timestamp,
    week: targetWeek,
    period: { start, end },
    daily_reports_included: dailyReports.length,
    hash: '', // Will be computed below
    verified: true,
    system_health_summary: {
      healthy_days: healthyDays,
      degraded_days: degradedDays,
      critical_days: criticalDays,
      uptime_percentage: Math.round((healthyDays / dailyReports.length) * 10000) / 100,
      avg_response_time_ms: avgResponseTime
    },
    integrity_summary: {
      total_verifications: totalVerifications,
      auto_repairs: autoRepairs,
      pending_reviews_avg: avgPendingReviews,
      ledger_health_stability: degradedDays === 0 && criticalDays === 0 ? 'stable' : 'unstable'
    },
    ethical_metrics_summary: {
      eii_mean: eiiStats.mean,
      eii_stddev: eiiStats.stddev,
      eii_min: eiiStats.min,
      eii_max: eiiStats.max,
      trust_score_mean: trustStats.mean,
      trust_score_stddev: trustStats.stddev,
      trust_trend: trustTrend
    },
    feedback_summary: {
      new_submissions: newSubmissions,
      resolved_items: resolvedItems,
      open_items_eow: openItemsEOW,
      avg_resolution_time_days: null // Would need additional tracking
    },
    anomalies,
    recommendations,
    daily_report_files: reportFiles
  };
  
  // Compute hash (exclude hash field itself)
  const summaryForHash = { ...summary };
  delete summaryForHash.hash;
  summary.hash = sha256(JSON.stringify(summaryForHash, Object.keys(summaryForHash).sort()));
  
  // Save summary
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
  
  console.log(`\n📄 Summary saved: ${outputPath}\n`);
  
  // Summary output
  console.log('✅ Weekly summary complete\n');
  console.log(`Summary ID: ${summaryId}`);
  console.log(`Period: ${start} to ${end}`);
  console.log(`Reports: ${dailyReports.length}/7`);
  console.log(`Healthy Days: ${healthyDays}/${dailyReports.length}`);
  console.log(`Anomalies: ${anomalies.length}`);
  console.log(`Recommendations: ${recommendations.length}`);
  console.log(`Hash: ${summary.hash.slice(0, 16)}...`);
  console.log('');
  
  // Exit with appropriate code
  if (dailyReports.length < 7) {
    console.log('⚠️  Summary generated with incomplete data (< 7 reports)\n');
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});

