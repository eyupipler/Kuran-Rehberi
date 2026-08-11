import type { ReactNode } from 'react';
import { Button } from './Button';
import { WarningIcon } from './icons';

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Yükleniyor"
      className={`inline-block animate-spin rounded-full border-2 border-accent-soft border-t-accent ${className}`}
    />
  );
}

export function LoadingState({ label = 'Yükleniyor...', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-ink-faint ${
        compact ? 'py-12' : 'py-24'
      }`}
    >
      <Spinner className={compact ? 'h-6 w-6' : 'h-9 w-9'} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function StateIcon({ children, tone }: { children: ReactNode; tone: 'accent' | 'danger' }) {
  return (
    <span
      className={`mb-1 inline-flex h-16 w-16 items-center justify-center rounded-full ${
        tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent'
      }`}
    >
      {children}
    </span>
  );
}

export function ErrorState({
  message,
  onRetry,
  hint,
}: {
  message: string;
  onRetry?: () => void;
  hint?: string;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <StateIcon tone="danger">
        <WarningIcon className="h-7 w-7" />
      </StateIcon>
      <p className="text-base font-semibold text-ink">{message}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-2">
          Tekrar dene
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-20 text-center">
      {icon && <StateIcon tone="accent">{icon}</StateIcon>}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
