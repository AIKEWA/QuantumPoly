'use client';

import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

type Node = d3.SimulationNodeDatum & {
  id: string;
  group: number;
  val: number;
  label: string;
  status: 'active' | 'pending' | 'revoked';
};

type Link = d3.SimulationLinkDatum<Node> & {
  source: string;
  target: string;
  value: number;
};

type Data = {
  nodes: Node[];
  links: Link[];
};

export const GlobalIntegrityMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    // Simulate fetching federation data
    // In a real implementation, this would call /api/federation/graph
    const mockData: Data = {
      nodes: [
        { id: 'QP', group: 1, val: 20, label: 'QuantumPoly', status: 'active' },
        { id: 'ETH', group: 2, val: 15, label: 'ETH Zurich', status: 'active' },
        { id: 'AI4', group: 2, val: 15, label: 'AI4Gov EU', status: 'active' },
        { id: 'BER', group: 3, val: 10, label: 'Berlin Gov', status: 'pending' },
        { id: 'LON', group: 3, val: 10, label: 'London AI', status: 'active' },
        { id: 'SIN', group: 3, val: 10, label: 'Singapore Tech', status: 'active' },
        { id: 'UNK', group: 4, val: 5, label: 'Unknown Node', status: 'revoked' },
      ],
      links: [
        { source: 'QP', target: 'ETH', value: 5 },
        { source: 'QP', target: 'AI4', value: 5 },
        { source: 'QP', target: 'BER', value: 2 },
        { source: 'QP', target: 'LON', value: 3 },
        { source: 'QP', target: 'SIN', value: 3 },
        { source: 'ETH', target: 'AI4', value: 4 },
        { source: 'LON', target: 'SIN', value: 1 },
      ],
    };
    setData(mockData);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        'link',
        d3
          .forceLink(data.links)
          .id((d: d3.SimulationNodeDatum) => (d as Node).id)
          .distance(100),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', (d) => Math.sqrt(d.val) * 2)
      .attr('fill', (d) => {
        if (d.status === 'revoked') return '#ef4444';
        if (d.status === 'pending') return '#eab308';
        return '#10b981';
      })
      // Type assertion needed for d3 drag behavior with TypeScript
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call((d3.drag() as any).on('start', dragstarted).on('drag', dragged).on('end', dragended));

    const label = svg
      .append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', '10px')
      .attr('dx', 12)
      .attr('dy', 4)
      .attr('class', 'fill-gray-700 dark:fill-gray-300 pointer-events-none');

    node.append('title').text((d) => `${d.label} (${d.status})`);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: Link) => (d.source as unknown as Node).x!)
        .attr('y1', (d: Link) => (d.source as unknown as Node).y!)
        .attr('x2', (d: Link) => (d.target as unknown as Node).x!)
        .attr('y2', (d: Link) => (d.target as unknown as Node).y!);

      node.attr('cx', (d: Node) => d.x!).attr('cy', (d: Node) => d.y!);

      label.attr('x', (d: Node) => d.x!).attr('y', (d: Node) => d.y!);
    });

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  }, [data]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Revoked</span>
        </div>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <svg
          ref={svgRef}
          viewBox="0 0 800 600"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        ></svg>
      </div>
    </div>
  );
};
