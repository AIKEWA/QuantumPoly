'use client';

/* eslint-disable no-duplicate-imports */
import { useTranslations } from 'next-intl';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Recharts types missing these exports in this version
import { ReferenceLine, Label } from 'recharts';

const data = [
  { month: '2025-01', eii: 85, consensus: 90 },
  { month: '2025-02', eii: 88, consensus: 92 },
  { month: '2025-03', eii: 87, consensus: 91 },
  { month: '2025-04', eii: 82, consensus: 85, event: 'Policy Update' },
  { month: '2025-05', eii: 89, consensus: 93 },
  { month: '2025-06', eii: 91, consensus: 95 },
  { month: '2025-07', eii: 90, consensus: 94 },
  { month: '2025-08', eii: 92, consensus: 96 },
  { month: '2025-09', eii: 94, consensus: 97 },
  { month: '2025-10', eii: 93, consensus: 96 },
  { month: '2025-11', eii: 91, consensus: 94, event: 'Human Override' },
  { month: '2025-12', eii: 95, consensus: 98 },
];

export const EthicalDriftChart = () => {
  const t = useTranslations('observatory.drift');

  return (
    <div className="h-[400px] w-full rounded-lg bg-slate-50 p-4 shadow-sm dark:bg-slate-900">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
        {t('title')}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ value: t('xAxis'), position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            domain={[60, 100]}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ value: t('yAxis'), angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="eii"
            stroke="#3b82f6"
            strokeWidth={3}
            activeDot={{ r: 8 }}
            name="EII"
          />
          <Line
            type="monotone"
            dataKey="consensus"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Consensus"
          />

          {/* Annotations for events */}
          <ReferenceLine x="2025-04" stroke="red" strokeDasharray="3 3">
            <Label value={t('annotations.policy')} position="top" fill="#ef4444" fontSize={10} />
          </ReferenceLine>
          <ReferenceLine x="2025-11" stroke="orange" strokeDasharray="3 3">
            <Label value={t('annotations.override')} position="top" fill="#f97316" fontSize={10} />
          </ReferenceLine>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
