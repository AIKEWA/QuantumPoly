#!/usr/bin/env ts-node
/**
 * visualize-intent.ts
 * 
 * Visualizes the "intent" of a system by mapping components, their relationships,
 * and potential silent failures. Creates an HTML visualization to help developers
 * see where meaning might be missing in their architecture.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

interface ComponentNode {
  id: string;
  name: string;
  type: 'page' | 'component' | 'layout' | 'api' | 'hook' | 'store';
  filePath: string;
  hasContent: boolean;
  imports: string[];
  exports: string[];
  silentFailures: Array<{
    type: string;
    description: string;
  }>;
}

interface RelationshipEdge {
  source: string;
  target: string;
  type: 'imports' | 'renders' | 'data-flow';
  strength: number; // 0-1, how strong the relationship is
}

// Extract imports from a file
function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while (match = importRegex.exec(content)) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Check if a file has meaningful content or is just a structure
function hasSignificantContent(content: string): boolean {
  // Remove comments and whitespace
  const trimmedContent = content
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*[\r\n]/gm, '')
    .trim();
  
  // If the file is very short after removing comments, it might be an empty structure
  if (trimmedContent.length < 50) {
    return false;
  }
  
  // Check for signs of actual implementation vs just structure
  const hasStateOrEffects = /useState|useEffect|useReducer|useContext/.test(content);
  const hasFunctionBody = /function\s+\w+\([^)]*\)\s*{\s*[^{}]+\s*}/.test(content);
  const hasJsx = /<[A-Z][A-Za-z0-9]*/.test(content);
  
  return hasStateOrEffects || hasFunctionBody || hasJsx;
}

// Detect potential silent failures in a file
function detectSilentFailures(content: string): Array<{type: string, description: string}> {
  const failures: Array<{type: string, description: string}> = [];
  
  // Empty component that returns null
  if (/return\s+null\s*;/.test(content) && 
      !content.includes('// This return is never reached')) {
    failures.push({
      type: 'empty-return',
      description: 'Component returns null without clear reason'
    });
  }
  
  // Empty catch blocks
  if (/catch\s*\([^)]*\)\s*{\s*(\/\/.*\n)*\s*}\s*/.test(content)) {
    failures.push({
      type: 'silent-catch',
      description: 'Exception caught but not handled'
    });
  }
  
  // Unimplemented placeholder functions
  if (/function\s+\w+\([^)]*\)\s*{\s*(\/\/.*\n)*\s*}\s*/.test(content) ||
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{\s*(\/\/.*\n)*\s*}\s*/.test(content)) {
    failures.push({
      type: 'unimplemented',
      description: 'Function exists but has no implementation'
    });
  }
  
  return failures;
}

// Determine node type based on file path
function determineNodeType(filePath: string): ComponentNode['type'] {
  if (filePath.includes('/pages/') || filePath.endsWith('/page.tsx') || filePath.endsWith('/page.jsx')) {
    return 'page';
  } else if (filePath.includes('/components/')) {
    return 'component';
  } else if (filePath.includes('/layout.tsx') || filePath.includes('/layout.jsx')) {
    return 'layout';
  } else if (filePath.includes('/api/')) {
    return 'api';
  } else if (filePath.includes('/hooks/')) {
    return 'hook';
  } else if (filePath.includes('/store/') || filePath.includes('/context/')) {
    return 'store';
  } else {
    return 'component'; // Default
  }
}

// Get filename without extension
function getFilenameWithoutExt(filePath: string): string {
  const basename = path.basename(filePath);
  return basename.substring(0, basename.lastIndexOf('.'));
}

// Generate graph data for visualization
async function generateIntentGraph(): Promise<{nodes: ComponentNode[], edges: RelationshipEdge[]}> {
  const rootDir = process.cwd();
  const nodes: ComponentNode[] = [];
  const edgesMap = new Map<string, RelationshipEdge>();
  
  // Find all React component files
  const files = await glob('**/*.{jsx,tsx}', {
    cwd: rootDir,
    ignore: ['**/node_modules/**', '**/build/**', '**/.next/**', '**/dist/**']
  });
  
  // First pass: build nodes
  for (const file of files) {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const name = getFilenameWithoutExt(file);
    const id = file; // Use relative path as unique ID
    
    const node: ComponentNode = {
      id,
      name,
      type: determineNodeType(file),
      filePath: file,
      hasContent: hasSignificantContent(content),
      imports: extractImports(content),
      exports: [], // Would need more complex parsing to extract exports
      silentFailures: detectSilentFailures(content)
    };
    
    nodes.push(node);
  }
  
  // Second pass: build edges based on imports
  for (const node of nodes) {
    for (const importPath of node.imports) {
      // Try to resolve the import to a node
      // This is simplified - a real implementation would need proper module resolution
      const targetNode = nodes.find(n => {
        // See if import matches any node's path, accounting for different ways to import
        const nPath = n.filePath;
        return importPath === nPath || 
               importPath === './' + path.basename(nPath) || 
               importPath === '../' + path.basename(nPath);
      });
      
      if (targetNode) {
        const edgeId = `${node.id}->${targetNode.id}`;
        
        // Add relationship edge
        edgesMap.set(edgeId, {
          source: node.id,
          target: targetNode.id,
          type: 'imports',
          strength: 0.8 // Default strength for direct imports
        });
      }
    }
  }
  
  return {
    nodes,
    edges: Array.from(edgesMap.values())
  };
}

// Generate HTML visualization from graph data
function generateVisualization(graph: {nodes: ComponentNode[], edges: RelationshipEdge[]}) {
  const { nodes, edges } = graph;
  
  // Convert nodes and edges to JSON for D3
  const nodesJson = JSON.stringify(nodes);
  const edgesJson = JSON.stringify(edges);
  
  // Count silent failures
  const silentFailureCount = nodes.reduce((count, node) => count + node.silentFailures.length, 0);
  const emptyNodesCount = nodes.filter(n => !n.hasContent).length;
  
  // Create HTML file with D3.js visualization
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Intent Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    
    #container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      color: #1a1a1a;
      text-align: center;
      margin-bottom: 10px;
    }
    
    h2 {
      color: #444;
      margin-top: 30px;
    }
    
    .subtitle {
      color: #666;
      text-align: center;
      margin-top: 0;
      margin-bottom: 30px;
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 30px;
    }
    
    .stat-box {
      background-color: white;
      border-radius: 8px;
      padding: 15px 25px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      margin: 0;
    }
    
    .warning {
      color: #e74c3c;
    }
    
    .ok {
      color: #2ecc71;
    }
    
    .medium {
      color: #f39c12;
    }
    
    .graph-container {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: 600px;
      position: relative;
    }
    
    #visualization {
      width: 100%;
      height: 100%;
    }
    
    .node {
      cursor: pointer;
    }
    
    .node circle {
      stroke-width: 2px;
    }
    
    .node-page circle {
      fill: #3498db;
    }
    
    .node-component circle {
      fill: #2ecc71;
    }
    
    .node-layout circle {
      fill: #9b59b6;
    }
    
    .node-api circle {
      fill: #f1c40f;
    }
    
    .node-store circle {
      fill: #e74c3c;
    }
    
    .node-hollow circle {
      fill-opacity: 0.3;
    }
    
    .link {
      stroke: #999;
      stroke-opacity: 0.6;
    }
    
    .node text {
      font-size: 12px;
      fill: #333;
    }
    
    .tooltip {
      position: absolute;
      background-color: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      z-index: 100;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      font-size: 14px;
    }
    
    .legend-color {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      margin-right: 5px;
    }
    
    .silent-failures {
      margin-top: 30px;
    }
    
    .failure-list {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      text-align: left;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    
    .failure-type {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background-color: #ffebee;
      color: #e53935;
    }
  </style>
</head>
<body>
  <div id="container">
    <h1>System Intent Visualization</h1>
    <p class="subtitle">Mapping the architecture's meaning and relationships</p>
    
    <div class="stats">
      <div class="stat-box">
        <p class="stat-number ${nodes.length > 30 ? 'medium' : 'ok'}">${nodes.length}</p>
        <p>Total Components</p>
      </div>
      <div class="stat-box">
        <p class="stat-number ${silentFailureCount > 0 ? 'warning' : 'ok'}">${silentFailureCount}</p>
        <p>Silent Failures</p>
      </div>
      <div class="stat-box">
        <p class="stat-number ${emptyNodesCount > 5 ? 'warning' : emptyNodesCount > 0 ? 'medium' : 'ok'}">${emptyNodesCount}</p>
        <p>Empty Components</p>
      </div>
    </div>
    
    <div class="graph-container">
      <div id="visualization"></div>
      <div class="tooltip"></div>
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background-color: #3498db;"></div>
        <span>Page</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #2ecc71;"></div>
        <span>Component</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #9b59b6;"></div>
        <span>Layout</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #f1c40f;"></div>
        <span>API</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #e74c3c;"></div>
        <span>Store/Context</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: rgba(0,0,0,0.3);"></div>
        <span>Empty Component</span>
      </div>
    </div>
    
    <div class="silent-failures">
      <h2>Silent Failures</h2>
      <div class="failure-list">
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody id="failures-table">
            <!-- Will be filled by JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <script>
    // Node and edge data from the analysis
    const nodes = ${nodesJson};
    const links = ${edgesJson};
    
    // Setup the visualization
    const width = document.querySelector('#visualization').clientWidth;
    const height = document.querySelector('#visualization').clientHeight;
    
    // Create SVG
    const svg = d3.select('#visualization')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Define forces
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2);
    
    // Create node groups
    const node = svg.append('g')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', d => 'node node-' + d.type + (d.hasContent ? '' : ' node-hollow'))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.silentFailures.length > 0 ? 12 : 8)
      .attr('stroke', d => d.silentFailures.length > 0 ? '#e74c3c' : '#fff');
    
    // Add text labels to nodes
    node.append('text')
      .attr('dx', 15)
      .attr('dy', 4)
      .text(d => d.name);
    
    // Create tooltip
    const tooltip = d3.select('.tooltip');
    
    // Add hover effects
    node.on('mouseover', function(event, d) {
      // Highlight node
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', d.silentFailures.length > 0 ? 16 : 12);
      
      // Show tooltip with info
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      
      let tooltipContent = \`
        <strong>\${d.name}</strong><br>
        Type: \${d.type}<br>
        Path: \${d.filePath}<br>
        Content: \${d.hasContent ? 'Yes' : 'Empty'}<br>
      \`;
      
      if (d.silentFailures.length > 0) {
        tooltipContent += \`<strong>Silent Failures:</strong><br>\`;
        d.silentFailures.forEach(failure => {
          tooltipContent += \`- \${failure.description}<br>\`;
        });
      }
      
      tooltip.html(tooltipContent)
        .style('left', (event.pageX - document.querySelector('#container').offsetLeft + 10) + 'px')
        .style('top', (event.pageY - document.querySelector('#container').offsetTop - 28) + 'px');
    })
    .on('mouseout', function() {
      // Reset node size
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', d => d.silentFailures.length > 0 ? 12 : 8);
      
      // Hide tooltip
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });
    
    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Fill failures table
    const failuresTable = document.getElementById('failures-table');
    let failuresHTML = '';
    
    // Flatten all silent failures across nodes
    const allFailures = nodes.flatMap(node => {
      return node.silentFailures.map(failure => ({
        component: node.name,
        path: node.filePath,
        type: failure.type,
        description: failure.description
      }));
    });
    
    if (allFailures.length === 0) {
      failuresHTML = '<tr><td colspan="3">No silent failures detected!</td></tr>';
    } else {
      allFailures.forEach(failure => {
        failuresHTML += \`
          <tr>
            <td>\${failure.component} <span style="color:#777;font-size:12px;">\${failure.path}</span></td>
            <td><span class="failure-type">\${failure.type}</span></td>
            <td>\${failure.description}</td>
          </tr>
        \`;
      });
    }
    
    failuresTable.innerHTML = failuresHTML;
  </script>
</body>
</html>
  `;
  
  // Save the visualization to a file
  fs.writeFileSync(path.join(process.cwd(), 'intent-visualization.html'), html);
}

// Main function
async function visualizeIntent() {
  console.log(chalk.blue.bold('🔍 Generating Intent Visualization'));
  console.log(chalk.blue('Analyzing component relationships and detecting silent failures...'));
  
  try {
    // Generate graph data
    const graph = await generateIntentGraph();
    
    // Generate visualization
    generateVisualization(graph);
    
    console.log(chalk.green('\n✅ Intent visualization generated successfully!'));
    console.log(chalk.blue(`Generated intent-visualization.html with ${graph.nodes.length} components and ${graph.edges.length} relationships`));
    console.log(chalk.yellow('\nOpen the HTML file in your browser to explore the visualization.'));
    
    // Summary
    const silentFailureCount = graph.nodes.reduce((count, node) => count + node.silentFailures.length, 0);
    const emptyNodesCount = graph.nodes.filter(n => !n.hasContent).length;
    
    console.log(chalk.magenta.bold('\n📊 Intent Health Summary:'));
    if (silentFailureCount === 0 && emptyNodesCount === 0) {
      console.log(chalk.green('Your system appears to have clear intent with no silent failures!'));
    } else {
      if (silentFailureCount > 0) {
        console.log(chalk.yellow(`⚠️  Found ${silentFailureCount} potential silent failures that could affect user experience.`));
      }
      
      if (emptyNodesCount > 0) {
        console.log(chalk.yellow(`⚠️  Found ${emptyNodesCount} components that appear to be empty or lacking meaningful content.`));
      }
    }
    
    // Reflection prompts
    console.log(chalk.magenta.bold('\n🤔 Reflection Questions:'));
    console.log(chalk.magenta('1. Which areas of your application express clear intent, and which ones are silent?'));
    console.log(chalk.magenta('2. Are the most critical user flows represented by strong, meaningful components?'));
    console.log(chalk.magenta('3. Where could you add more expressiveness to your system?'));
    
  } catch (error) {
    console.error('Error generating intent visualization:', error);
    process.exit(1);
  }
}

// Run the visualization generator
visualizeIntent(); 