
import { render, screen } from '@testing-library/react';
import React from 'react';

import { ConsentMetrics } from '@/components/dashboard/ConsentMetrics';
import { EIIChart } from '@/components/dashboard/EiiChart';
import { calculateEII, formatEII, EII_WEIGHTS } from '@/lib/integrity/metrics/eii';
import { EIIHistory, ConsentMetrics as ConsentMetricsType } from '@/types/integrity';

// Mock Recharts to avoid SVG rendering issues in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ data, children }: { data: Record<string, unknown>[]; children: React.ReactNode }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Line: ({ dataKey, name, stroke }: any) => (
    <div data-testid={`line-${dataKey}`} data-name={name} data-stroke={stroke} />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: { data: unknown[] }) => <div data-testid="pie" data-pie-data={JSON.stringify(data)} />,
  Cell: () => null,
}));

describe('Dashboard Metrics & Visualization Audit', () => {
  
  describe('Metric Calculation Integrity (calculateEII)', () => {
    it('should calculate weighted average correctly', () => {
      const metrics = {
        security: 100,
        accessibility: 100,
        transparency: 100,
        privacy: 100,
      };
      
      const expected = 
        100 * EII_WEIGHTS.security +
        100 * EII_WEIGHTS.accessibility +
        100 * EII_WEIGHTS.transparency +
        100 * EII_WEIGHTS.compliance;

      expect(calculateEII(metrics)).toBe(expected);
      expect(calculateEII(metrics)).toBe(100);
    });

    it('should handle partial metrics and fallback to 0', () => {
      const metrics = {
        security: 80,
        // accessibility missing
        transparency: 90,
        privacy: 70,
      };
      // Accessibility defaults to 0
      // 20 + 0 + 22.5 + 17.5 = 60
      expect(calculateEII(metrics)).toBe(60);
    });

    it('should round to 1 decimal place', () => {
       const metrics = {
        security: 33,
        accessibility: 33,
        transparency: 33,
        privacy: 33,
      };
      // 33 * 1 = 33
      expect(calculateEII(metrics)).toBe(33);
      
      const unevenMetrics = {
          security: 81,
          accessibility: 82,
          transparency: 81,
          privacy: 81
      };
      // Avg: 81.25 -> Round to 81.3
      expect(calculateEII(unevenMetrics)).toBe(81.3);
    });
  });

  describe('Visual Formatting Integrity (formatEII)', () => {
    it('should return correct color and label for Excellent scores (90-100)', () => {
      const result = formatEII(95);
      expect(result).toEqual({ value: '95.0', color: 'green', label: 'Excellent' });
    });

    it('should return correct color and label for Good scores (80-89)', () => {
      const result = formatEII(85);
      expect(result).toEqual({ value: '85.0', color: 'blue', label: 'Good' });
    });

    it('should return correct color and label for Fair scores (70-79)', () => {
      const result = formatEII(75);
      expect(result).toEqual({ value: '75.0', color: 'yellow', label: 'Fair' });
    });

    it('should return correct color and label for Poor scores (<70)', () => {
      const result = formatEII(60);
      expect(result).toEqual({ value: '60.0', color: 'red', label: 'Needs Improvement' });
    });
  });

  describe('EIIChart Component', () => {
    
    const mockHistory: EIIHistory = {
        dataPoints: [
            { date: '2023-01-01', eii: 80, commit: 'a', metrics: {} },
            { date: '2023-01-02', eii: 82, commit: 'b', metrics: {} },
            { date: '2023-01-03', eii: 85, commit: 'c', metrics: {} },
        ],
        rollingAverage: [
            { date: '2023-01-01', average: 80 },
            { date: '2023-01-02', average: 81 },
            { date: '2023-01-03', average: 82.3 },
        ],
        current: 85.0,
        average: 82.3,
        min: 80.0,
        max: 85.0,
        trend: 'up'
    };

    const emptyHistory: EIIHistory = {
        dataPoints: [],
        rollingAverage: [],
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        trend: 'stable'
    };

    it('renders correctly with data', () => {
      render(<EIIChart history={mockHistory} height={300} />);
      
      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();
      
      // Check if data is passed to chart
      const chartData = JSON.parse(chart.getAttribute('data-chart-data') || '[]');
      expect(chartData).toHaveLength(3);
      expect(chartData[0].eii).toBe(80);
      expect(chartData[2].average).toBe(82.3);
    });

    it('renders empty state when no data', () => {
      render(<EIIChart history={emptyHistory} />);
      expect(screen.getByText(/No EII data available/i)).toBeInTheDocument();
    });

    it('renders summary statistics correctly', () => {
      render(<EIIChart history={mockHistory} />);
      
      // Use getAllByText for values that appear multiple times (like Max and Current being same)
      const maxValues = screen.getAllByText('85.0');
      expect(maxValues.length).toBeGreaterThanOrEqual(2); // Current + Max
      
      expect(screen.getByText('82.3')).toBeInTheDocument(); // Average
      expect(screen.getByText('80.0')).toBeInTheDocument(); // Min
    });
  });

  describe('ConsentMetrics Component', () => {
    const mockMetrics: ConsentMetricsType = {
      totalEvents: 100,
      totalUsers: 50,
      consentGiven: 80,
      consentRevoked: 10,
      consentUpdated: 10,
      categoryMetrics: {
        essential: { optIn: 50, optOut: 0, rate: 100 },
        analytics: { optIn: 25, optOut: 25, rate: 50 },
        performance: { optIn: 10, optOut: 40, rate: 20 },
      },
      timeSeriesData: [],
      lastUpdate: '2023-01-01T00:00:00Z',
    };

    it('renders key summary metrics', () => {
      render(<ConsentMetrics metrics={mockMetrics} />);
      
      expect(screen.getByText('50')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('80')).toBeInTheDocument(); // Given
      
      // Updated and Revoked are both 10
      const tens = screen.getAllByText('10');
      expect(tens.length).toBeGreaterThanOrEqual(2);
    });

    it('displays correct opt-in rates', () => {
      render(<ConsentMetrics metrics={mockMetrics} />);
      
      expect(screen.getByText('100.0%')).toBeInTheDocument(); // Essential
      expect(screen.getByText('50.0%')).toBeInTheDocument(); // Analytics
      expect(screen.getByText('20.0%')).toBeInTheDocument(); // Performance
    });

    it('passes correct data to PieChart', () => {
      render(<ConsentMetrics metrics={mockMetrics} />);
      
      const pie = screen.getByTestId('pie');
      const pieData = JSON.parse(pie.getAttribute('data-pie-data') || '[]');
      
      expect(pieData).toHaveLength(3);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(pieData.find((d: any) => d.name === 'Essential').value).toBe(50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(pieData.find((d: any) => d.name === 'Analytics').value).toBe(25);
    });

    it('handles zero users gracefully (divide by zero protection)', () => {
      const zeroMetrics = {
        ...mockMetrics,
        totalUsers: 0,
        categoryMetrics: {
            essential: { optIn: 0, optOut: 0, rate: 0 },
            analytics: { optIn: 0, optOut: 0, rate: 0 },
            performance: { optIn: 0, optOut: 0, rate: 0 },
        }
      };
      
      render(<ConsentMetrics metrics={zeroMetrics} />);
      
      const rates = screen.getAllByText('0.0%');
      expect(rates.length).toBeGreaterThanOrEqual(3);
    });
  });
});

