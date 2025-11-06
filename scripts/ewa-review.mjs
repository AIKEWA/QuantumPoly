#!/usr/bin/env node
/**
 * @fileoverview EWA v2 Review Queue CLI
 * @see BLOCK9.5_ETHICAL_AUTONOMY.md
 *
 * Interactive CLI for reviewing and approving critical insights
 * Usage: node scripts/ewa-review.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const REVIEW_QUEUE_PATH = path.join(projectRoot, 'governance/ewa/review-queue.jsonl');

/**
 * Read review queue
 */
function getReviewQueue() {
  if (!fs.existsSync(REVIEW_QUEUE_PATH)) {
    return [];
  }
  
  const content = fs.readFileSync(REVIEW_QUEUE_PATH, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  
  return lines.map(line => JSON.parse(line));
}

/**
 * Get pending reviews
 */
function getPendingReviews() {
  const queue = getReviewQueue();
  return queue.filter(entry => entry.status === 'pending');
}

/**
 * Update review status
 */
function updateReviewStatus(entryId, status, reviewedBy, notes) {
  const queue = getReviewQueue();
  
  const entryIndex = queue.findIndex(e => e.entry_id === entryId);
  if (entryIndex === -1) {
    console.error(`❌ Review entry ${entryId} not found`);
    return false;
  }
  
  queue[entryIndex] = {
    ...queue[entryIndex],
    status,
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
    notes,
  };
  
  // Write back
  const newContent = queue.map(e => JSON.stringify(e)).join('\n') + '\n';
  fs.writeFileSync(REVIEW_QUEUE_PATH, newContent, 'utf-8');
  
  console.log(`✅ Review entry ${entryId} ${status}`);
  return true;
}

/**
 * Display review entry
 */
function displayReviewEntry(entry, index, total) {
  console.log('\n' + '='.repeat(80));
  console.log(`Review ${index + 1} of ${total}`);
  console.log('='.repeat(80));
  console.log(`\nEntry ID: ${entry.entry_id}`);
  console.log(`Timestamp: ${entry.timestamp}`);
  console.log(`\n--- Insight ---`);
  console.log(`ID: ${entry.insight.insight_id}`);
  console.log(`Severity: ${entry.insight.severity.toUpperCase()} (score: ${entry.insight.severity_score.toFixed(2)})`);
  console.log(`Confidence: ${(entry.insight.confidence * 100).toFixed(0)}%`);
  console.log(`Source: ${entry.insight.source}`);
  console.log(`\nDescription:`);
  console.log(`  ${entry.insight.description}`);
  console.log(`\nRecommended Action:`);
  console.log(`  ${entry.insight.recommended_action}`);
  console.log(`\nEvidence:`);
  console.log(JSON.stringify(entry.insight.evidence, null, 2));
  console.log('\n' + '='.repeat(80));
}

/**
 * Prompt user for input
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Main review function
 */
async function runReview() {
  console.log('🔍 EWA v2 Review Queue');
  console.log('=====================\n');
  
  const pendingReviews = getPendingReviews();
  
  if (pendingReviews.length === 0) {
    console.log('✅ No pending reviews. All insights have been processed.\n');
    return;
  }
  
  console.log(`Found ${pendingReviews.length} pending review(s)\n`);
  
  for (let i = 0; i < pendingReviews.length; i++) {
    const entry = pendingReviews[i];
    
    displayReviewEntry(entry, i, pendingReviews.length);
    
    const action = await prompt('\nAction? [a]pprove / [r]eject / [s]kip / [q]uit: ');
    
    if (action.toLowerCase() === 'q') {
      console.log('\n👋 Exiting review process\n');
      break;
    }
    
    if (action.toLowerCase() === 's') {
      console.log('⏭️  Skipped\n');
      continue;
    }
    
    if (action.toLowerCase() === 'a') {
      const reviewer = await prompt('Reviewer name: ');
      const notes = await prompt('Notes (optional): ');
      
      updateReviewStatus(entry.entry_id, 'approved', reviewer, notes || undefined);
      console.log('✅ Approved\n');
      
    } else if (action.toLowerCase() === 'r') {
      const reviewer = await prompt('Reviewer name: ');
      const notes = await prompt('Rejection reason: ');
      
      updateReviewStatus(entry.entry_id, 'rejected', reviewer, notes);
      console.log('❌ Rejected\n');
      
    } else {
      console.log('❓ Invalid action. Skipping.\n');
    }
  }
  
  console.log('✅ Review session complete\n');
}

// Run review
runReview().catch(error => {
  console.error('❌ Review failed:', error);
  process.exit(1);
});

