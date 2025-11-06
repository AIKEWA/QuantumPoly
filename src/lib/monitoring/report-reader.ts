/**
 * @fileoverview Monitoring Report Reader
 * @module lib/monitoring/report-reader
 * @see BLOCK10.3_IMPLEMENTATION_SUMMARY.md
 *
 * Utilities for accessing and analyzing historical monitoring reports
 * Part of "The System That Watches Itself" autonomous monitoring framework
 */

import fs from 'fs';
import path from 'path';

/**
 * Monitoring report structure
 */
export interface MonitoringReport {
  report_id: string;
  timestamp: string;
  report_date: string;
  block_id: string;
  system_state: 'healthy' | 'warning' | 'degraded';
  base_url: string;
  endpoints: Array<{
    endpoint: string;
    url: string;
    available: boolean;
    status_code: number | null;
    response_time_ms: number;
    status: 'pass' | 'warning' | 'fail';
    notes: string;
    timestamp: string;
  }>;
  endpoint_summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  tls: {
    valid: boolean;
    issuer: string | null;
    valid_from: string | null;
    valid_to: string | null;
    days_remaining: number | null;
    error: string | null;
  };
  integrity: {
    status: string;
    issues: number;
    auto_repaired?: number;
    requires_review?: number;
    last_verification?: string;
    merkle_root?: string;
    summary: string;
  } | null;
  ewa: {
    total_insights: number;
    critical_insights: number;
    requires_review: number;
    summary: string;
    timestamp: string;
  } | null;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    details: string;
  }>;
  metadata: {
    script_version: string;
    execution_time_ms: number;
    dry_run: boolean;
  };
}

/**
 * Incident summary
 */
export interface Incident {
  date: string;
  system_state: 'degraded' | 'warning';
  duration_hours: number | null;
  affected_endpoints: string[];
  recommendations: number;
  resolved: boolean;
}

/**
 * Uptime statistics
 */
export interface UptimeStats {
  period_days: number;
  total_reports: number;
  healthy_count: number;
  warning_count: number;
  degraded_count: number;
  uptime_percentage: number;
  availability_percentage: number;
  average_response_time: number;
  incidents: Incident[];
}

/**
 * Get reports directory path
 */
function getReportsDirectory(): string {
  return path.join(process.cwd(), 'reports/monitoring');
}

/**
 * Check if reports directory exists
 */
export function reportsDirectoryExists(): boolean {
  return fs.existsSync(getReportsDirectory());
}

/**
 * Get list of available report files
 */
export function getReportFiles(): string[] {
  const reportsDir = getReportsDirectory();
  
  if (!fs.existsSync(reportsDir)) {
    return [];
  }

  return fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('monitoring-') && file.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first
}

/**
 * Load a monitoring report from file
 */
export function loadReport(filename: string): MonitoringReport | null {
  try {
    const reportsDir = getReportsDirectory();
    const filePath = path.join(reportsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as MonitoringReport;
  } catch (error) {
    console.error(`Failed to load report ${filename}:`, error);
    return null;
  }
}

/**
 * Get the most recent monitoring report
 */
export function getLatestReport(): MonitoringReport | null {
  const files = getReportFiles();
  
  if (files.length === 0) {
    return null;
  }

  return loadReport(files[0]);
}

/**
 * Get monitoring reports for the last N days
 */
export function getReportHistory(days: number = 30): MonitoringReport[] {
  try {
    const files = getReportFiles();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const reports: MonitoringReport[] = [];

    for (const file of files) {
      const report = loadReport(file);
      if (!report) continue;

      const reportDate = new Date(report.timestamp);
      if (reportDate >= cutoffDate) {
        reports.push(report);
      }
    }

    return reports.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting report history:', error);
    return [];
  }
}

/**
 * Get report for a specific date
 */
export function getReportByDate(date: string): MonitoringReport | null {
  const filename = `monitoring-${date}.json`;
  return loadReport(filename);
}

/**
 * Calculate uptime percentage over a period
 */
export function calculateUptimePercentage(days: number = 30): number {
  const reports = getReportHistory(days);
  
  if (reports.length === 0) {
    return 0;
  }

  const healthyCount = reports.filter(r => r.system_state === 'healthy').length;
  return (healthyCount / reports.length) * 100;
}

/**
 * Calculate endpoint availability percentage
 */
export function calculateAvailabilityPercentage(days: number = 30): number {
  const reports = getReportHistory(days);
  
  if (reports.length === 0) {
    return 0;
  }

  let totalEndpoints = 0;
  let availableEndpoints = 0;

  reports.forEach(report => {
    report.endpoints.forEach(endpoint => {
      totalEndpoints++;
      if (endpoint.available) {
        availableEndpoints++;
      }
    });
  });

  if (totalEndpoints === 0) {
    return 0;
  }

  return (availableEndpoints / totalEndpoints) * 100;
}

/**
 * Calculate average response time across all endpoints
 */
export function calculateAverageResponseTime(days: number = 30): number {
  const reports = getReportHistory(days);
  
  if (reports.length === 0) {
    return 0;
  }

  let totalResponseTime = 0;
  let count = 0;

  reports.forEach(report => {
    report.endpoints.forEach(endpoint => {
      if (endpoint.available) {
        totalResponseTime += endpoint.response_time_ms;
        count++;
      }
    });
  });

  return count > 0 ? Math.round(totalResponseTime / count) : 0;
}

/**
 * Detect incidents (degraded or warning states)
 */
export function detectIncidents(days: number = 30): Incident[] {
  const reports = getReportHistory(days);
  const incidents: Incident[] = [];
  
  let currentIncident: Incident | null = null;

  for (const report of reports) {
    const isIncident = report.system_state === 'degraded' || report.system_state === 'warning';
    
    if (isIncident) {
      if (!currentIncident) {
        // Start new incident
        const affectedEndpoints = report.endpoints
          .filter(ep => !ep.available || ep.status !== 'pass')
          .map(ep => ep.endpoint);

        // At this point we know system_state is 'degraded' or 'warning'
        const incidentState: 'degraded' | 'warning' = 
          report.system_state === 'degraded' || report.system_state === 'warning'
            ? report.system_state
            : 'warning'; // Fallback (should never happen)

        currentIncident = {
          date: report.report_date,
          system_state: incidentState,
          duration_hours: null,
          affected_endpoints: affectedEndpoints,
          recommendations: report.recommendations.length,
          resolved: false,
        };
      }
    } else {
      if (currentIncident) {
        // End current incident
        const incidentStart = new Date(currentIncident.date);
        const incidentEnd = new Date(report.report_date);
        const resolvedIncident: Incident = {
          ...currentIncident,
          duration_hours: Math.abs(incidentEnd.getTime() - incidentStart.getTime()) / (1000 * 60 * 60),
          resolved: true,
        };
        
        incidents.push(resolvedIncident);
        currentIncident = null;
      }
    }
  }

  // If there's an ongoing incident, add it
  if (currentIncident) {
    incidents.push({
      ...currentIncident,
      resolved: false,
    });
  }

  return incidents;
}

/**
 * Get comprehensive uptime statistics
 */
export function getUptimeStats(days: number = 30): UptimeStats {
  const reports = getReportHistory(days);
  
  const healthyCount = reports.filter(r => r.system_state === 'healthy').length;
  const warningCount = reports.filter(r => r.system_state === 'warning').length;
  const degradedCount = reports.filter(r => r.system_state === 'degraded').length;

  return {
    period_days: days,
    total_reports: reports.length,
    healthy_count: healthyCount,
    warning_count: warningCount,
    degraded_count: degradedCount,
    uptime_percentage: calculateUptimePercentage(days),
    availability_percentage: calculateAvailabilityPercentage(days),
    average_response_time: calculateAverageResponseTime(days),
    incidents: detectIncidents(days),
  };
}

/**
 * Get system health trend (improving, stable, declining)
 */
export function getHealthTrend(days: number = 7): 'improving' | 'stable' | 'declining' | 'unknown' {
  const reports = getReportHistory(days);
  
  if (reports.length < 2) {
    return 'unknown';
  }

  // Score: healthy = 2, warning = 1, degraded = 0
  const scores = reports.map(r => {
    if (r.system_state === 'healthy') return 2 as const;
    if (r.system_state === 'warning') return 1 as const;
    return 0 as const;
  });

  const recentAvg = scores.slice(0, Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0 as number) / Math.ceil(scores.length / 2);
  const olderAvg = scores.slice(Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0 as number) / Math.floor(scores.length / 2);

  const diff = recentAvg - olderAvg;

  if (diff > 0.3) return 'improving';
  if (diff < -0.3) return 'declining';
  return 'stable';
}

/**
 * Get reports requiring attention (degraded or critical recommendations)
 */
export function getReportsRequiringAttention(days: number = 7): MonitoringReport[] {
  const reports = getReportHistory(days);
  
  return reports.filter(report => 
    report.system_state === 'degraded' ||
    report.recommendations.some(rec => rec.priority === 'critical')
  );
}

/**
 * Get summary of most recent report
 */
export function getLatestReportSummary(): {
  available: boolean;
  system_state: string;
  timestamp: string;
  endpoints_healthy: string;
  uptime_7d: number;
  trend: string;
} {
  try {
    const latest = getLatestReport();
    
    if (!latest) {
      return {
        available: false,
        system_state: 'unknown',
        timestamp: 'never',
        endpoints_healthy: '0/0',
        uptime_7d: 0,
        trend: 'unknown',
      };
    }

    return {
      available: true,
      system_state: latest.system_state,
      timestamp: latest.timestamp,
      endpoints_healthy: `${latest.endpoint_summary.passed}/${latest.endpoint_summary.total}`,
      uptime_7d: calculateUptimePercentage(7),
      trend: getHealthTrend(7),
    };
  } catch (error) {
    console.error('Error getting latest report summary:', error);
    return {
      available: false,
      system_state: 'unknown',
      timestamp: 'never',
      endpoints_healthy: '0/0',
      uptime_7d: 0,
      trend: 'unknown',
    };
  }
}

