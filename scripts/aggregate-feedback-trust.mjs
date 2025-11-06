#!/usr/bin/env node

/**
 * Feedback Trust Aggregation Script (Block 10.6)
 * 
 * Processes feedback submissions and computes trust trend metrics:
 * - 7-day Exponential Moving Average (EMA)
 * - 30-day mean trust score
 * - Topic distribution histogram
 * - Submission counts
 * 
 * Output: governance/feedback/aggregates/trust-trend.json
 * 
 * Usage:
 *   node scripts/aggregate-feedback-trust.mjs
 *   npm run feedback:aggregate-trust
 * 
 * @see BLOCK10.6_FEEDBACK_AND_TRUST.md
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration
const FEEDBACK_DIR = './governance/feedback';
const AGGREGATES_DIR = './governance/feedback/aggregates';
const OUTPUT_FILE = path.join(AGGREGATES_DIR, 'trust-trend.json');

/**
 * Parse JSONL file and return entries
 */
function parseJSONL(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (error) {
      console.warn(`   ⚠️  Failed to parse line: ${line.substring(0, 50)}...`);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Get all feedback files from the last N days
 */
function getFeedbackFiles(days = 30) {
  const now = new Date();
  const files = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const filePath = path.join(FEEDBACK_DIR, `feedback-${dateStr}.jsonl`);
    if (fs.existsSync(filePath)) {
      files.push({
        path: filePath,
        date: dateStr,
        daysAgo: i,
      });
    }
  }
  
  return files;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * 
 * @param values - Array of values (most recent first)
 * @param period - Period for EMA (e.g., 7 for 7-day)
 * @returns EMA value
 */
function calculateEMA(values, period) {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  
  // EMA multiplier: 2 / (period + 1)
  const multiplier = 2 / (period + 1);
  
  // Start with simple average of first 'period' values
  const initialValues = values.slice(-Math.min(period, values.length));
  let ema = initialValues.reduce((sum, val) => sum + val, 0) / initialValues.length;
  
  // Calculate EMA for remaining values (from oldest to newest)
  const remainingValues = values.slice(0, -Math.min(period, values.length)).reverse();
  for (const value of remainingValues) {
    ema = (value * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

/**
 * Calculate simple mean
 */
function calculateMean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Process feedback entries and compute metrics
 */
function processEntries(files) {
  console.log(`\n📊 Processing ${files.length} feedback files...`);
  
  let allEntries = [];
  let totalSubmissions = 0;
  let optedInCount = 0;
  const topicCounts = {};
  const dailyScores = {}; // date -> array of scores
  
  // Parse all files
  for (const file of files) {
    const entries = parseJSONL(file.path);
    console.log(`   📄 ${file.date}: ${entries.length} entries`);
    
    for (const entry of entries) {
      totalSubmissions++;
      
      // Count topics
      const topic = entry.topic || entry.type || 'other';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      
      // Collect trust scores
      if (entry.trust_score !== undefined && entry.trust_score !== null) {
        optedInCount++;
        
        // Group by date for daily averages
        if (!dailyScores[file.date]) {
          dailyScores[file.date] = [];
        }
        dailyScores[file.date].push(entry.trust_score);
        
        allEntries.push({
          date: file.date,
          daysAgo: file.daysAgo,
          score: entry.trust_score,
        });
      }
    }
  }
  
  console.log(`\n   ✅ Total submissions: ${totalSubmissions}`);
  console.log(`   ✅ With trust scores: ${optedInCount}`);
  
  // Calculate daily averages (most recent first)
  const dailyAverages = Object.entries(dailyScores)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, scores]) => ({
      date,
      average: calculateMean(scores),
      count: scores.length,
    }));
  
  // Extract scores for EMA calculation (most recent first)
  const dailyScoreValues = dailyAverages.map(d => d.average);
  
  // Calculate metrics
  const ema7d = dailyScoreValues.length >= 1 ? calculateEMA(dailyScoreValues, 7) : 0;
  const allScores = allEntries.map(e => e.score);
  const mean30d = calculateMean(allScores);
  
  // Get period bounds
  const dates = files.map(f => f.date).sort();
  const periodStart = dates[dates.length - 1] || new Date().toISOString().split('T')[0];
  const periodEnd = dates[0] || new Date().toISOString().split('T')[0];
  
  return {
    generated_at: new Date().toISOString(),
    period: {
      start: periodStart,
      end: periodEnd,
      days: files.length,
    },
    trust_metrics: {
      ema_7d: Math.round(ema7d * 100) / 100,
      mean_30d: Math.round(mean30d * 100) / 100,
      total_submissions: totalSubmissions,
      opted_in_count: optedInCount,
      opt_in_rate: totalSubmissions > 0 ? Math.round((optedInCount / totalSubmissions) * 100) / 100 : 0,
    },
    topic_distribution: topicCounts,
    daily_averages: dailyAverages,
    version: '1.0.0',
  };
}

/**
 * Write aggregate data to file
 */
function writeAggregate(data) {
  // Ensure directory exists
  if (!fs.existsSync(AGGREGATES_DIR)) {
    fs.mkdirSync(AGGREGATES_DIR, { recursive: true });
  }
  
  // Write JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  
  console.log(`\n💾 Aggregate written to: ${OUTPUT_FILE}`);
  
  // Compute checksum
  const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
  const checksum = crypto.createHash('sha256').update(content).digest('hex');
  
  // Write checksum sidecar
  const checksumFile = OUTPUT_FILE + '.sha256';
  fs.writeFileSync(checksumFile, `${checksum}  trust-trend.json\n`, 'utf-8');
  
  console.log(`   🔒 Checksum: ${checksum.substring(0, 16)}...`);
  console.log(`   📝 Sidecar: ${checksumFile}`);
}

/**
 * Display summary
 */
function displaySummary(data) {
  console.log('\n📈 Trust Trend Summary');
  console.log('═'.repeat(80));
  console.log(`   Period:            ${data.period.start} to ${data.period.end} (${data.period.days} days)`);
  console.log(`   Total Submissions: ${data.trust_metrics.total_submissions}`);
  console.log(`   Trust Opt-In:      ${data.trust_metrics.opted_in_count} (${(data.trust_metrics.opt_in_rate * 100).toFixed(1)}%)`);
  console.log(`   7-Day EMA:         ${data.trust_metrics.ema_7d.toFixed(2)}`);
  console.log(`   30-Day Mean:       ${data.trust_metrics.mean_30d.toFixed(2)}`);
  console.log('\n📊 Topic Distribution:');
  
  const sortedTopics = Object.entries(data.topic_distribution)
    .sort(([, a], [, b]) => b - a);
  
  for (const [topic, count] of sortedTopics) {
    const percentage = (count / data.trust_metrics.total_submissions * 100).toFixed(1);
    console.log(`   ${topic.padEnd(15)} ${count.toString().padStart(4)} (${percentage}%)`);
  }
  
  console.log('═'.repeat(80));
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔄 Feedback Trust Aggregation');
  console.log('═'.repeat(80));
  
  try {
    // Get feedback files from last 30 days
    const files = getFeedbackFiles(30);
    
    if (files.length === 0) {
      console.log('\n   ⚠️  No feedback files found in the last 30 days');
      console.log('   💡 Feedback files should be at: governance/feedback/feedback-YYYY-MM-DD.jsonl');
      process.exit(0);
    }
    
    // Process entries and compute metrics
    const aggregate = processEntries(files);
    
    // Write to file
    writeAggregate(aggregate);
    
    // Display summary
    displaySummary(aggregate);
    
    console.log('\n✅ Aggregation Complete\n');
    
  } catch (error) {
    console.error('\n❌ Aggregation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute
main();

