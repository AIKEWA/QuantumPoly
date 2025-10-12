#!/usr/bin/env node

/**
 * Vercel Deployment Health Checker
 * 
 * Verifies that the latest Vercel deployment for the current branch is healthy
 * and outputs the preview URL for downstream QA processes.
 * 
 * Exit codes:
 * - 0: Deployment is ready/building (healthy)
 * - 1: Deployment failed, cancelled, or error occurred
 * 
 * Usage:
 *   node scripts/verify-vercel.mjs
 *   PREVIEW_URL="$(node scripts/verify-vercel.mjs)"
 */

import { execSync } from 'child_process';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

/**
 * Get current git branch name
 */
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error('❌ Failed to get current git branch:', error.message);
    process.exit(1);
  }
}

/**
 * Fetch deployments from Vercel API
 */
async function fetchDeployments(branch) {
  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN environment variable is required');
    process.exit(1);
  }

  if (!VERCEL_PROJECT_ID) {
    console.error('❌ VERCEL_PROJECT_ID environment variable is required');
    process.exit(1);
  }

  const url = new URL('https://api.vercel.com/v6/deployments');
  url.searchParams.set('projectId', VERCEL_PROJECT_ID);
  url.searchParams.set('limit', '10');
  url.searchParams.set('target', 'preview');

  if (VERCEL_TEAM_ID) {
    url.searchParams.set('teamId', VERCEL_TEAM_ID);
  }

  const headers = {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter deployments for the current branch
    const branchDeployments = data.deployments.filter(deployment => {
      return deployment.meta?.githubCommitRef === branch || 
             deployment.gitSource?.ref === branch;
    });

    return branchDeployments;
  } catch (error) {
    console.error('❌ Failed to fetch Vercel deployments:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution function
 */
async function main() {
  const branch = getCurrentBranch();
  console.error(`🔍 Checking Vercel deployment health for branch: ${branch}`);

  const deployments = await fetchDeployments(branch);

  if (deployments.length === 0) {
    console.error(`❌ No deployments found for branch: ${branch}`);
    process.exit(1);
  }

  // Get the most recent deployment
  const latestDeployment = deployments[0];
  const { state, url, createdAt, uid } = latestDeployment;

  console.error(`📋 Latest deployment: ${uid}`);
  console.error(`📅 Created: ${new Date(createdAt).toISOString()}`);
  console.error(`🔗 URL: ${url}`);
  console.error(`📊 State: ${state}`);

  // Check deployment state
  const healthyStates = ['READY', 'BUILDING'];
  const unhealthyStates = ['ERROR', 'CANCELED', 'CANCELLED'];

  if (healthyStates.includes(state)) {
    console.error(`✅ Deployment is healthy (${state})`);
    
    // Output the preview URL to stdout for downstream consumption
    console.log(url);
    process.exit(0);
  } else if (unhealthyStates.includes(state)) {
    console.error(`❌ Deployment is in unhealthy state: ${state}`);
    process.exit(1);
  } else {
    console.error(`⚠️  Unknown deployment state: ${state}`);
    console.error('🔄 This might be a new state - treating as unhealthy for safety');
    process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
