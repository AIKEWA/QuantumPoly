/**
 * @fileoverview D3 Timeline Visualization Helpers
 * @module lib/visualization/timeline-helpers
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * Helper functions for D3-powered timeline visualization
 */

import * as d3 from 'd3';

import type { VerificationStatus } from '@/lib/governance/hash-continuity';

/**
 * Status color mapping for light and dark modes
 */
export const STATUS_COLORS = {
  verified: {
    light: '#10b981', // green-500
    dark: '#34d399', // green-400
    stroke: '#059669', // green-600
  },
  warning: {
    light: '#f59e0b', // amber-500
    dark: '#fbbf24', // amber-400
    stroke: '#d97706', // amber-600
  },
  error: {
    light: '#ef4444', // red-500
    dark: '#f87171', // red-400
    stroke: '#dc2626', // red-600
  },
  unknown: {
    light: '#6b7280', // gray-500
    dark: '#9ca3af', // gray-400
    stroke: '#4b5563', // gray-600
  },
} as const;

/**
 * Get color for verification status
 */
export function getStatusColor(status: VerificationStatus, theme: 'light' | 'dark' = 'light'): string {
  return STATUS_COLORS[status][theme];
}

/**
 * Get stroke color for verification status
 */
export function getStatusStroke(status: VerificationStatus): string {
  return STATUS_COLORS[status].stroke;
}

/**
 * Status shape mapping (for color-independent accessibility)
 */
export const STATUS_SHAPES = {
  verified: 'circle',
  warning: 'triangle',
  error: 'square',
  unknown: 'diamond',
} as const;

/**
 * Get shape for verification status
 */
export function getStatusShape(status: VerificationStatus): string {
  return STATUS_SHAPES[status];
}

/**
 * Create time scale for X-axis
 */
export function createTimeScale(
  data: Array<{ timestamp: string }>,
  width: number,
  margin: { left: number; right: number }
) {
  const timeExtent = d3.extent(data, (d) => new Date(d.timestamp));

  return d3
    .scaleTime()
    .domain(timeExtent as [Date, Date])
    .range([margin.left, width - margin.right]);
}

/**
 * Create linear scale for Y-axis (for positioning blocks)
 */
export function createLinearScale(count: number, height: number, margin: { top: number; bottom: number }) {
  return d3
    .scaleLinear()
    .domain([0, count - 1])
    .range([margin.top, height - margin.bottom]);
}

/**
 * Format timestamp for tooltip
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

/**
 * Format relative time (e.g., "5m ago", "2h ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

/**
 * Truncate hash for display
 */
export function truncateHash(hash: string, length: number = 8): string {
  if (hash.length <= length) return hash;
  return `${hash.substring(0, length)}...`;
}

/**
 * Create zoom behavior with constraints
 */
export function createZoomBehavior(
  scaleExtent: [number, number] = [0.5, 10],
  translateExtent?: [[number, number], [number, number]]
) {
  const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent(scaleExtent);

  if (translateExtent) {
    zoom.translateExtent(translateExtent);
  }

  return zoom;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate tooltip content HTML
 */
export function generateTooltipContent(data: {
  block: string;
  timestamp: string;
  hash: string;
  status: VerificationStatus;
  entryType?: string;
}): string {
  const statusLabel = data.status.charAt(0).toUpperCase() + data.status.slice(1);
  const statusColor = getStatusColor(data.status, 'light');

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.5;">
      <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">${data.block}</div>
      <div style="color: #666; margin-bottom: 4px;">
        <strong>Time:</strong> ${formatTimestamp(data.timestamp)}
      </div>
      <div style="color: #666; margin-bottom: 4px;">
        <strong>Hash:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px;">${truncateHash(data.hash, 12)}</code>
      </div>
      ${data.entryType ? `<div style="color: #666; margin-bottom: 4px;"><strong>Type:</strong> ${data.entryType}</div>` : ''}
      <div style="display: flex; align-items: center; margin-top: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; margin-right: 6px;"></span>
        <strong style="color: ${statusColor};">${statusLabel}</strong>
      </div>
    </div>
  `;
}

/**
 * Create SVG path for different shapes
 */
export function createShapePath(shape: string, x: number, y: number, size: number): string {
  const halfSize = size / 2;

  switch (shape) {
    case 'circle':
      return `M ${x},${y} m -${halfSize},0 a ${halfSize},${halfSize} 0 1,0 ${size},0 a ${halfSize},${halfSize} 0 1,0 -${size},0`;

    case 'triangle':
      const height = (Math.sqrt(3) / 2) * size;
      return `M ${x},${y - height / 2} L ${x + halfSize},${y + height / 2} L ${x - halfSize},${y + height / 2} Z`;

    case 'square':
      return `M ${x - halfSize},${y - halfSize} L ${x + halfSize},${y - halfSize} L ${x + halfSize},${y + halfSize} L ${x - halfSize},${y + halfSize} Z`;

    case 'diamond':
      return `M ${x},${y - halfSize} L ${x + halfSize},${y} L ${x},${y + halfSize} L ${x - halfSize},${y} Z`;

    default:
      return `M ${x},${y} m -${halfSize},0 a ${halfSize},${halfSize} 0 1,0 ${size},0 a ${halfSize},${halfSize} 0 1,0 -${size},0`;
  }
}

/**
 * Calculate integrity sparkline data
 * Returns array of status counts for visualization
 */
export function calculateSparklineData(entries: Array<{ verified?: boolean; status?: VerificationStatus }>) {
  const counts = {
    verified: 0,
    warning: 0,
    error: 0,
    unknown: 0,
  };

  for (const entry of entries) {
    const status = entry.status || (entry.verified ? 'verified' : 'unknown');
    if (status in counts) {
      counts[status as keyof typeof counts]++;
    }
  }

  return counts;
}

/**
 * Generate sparkline SVG path
 */
export function generateSparklinePath(
  data: Array<number>,
  width: number,
  height: number
): string {
  if (data.length === 0) return '';

  const xScale = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, Math.max(...data)])
    .range([height, 0]);

  const line = d3
    .line<number>()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveMonotoneX);

  return line(data) || '';
}

