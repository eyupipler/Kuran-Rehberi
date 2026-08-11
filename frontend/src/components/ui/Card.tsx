import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-sm border border-line bg-surface ${
        interactive ? 'transition-colors duration-150 hover:border-accent' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

type BadgeTone = 'neutral' | 'accent' | 'marker';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  accent: 'bg-accent-soft text-accent-ink',
  marker: 'bg-marker text-marker-ink',
};

export function Badge({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function VerseNumber({ value, active = false }: { value: number | string; active?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-sm px-1.5 text-xs font-semibold tabular-nums ${
        active ? 'bg-accent text-accent-contrast' : 'bg-accent-soft text-accent-ink'
      }`}
    >
      {value}
    </span>
  );
}
