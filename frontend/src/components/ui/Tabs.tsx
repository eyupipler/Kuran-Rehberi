'use client';

import type { ReactNode } from 'react';

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

export function Tabs<T extends string>({
  label,
  value,
  items,
  onChange,
  trailing,
}: {
  label: string;
  value: T;
  items: TabItem<T>[];
  onChange: (value: T) => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 border-b border-line">
      <div role="tablist" aria-label={label} className="flex min-w-0 flex-1 gap-6 overflow-x-auto">
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => onChange(item.value)}
              className={`-mb-px flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 pt-1 text-sm font-medium transition-colors duration-150 ${
                selected
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="text-xs tabular-nums text-ink-faint">{item.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {trailing && <div className="flex flex-shrink-0 items-center gap-2 pb-2">{trailing}</div>}
    </div>
  );
}
