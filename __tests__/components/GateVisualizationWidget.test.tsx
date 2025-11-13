import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GateVisualizationWidget from '../../src/components/dashboard/GateVisualizationWidget';

describe('GateVisualizationWidget', () => {
  it('renders the widget title', () => {
    render(<GateVisualizationWidget />);
    expect(screen.getByText('Gate Visualization')).toBeInTheDocument();
  });

  it('renders all the gates', () => {
    render(<GateVisualizationWidget />);
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
    expect(screen.getByText('CNOT')).toBeInTheDocument();
  });

  it('shows a tooltip on mouse enter', () => {
    render(<GateVisualizationWidget />);
    const hGate = screen.getByText('H');
    fireEvent.mouseEnter(hGate);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Hadamard Gate');
  });

  it('hides the tooltip on mouse leave', () => {
    render(<GateVisualizationWidget />);
    const hGate = screen.getByText('H');
    fireEvent.mouseEnter(hGate);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseLeave(hGate);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows a tooltip on key down', () => {
    render(<GateVisualizationWidget />);
    const hGate = screen.getByText('H').parentElement;
    if(hGate) {
        fireEvent.keyDown(hGate, { key: 'Enter', code: 'Enter' });
        expect(screen.getByRole('tooltip')).toHaveTextContent('Hadamard Gate');
    }
  });
});
