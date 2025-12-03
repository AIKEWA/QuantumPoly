import { useTranslations } from 'next-intl';
import React from 'react';

interface ProofLensProps {
  hash: string;
  blockHeight: number;
  status?: 'verified' | 'pending';
}

export const ProofLens: React.FC<ProofLensProps> = ({ hash, blockHeight, status = 'verified' }) => {
  const t = useTranslations('observatory.proof');

  const truncatedHash = `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  const isVerified = status === 'verified';

  return (
    <div className="group relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <span
        className={`h-2 w-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}
      ></span>
      <span>{truncatedHash}</span>
      <span className="text-slate-400">#{blockHeight}</span>

      {/* Tooltip / Lens Overlay */}
      <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-xl group-hover:block dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
          <span className="font-sans font-semibold text-slate-900 dark:text-white">
            {t('label')}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
          >
            {t(status)}
          </span>
        </div>
        <div className="space-y-2">
          <div className="break-all font-mono text-[10px] leading-tight text-slate-500">{hash}</div>
          <a
            href={`/api/observatory/verify/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded bg-blue-600 px-2 py-1.5 text-center font-sans text-xs font-medium text-white hover:bg-blue-700"
          >
            {t('verify')}
          </a>
        </div>
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"></div>
      </div>
    </div>
  );
};
