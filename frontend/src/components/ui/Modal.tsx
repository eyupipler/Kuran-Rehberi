'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { IconButton } from './Button';
import { CloseIcon } from './icons';

function useDismissable(open: boolean, onClose: () => void) {
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusTo.current?.focus?.();
    };
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  headerExtra,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useDismissable(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg animate-fade-up flex-col rounded-none bg-surface border border-line shadow-overlay sm:rounded-sm"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-faint">{description}</p>}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {headerExtra}
            <IconButton label="Kapat" size="sm" onClick={onClose}>
              <CloseIcon className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Masaüstünde sağdan açılan panel, mobilde alttan gelen sheet. */
export function SidePanel({
  open,
  onClose,
  title,
  headerExtra,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  useDismissable(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-none bg-surface border border-line shadow-overlay sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[26rem] sm:rounded-none"
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <div className="flex items-center gap-1">
            {headerExtra}
            <IconButton label="Kapat" size="sm" onClick={onClose}>
              <CloseIcon className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
