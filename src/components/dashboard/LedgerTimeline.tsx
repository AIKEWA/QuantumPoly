'use client';

/**
 * @fileoverview Interactive Ledger Timeline Component
 * @module components/dashboard/LedgerTimeline
 * @see BLOCK10.4_DASHBOARD_REFINEMENT.md
 *
 * D3-powered interactive timeline visualization of governance ledger
 * with zoom, pan, hash continuity verification, and keyboard navigation
 */

import * as d3 from 'd3';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { getVerificationStatus, type LedgerEntry as HashEntry } from '@/lib/governance/hash-continuity';
import {
  createTimeScale,
  formatTimestamp,
  getStatusColor,
  getStatusStroke,
  getStatusShape,
  createShapePath,
  generateTooltipContent,
} from '@/lib/visualization/timeline-helpers';

interface LedgerTimelineProps {
  entries: HashEntry[];
  height?: number;
  onBlockClick?: (entry: HashEntry) => void;
  showControls?: boolean;
  compactMode?: boolean;
}

/**
 * Interactive Ledger Timeline Component
 *
 * Features:
 * - D3-powered timeline visualization
 * - Zoom and pan controls
 * - Hash continuity verification
 * - Keyboard navigation
 * - WCAG 2.2 AA compliant
 */
export function LedgerTimeline({
  entries,
  height = 400,
  onBlockClick,
  showControls = true,
  compactMode = false,
}: LedgerTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Margins for the visualization
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };

  // Detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Calculate verification status for each entry
  const enrichedEntries = useMemo(() => {
    return entries.map((entry) => ({
      ...entry,
      status: getVerificationStatus(entry, entries),
    }));
  }, [entries]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enrichedEntries.length) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(enrichedEntries.length - 1, prev + 1));
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(enrichedEntries.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (onBlockClick && enrichedEntries[selectedIndex]) {
            onBlockClick(enrichedEntries[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enrichedEntries, selectedIndex, onBlockClick]);

  // Render D3 visualization
  useEffect(() => {
    if (!svgRef.current || enrichedEntries.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width } = dimensions;
    const theme = isDarkMode ? 'dark' : 'light';

    // Create scales
    const xScale = createTimeScale(enrichedEntries, width, margin);
    const yPos = height / 2;

    // Create main group
    const g = svg.append('g');

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Draw X-axis
    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat((d) => {
      const date = d as Date;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', isDarkMode ? '#9ca3af' : '#6b7280')
      .style('font-size', '12px');

    g.selectAll('.x-axis path, .x-axis line').attr('stroke', isDarkMode ? '#4b5563' : '#d1d5db');

    // Draw hash continuity lines
    g.selectAll('.continuity-line')
      .data(enrichedEntries.slice(1))
      .join('line')
      .attr('class', 'continuity-line')
      .attr('x1', (d, i) => xScale(new Date(enrichedEntries[i].timestamp)))
      .attr('y1', yPos)
      .attr('x2', (d) => xScale(new Date(d.timestamp)))
      .attr('y2', yPos)
      .attr('stroke', (d) => {
        const status = d.status;
        return status === 'verified' ? getStatusColor('verified', theme) : getStatusColor('warning', theme);
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => (d.status === 'verified' ? '0' : '5,5'))
      .attr('opacity', 0.6);

    // Draw blocks
    const blocks = g
      .selectAll('.block')
      .data(enrichedEntries)
      .join('g')
      .attr('class', 'block')
      .attr('transform', (d) => `translate(${xScale(new Date(d.timestamp))},${yPos})`)
      .style('cursor', 'pointer')
      .on('click', function (_event, d) {
        setSelectedIndex(enrichedEntries.indexOf(d));
        if (onBlockClick) onBlockClick(d);
      })
      .on('mouseenter', function (event, d) {
        // Show tooltip
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(
            generateTooltipContent({
              block: d.block,
              timestamp: d.timestamp,
              hash: d.hash,
              status: d.status,
              entryType: (d as any).entryType,
            })
          );

        // Highlight block
        d3.select(this).select('circle, rect, path').attr('stroke-width', 3);
      })
      .on('mouseleave', function () {
        // Hide tooltip
        d3.select(tooltipRef.current).style('opacity', 0);

        // Remove highlight
        d3.select(this).select('circle, rect, path').attr('stroke-width', 2);
      });

    // Draw block shapes
    blocks
      .append('path')
      .attr('d', (d) => {
        const shape = getStatusShape(d.status);
        return createShapePath(shape, 0, 0, 16);
      })
      .attr('fill', (d) => getStatusColor(d.status, theme))
      .attr('stroke', (d) => getStatusStroke(d.status))
      .attr('stroke-width', (_, i) => (i === selectedIndex ? 3 : 2))
      .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));

    // Add block labels (block ID)
    blocks
      .append('text')
      .text((d) => d.block)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#e5e7eb' : '#1f2937')
      .style('font-size', compactMode ? '10px' : '11px')
      .style('font-weight', '500')
      .style('pointer-events', 'none');

    // Add sparkline indicators below blocks
    if (!compactMode) {
      blocks
        .append('circle')
        .attr('cy', 25)
        .attr('r', 3)
        .attr('fill', (d) => getStatusColor(d.status, theme))
        .attr('opacity', 0.7);
    }

    // Add ARIA labels for accessibility
    blocks.append('title').text((d) => {
      return `Block ${d.block}, ${formatTimestamp(d.timestamp)}, Status: ${d.status}`;
    });
  }, [enrichedEntries, dimensions, isDarkMode, selectedIndex, onBlockClick, margin, height, compactMode]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
  }, []);

  if (enrichedEntries.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">No ledger entries available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Controls */}
      {showControls && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {enrichedEntries.length} blocks
            </span>
            {enrichedEntries[selectedIndex] && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-mono">{enrichedEntries[selectedIndex].block}</span>
              </span>
            )}
          </div>
          <button
            onClick={resetZoom}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Reset zoom level"
          >
            Reset View
          </button>
        </div>
      )}

      {/* Timeline SVG */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={height}
          className="w-full"
          role="img"
          aria-label="Interactive governance ledger timeline"
        >
          <title>Governance Ledger Timeline</title>
          <desc>
            Interactive timeline showing {enrichedEntries.length} governance ledger blocks with hash chain
            continuity verification. Use arrow keys to navigate, +/- to zoom, Enter to select.
          </desc>
        </svg>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        style={{ opacity: 0 }}
      />

      {/* Keyboard shortcuts hint */}
      {!compactMode && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <strong>Keyboard shortcuts:</strong> ← → (navigate blocks) • +/- (zoom) • Home/End (boundaries) •
          Enter (select)
        </div>
      )}
    </div>
  );
}

