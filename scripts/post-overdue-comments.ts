#!/usr/bin/env ts-node
/**
 * Post Overdue Review Comments to GitHub PRs
 *
 * Reads validation_output.json and posts actionable comments to PRs
 * when policy reviews are overdue.
 *
 * Features:
 * - Groups overdue items by owner
 * - Posts single threaded comment with checkboxes
 * - Idempotent: updates existing comments instead of creating duplicates
 * - Rate-limit aware with exponential backoff
 *
 * Usage:
 *   ts-node scripts/post-overdue-comments.ts
 *
 * Environment Variables:
 *   GITHUB_TOKEN: GitHub API token (required)
 *   GITHUB_REPOSITORY: Repository in format 'owner/repo' (required)
 *   PR_NUMBER: Pull request number (required)
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface OverdueItem {
  policy: string;
  locale: string;
  slug: string;
  owner: string;
  title: string;
  lastReviewed: string;
  nextReviewDue: string;
  daysOverdue: number;
  daysSinceReview: number;
}

interface SchemaError {
  policy: string;
  locale: string;
  slug: string;
  errors: string[];
}

interface ValidationOutput {
  overdue: OverdueItem[];
  schemaErrors: SchemaError[];
  timestamp: string;
  totalPolicies: number;
  overdueCount: number;
  errorCount: number;
}

interface GroupedOverdue {
  owner: string;
  items: OverdueItem[];
}

const VALIDATION_FILE = path.join(process.cwd(), 'validation_output.json');
const COMMENT_IDENTIFIER = '<!-- policy-review-overdue-bot -->';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Get required environment variables
 */
function getEnvVars(): { token: string; repo: string; prNumber: number } {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;

  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  if (!repo) {
    throw new Error('GITHUB_REPOSITORY environment variable is required');
  }

  if (!prNumber) {
    throw new Error('PR_NUMBER environment variable is required');
  }

  return {
    token,
    repo,
    prNumber: parseInt(prNumber, 10),
  };
}

/**
 * Generate content hash for idempotency
 */
function generateContentHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Group overdue items by owner
 */
function groupByOwner(items: OverdueItem[]): GroupedOverdue[] {
  const groups = new Map<string, OverdueItem[]>();

  for (const item of items) {
    const owner = item.owner;
    if (!groups.has(owner)) {
      groups.set(owner, []);
    }
    groups.get(owner)!.push(item);
  }

  return Array.from(groups.entries()).map(([owner, items]) => ({ owner, items }));
}

/**
 * Generate comment body
 */
function generateCommentBody(groups: GroupedOverdue[], timestamp: string): string {
  const lines: string[] = [
    COMMENT_IDENTIFIER,
    '',
    '## ⚠️ Policy Review Overdue',
    '',
    `${groups.reduce((sum, g) => sum + g.items.length, 0)} policy document(s) have overdue reviews.`,
    '',
    '**Action Required:** Please review and update the following policy documents. Once reviewed, update the `lastReviewed` and `nextReviewDue` fields in the frontmatter.',
    '',
  ];

  for (const group of groups) {
    lines.push(`### ${group.owner}`);
    lines.push('');

    for (const item of group.items) {
      const urgency = item.daysOverdue > 30 ? '🔴' : item.daysOverdue > 7 ? '🟡' : '🟢';
      lines.push(`${urgency} **\`${item.policy}\`** — ${item.title}`);
      lines.push(`  - Last reviewed: ${item.lastReviewed} (${item.daysSinceReview} days ago)`);
      lines.push(`  - Review due: ${item.nextReviewDue} (${item.daysOverdue} days overdue)`);
      lines.push(`  - [ ] Review completed`);
      lines.push('');
    }
  }

  lines.push('---');
  lines.push(`*Last checked: ${new Date(timestamp).toUTCString()}*`);
  lines.push('');
  lines.push(`*Content hash: \`${generateContentHash(lines.join('\n'))}\`*`);

  return lines.join('\n');
}

/**
 * Sleep for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make GitHub API request with retry and backoff
 */
async function githubRequest(url: string, options: RequestInit, retries = 0): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Handle rate limiting
    if (response.status === 429 || response.status === 403) {
      if (retries < MAX_RETRIES) {
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, retries);
        console.warn(
          `⏳ Rate limited. Retrying in ${backoffTime}ms... (attempt ${retries + 1}/${MAX_RETRIES})`,
        );
        await sleep(backoffTime);
        return githubRequest(url, options, retries + 1);
      }
      throw new Error('Rate limit exceeded after retries');
    }

    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, retries);
      console.warn(
        `⚠️  Request failed. Retrying in ${backoffTime}ms... (attempt ${retries + 1}/${MAX_RETRIES})`,
      );
      await sleep(backoffTime);
      return githubRequest(url, options, retries + 1);
    }
    throw error;
  }
}

/**
 * Find existing bot comment
 */
async function findExistingComment(
  token: string,
  repo: string,
  prNumber: number,
): Promise<number | null> {
  const [owner, repoName] = repo.split('/');
  const url = `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;

  const response = await githubRequest(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'QuantumPoly-Policy-Bot',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
    return null;
  }

  const comments = await response.json();

  for (const comment of comments) {
    if (comment.body && comment.body.includes(COMMENT_IDENTIFIER)) {
      return comment.id;
    }
  }

  return null;
}

/**
 * Post or update comment
 */
async function postComment(
  token: string,
  repo: string,
  prNumber: number,
  body: string,
  existingCommentId: number | null,
): Promise<void> {
  const [owner, repoName] = repo.split('/');

  let url: string;
  let method: string;

  if (existingCommentId) {
    url = `https://api.github.com/repos/${owner}/${repoName}/issues/comments/${existingCommentId}`;
    method = 'PATCH';
    console.log('🔄 Updating existing comment...');
  } else {
    url = `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;
    method = 'POST';
    console.log('💬 Creating new comment...');
  }

  const response = await githubRequest(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'QuantumPoly-Policy-Bot',
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to post comment: ${response.status} ${response.statusText}\n${errorText}`,
    );
  }

  const result = await response.json();
  console.log(`✅ Comment posted: ${result.html_url}`);
}

/**
 * Main function
 */
async function main() {
  console.log('📝 Policy Overdue Comment Bot\n');

  // Check for validation output
  if (!fs.existsSync(VALIDATION_FILE)) {
    console.error('❌ validation_output.json not found. Run validate-policy-reviews.ts first.');
    process.exit(1);
  }

  // Read validation output
  const validationData: ValidationOutput = JSON.parse(fs.readFileSync(VALIDATION_FILE, 'utf-8'));

  // Check if there are overdue items
  if (validationData.overdue.length === 0) {
    console.log('✅ No overdue policy reviews. Skipping comment.');
    process.exit(0);
  }

  // Get environment variables
  const { token, repo, prNumber } = getEnvVars();

  // Group by owner
  const groups = groupByOwner(validationData.overdue);

  // Generate comment body
  const commentBody = generateCommentBody(groups, validationData.timestamp);

  // Find existing comment
  const existingCommentId = await findExistingComment(token, repo, prNumber);

  // Post or update comment
  await postComment(token, repo, prNumber, commentBody, existingCommentId);

  console.log(`\n✅ Successfully posted overdue review comment to PR #${prNumber}`);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

export { generateCommentBody, groupByOwner, generateContentHash };
