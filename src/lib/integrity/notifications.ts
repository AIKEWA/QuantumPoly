/**
 * @fileoverview Integrity Notification System
 * @module lib/integrity/notifications
 * @see BLOCK9.8_CONTINUOUS_INTEGRITY.md
 *
 * Hybrid escalation system:
 * - Email notifications to governance officer
 * - Webhook notifications for external systems
 */

import crypto from 'crypto';

import {
  type EmailNotification,
  type WebhookPayload,
  type IntegrityIssue,
  IssueSeverity,
} from './types';

/**
 * Compute HMAC-SHA256 signature
 */
function computeHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Send email notification (placeholder - requires email service integration)
 */
export async function sendEmailNotification(
  notification: EmailNotification
): Promise<{ success: boolean; error?: string }> {
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  // For now, log to console
  
  console.log('\n📧 Email Notification:');
  console.log(`To: ${notification.to}`);
  console.log(`Subject: ${notification.subject}`);
  console.log('\nBody:');
  console.log(`  Classification: ${notification.body.issue_classification}`);
  console.log(`  Severity: ${notification.body.severity}`);
  console.log(`  Detected: ${notification.body.detected_at}`);
  console.log(`  Description: ${notification.body.description}`);
  console.log(`  Affected Ledgers: ${notification.body.affected_ledgers.join(', ')}`);
  console.log(`  Action Required: ${notification.body.action_required}`);
  console.log(`  Review URL: ${notification.body.review_url}`);
  console.log(`  Ledger Entry: ${notification.body.ledger_entry_id}`);
  console.log('');

  // TODO: Integrate actual email service
  // Example with nodemailer:
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ ... });

  return { success: true };
}

/**
 * Send webhook notification
 */
export async function sendWebhookNotification(
  webhookUrl: string,
  payload: WebhookPayload,
  secret: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Compute signature
    const payloadString = JSON.stringify(payload);
    const signature = computeHmacSignature(payloadString, secret);

    // Add signature to payload (for future webhook implementation)
    // const signedPayload = { ...payload, signature };

    console.log('\n🔔 Webhook Notification:');
    console.log(`URL: ${webhookUrl}`);
    console.log(`Event: ${payload.event_type}`);
    console.log(`Severity: ${payload.severity}`);
    console.log(`Issue: ${payload.issue.classification}`);
    console.log(`Signature: ${signature.slice(0, 16)}...`);
    console.log('');

    // Send webhook (in production)
    // const response = await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-Integrity-Signature': signature,
    //   },
    //   body: JSON.stringify(signedPayload),
    // });

    // if (!response.ok) {
    //   throw new Error(`Webhook failed: ${response.statusText}`);
    // }

    return { success: true };
  } catch (error) {
    console.error('Webhook notification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create email notification from integrity issue
 */
export function createEmailNotification(
  issue: IntegrityIssue,
  repairEntryId: string,
  governanceOfficerEmail: string
): EmailNotification {
  const severityEmoji = {
    [IssueSeverity.CRITICAL]: '🚨',
    [IssueSeverity.HIGH]: '⚠️',
    [IssueSeverity.MEDIUM]: '⚡',
    [IssueSeverity.LOW]: 'ℹ️',
  };

  const emoji = severityEmoji[issue.severity] || '📋';

  return {
    to: governanceOfficerEmail,
    subject: `${emoji} Governance Integrity Issue Detected: ${issue.classification}`,
    body: {
      issue_classification: issue.classification,
      severity: issue.severity,
      detected_at: issue.detected_at,
      description: issue.description,
      affected_ledgers: [issue.affected_ledger],
      action_required: issue.auto_repairable
        ? 'Auto-repair attempted. Please review ledger entry.'
        : 'Human review required. This issue cannot be auto-repaired.',
      review_url: 'https://www.quantumpoly.ai/governance/integrity',
      ledger_entry_id: repairEntryId,
    },
  };
}

/**
 * Create webhook payload from integrity issue
 */
export function createWebhookPayload(
  issue: IntegrityIssue,
  repairEntryId: string,
  secret: string
): WebhookPayload {
  const payloadWithoutSignature = {
    event_type: 'integrity_issue_detected' as const,
    timestamp: new Date().toISOString(),
    severity: issue.severity,
    issue,
    repair_entry_id: repairEntryId,
    signature: '', // Will be computed
  };

  // Compute signature
  const signature = computeHmacSignature(
    JSON.stringify(payloadWithoutSignature),
    secret
  );

  return {
    ...payloadWithoutSignature,
    signature,
  };
}

/**
 * Notify about integrity issue
 * 
 * Sends both email and webhook notifications if configured
 */
export async function notifyIntegrityIssue(
  issue: IntegrityIssue,
  repairEntryId: string,
  config: {
    governanceOfficerEmail?: string;
    webhookUrl?: string;
    webhookSecret?: string;
  }
): Promise<{
  emailSent: boolean;
  webhookSent: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let emailSent = false;
  let webhookSent = false;

  // Send email notification
  if (config.governanceOfficerEmail) {
    const emailNotification = createEmailNotification(
      issue,
      repairEntryId,
      config.governanceOfficerEmail
    );

    const emailResult = await sendEmailNotification(emailNotification);
    emailSent = emailResult.success;
    
    if (!emailResult.success && emailResult.error) {
      errors.push(`Email: ${emailResult.error}`);
    }
  }

  // Send webhook notification
  if (config.webhookUrl && config.webhookSecret) {
    const webhookPayload = createWebhookPayload(
      issue,
      repairEntryId,
      config.webhookSecret
    );

    const webhookResult = await sendWebhookNotification(
      config.webhookUrl,
      webhookPayload,
      config.webhookSecret
    );
    
    webhookSent = webhookResult.success;
    
    if (!webhookResult.success && webhookResult.error) {
      errors.push(`Webhook: ${webhookResult.error}`);
    }
  }

  return { emailSent, webhookSent, errors };
}

/**
 * Send daily digest email
 */
export async function sendDailyDigest(
  summary: {
    totalIssues: number;
    autoRepaired: number;
    pendingReview: number;
    criticalIssues: number;
    reportUrl: string;
  },
  governanceOfficerEmail: string
): Promise<{ success: boolean; error?: string }> {
  const emoji = summary.criticalIssues > 0 ? '🚨' : summary.pendingReview > 0 ? '⚠️' : '✅';

  console.log('\n📧 Daily Integrity Digest:');
  console.log(`To: ${governanceOfficerEmail}`);
  console.log(`Subject: ${emoji} Daily Integrity Verification Report`);
  console.log('\nSummary:');
  console.log(`  Total Issues: ${summary.totalIssues}`);
  console.log(`  Auto-Repaired: ${summary.autoRepaired}`);
  console.log(`  Pending Review: ${summary.pendingReview}`);
  console.log(`  Critical Issues: ${summary.criticalIssues}`);
  console.log(`  Report: ${summary.reportUrl}`);
  console.log('');

  // TODO: Send actual email with formatted HTML template

  return { success: true };
}

