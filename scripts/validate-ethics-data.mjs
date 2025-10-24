#!/usr/bin/env node

/**
 * Ethical Data Validation Script
 *
 * Validates aggregated ethical scorecard data against JSON schemas using AJV.
 *
 * Usage:
 *   node scripts/validate-ethics-data.mjs
 *
 * Validates:
 *   /reports/governance/dashboard-data.json
 */

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Configuration
const DASHBOARD_DATA = './reports/governance/dashboard-data.json';
const SCORECARD_SCHEMA = './schemas/ethics/ethical-scorecard-schema.json';
const REPORT_SCHEMA = './schemas/ethics/report-schema.json';

/**
 * Load JSON file
 */
function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Validate ethics data
 */
function validateEthicsData() {
  console.log('\n🔍 Ethical Data Validation');
  console.log('═'.repeat(80));

  // Initialize AJV with strict schema validation
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    validateFormats: true,
  });
  addFormats(ajv);

  // Load schemas
  console.log('📋 Loading schemas...');
  let reportSchema, scorecardSchema;
  
  try {
    reportSchema = loadJSON(REPORT_SCHEMA);
    scorecardSchema = loadJSON(SCORECARD_SCHEMA);
    console.log('   ✅ Schemas loaded');
  } catch (error) {
    console.error('   ❌ Schema loading failed:', error.message);
    process.exit(1);
  }

  // Add schemas to validator
  ajv.addSchema(reportSchema, 'report-schema.json');
  const validateScorecard = ajv.compile(scorecardSchema);

  // Load dashboard data
  console.log('📊 Loading dashboard data...');
  let dashboardData;
  
  try {
    dashboardData = loadJSON(DASHBOARD_DATA);
    console.log('   ✅ Dashboard data loaded');
  } catch (error) {
    console.error('   ❌ Dashboard data loading failed:', error.message);
    console.error(`   Expected file: ${DASHBOARD_DATA}`);
    console.error('   Run `npm run ethics:aggregate` first.');
    process.exit(1);
  }

  // Validate scorecard
  console.log('🔬 Validating scorecard structure...');
  const valid = validateScorecard(dashboardData);

  if (!valid) {
    console.error('   ❌ Validation FAILED\n');
    console.error('Validation Errors:');
    console.error('─'.repeat(80));
    
    for (const error of validateScorecard.errors || []) {
      console.error(`   ${error.instancePath || '/'}: ${error.message}`);
      if (error.params) {
        console.error(`   Params: ${JSON.stringify(error.params)}`);
      }
    }
    
    console.error('─'.repeat(80));
    console.error('\n💡 Fix validation errors and run again.\n');
    process.exit(1);
  }

  console.log('   ✅ Scorecard structure valid');

  // Validate individual reports
  console.log('🔬 Validating individual metric reports...');
  const validateReport = ajv.compile(reportSchema);
  
  let reportErrors = 0;
  for (const [index, report] of (dashboardData.reports || []).entries()) {
    const reportValid = validateReport(report);
    if (!reportValid) {
      console.error(`   ❌ Report ${index + 1} (${report.metric || 'unknown'}) failed validation`);
      for (const error of validateReport.errors || []) {
        console.error(`      ${error.instancePath || '/'}: ${error.message}`);
      }
      reportErrors++;
    }
  }

  if (reportErrors > 0) {
    console.error(`\n❌ ${reportErrors} report(s) failed validation\n`);
    process.exit(1);
  }

  console.log(`   ✅ All ${dashboardData.reports?.length || 0} reports valid`);

  // Validate EII calculation
  console.log('🧮 Validating EII calculation...');
  const { metrics, eii, eiCalculation } = dashboardData;
  
  if (eiCalculation && eiCalculation.weights) {
    const calculatedEII =
      metrics.a11y * eiCalculation.weights.a11y +
      metrics.performance * eiCalculation.weights.performance +
      metrics.seo * eiCalculation.weights.seo +
      metrics.bundle * eiCalculation.weights.bundle;

    const roundedEII = Math.round(calculatedEII * 10) / 10;

    if (Math.abs(roundedEII - eii) > 0.1) {
      console.error(`   ❌ EII mismatch: calculated ${roundedEII}, stored ${eii}`);
      process.exit(1);
    }

    console.log(`   ✅ EII calculation correct: ${eii}`);
  } else {
    console.warn('   ⚠️  EII calculation metadata missing, skipping verification');
  }

  // Summary
  console.log('\n✅ All Validation Checks Passed');
  console.log('═'.repeat(80));
  console.log(`   Project: ${dashboardData.project}`);
  console.log(`   Version: ${dashboardData.version}`);
  console.log(`   Commit:  ${dashboardData.commit}`);
  console.log(`   EII:     ${dashboardData.eii}/100`);
  console.log(`   Reports: ${dashboardData.reports?.length || 0}`);
  console.log(`   Hash:    ${dashboardData.hash}`);
  console.log('═'.repeat(80));
  console.log('');
}

// Execute
try {
  validateEthicsData();
} catch (error) {
  console.error('❌ Validation error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

