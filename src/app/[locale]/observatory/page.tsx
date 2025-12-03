import { useTranslations } from 'next-intl';
import React from 'react';

import { EthicalDriftChart } from '@/components/observatory/EthicalDriftChart';
import { GlobalIntegrityMap } from '@/components/observatory/GlobalIntegrityMap';
import { ProofLens } from '@/components/observatory/ProofLens';
import { getRegistryStats, getStandardsList } from '@/lib/ogp/registry-client';

export default async function ObservatoryPage() {
  const t = useTranslations('observatory');
  const stats = await getRegistryStats();
  const standards = await getStandardsList();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
          <div className="mt-6 flex justify-center">
            <ProofLens
              hash="ff122f96f9c6e47d389a6f02b0157b6bd78a35d8557b9bd6c995e5d1b6c7acf4"
              blockHeight={89012}
            />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top Row: Map - Spans full width on mobile, half on large */}
          <div className="lg:col-span-2">
            <GlobalIntegrityMap />
          </div>

          {/* OGP Registry Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                OGP Standards Registry
              </h2>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                Active • v{stats.latestVersion}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Version
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                  {standards.map((std) => (
                    <tr key={std.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {std.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {std.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {std.version}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            std.status === 'RATIFIED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Second Row: Charts & Metrics */}
          <div className="lg:col-span-2">
            <EthicalDriftChart />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800">
          QuantumPoly Observatory • v0.1.0-beta • Block 12.2
        </div>
      </div>
    </main>
  );
}
