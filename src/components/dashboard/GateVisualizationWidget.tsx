import React, { useState, KeyboardEvent } from 'react';

// Define a type for the gate data for better type-checking and readability
type Gate = {
  id: string;
  name: string;
  state: 'active' | 'inactive' | 'error';
  tooltip: string;
};

// Placeholder data for the gates
const initialGates: Gate[] = [
  {
    id: 'h-01',
    name: 'H',
    state: 'active',
    tooltip: 'Hadamard Gate - Creates a superposition of states.',
  },
  { id: 'x-01', name: 'X', state: 'inactive', tooltip: 'Pauli-X Gate - Bit-flip.' },
  { id: 'y-01', name: 'Y', state: 'active', tooltip: 'Pauli-Y Gate - Bit and phase-flip.' },
  { id: 'z-01', name: 'Z', state: 'error', tooltip: 'Pauli-Z Gate - Phase-flip.' },
  {
    id: 'cnot-01',
    name: 'CNOT',
    state: 'active',
    tooltip: 'Controlled-NOT Gate - Entangles two qubits.',
  },
];

export const GateVisualizationWidget = () => {
  const [gates] = useState<Gate[]>(initialGates);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleMouseEnter = (tooltip: string) => {
    setActiveTooltip(tooltip);
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, tooltip: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      setActiveTooltip(tooltip);
    }
  };

  const getGateColor = (state: Gate['state']) => {
    switch (state) {
      case 'active':
        return 'bg-gate-viz-active';
      case 'inactive':
        return 'bg-gate-viz-inactive';
      case 'error':
        return 'bg-gate-viz-error';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="rounded-lg bg-gate-viz-background p-4 text-gate-viz-text">
      <h2 className="mb-4 text-lg font-bold">Gate Visualization</h2>
      <div className="flex space-x-2">
        {gates.map((gate) => (
          <div
            key={gate.id}
            className={`relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-md ${getGateColor(gate.state)}`}
            onMouseEnter={() => handleMouseEnter(gate.tooltip)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => handleKeyDown(e, gate.tooltip)}
            aria-label={`Quantum Gate: ${gate.name}. State: ${gate.state}. ${gate.tooltip}`}
            role="button"
            tabIndex={0}
          >
            <span className="font-mono text-lg">{gate.name}</span>
          </div>
        ))}
      </div>
      {activeTooltip && (
        <div className="absolute mt-2 rounded-md bg-gate-viz-tooltip-bg p-2 text-sm" role="tooltip">
          {activeTooltip}
        </div>
      )}
    </div>
  );
};
