'use client';

import Link from 'next/link';
import type { RootDistribution as Distribution } from '@/lib/api';

export function RootDistributionChart({ distribution }: { distribution: Distribution[] }) {
  if (distribution.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-faint">Dağılım verisi bulunamadı.</p>;
  }

  const max = distribution[0].count;
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">
        <strong className="text-ink">{total}</strong> kullanım,{' '}
        <strong className="text-ink">{distribution.length}</strong> sureye dağılıyor.
      </p>

      <ul className="space-y-1.5">
        {distribution.map((item) => (
          <li key={item.surahId} className="flex items-center gap-3">
            <Link
              href={`/surah/${item.surahId}`}
              className="w-36 flex-shrink-0 truncate text-sm text-accent hover:underline sm:w-44"
            >
              <span className="mr-1.5 text-xs tabular-nums text-ink-faint">{item.surahId}.</span>
              {item.surahName}
            </Link>

            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded bg-surface-sunken">
              <div
                className="flex h-full items-center justify-end rounded bg-accent pr-1.5"
                style={{ width: `${Math.max(6, (item.count / max) * 100)}%` }}
              >
                <span className="text-[10px] font-medium tabular-nums text-accent-contrast">
                  {item.count}
                </span>
              </div>
            </div>

            <span className="w-14 flex-shrink-0 text-right text-xs text-ink-faint">
              {item.revelationType ?? ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
