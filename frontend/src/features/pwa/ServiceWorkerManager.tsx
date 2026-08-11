'use client';

import { Button } from '@/components/ui';
import { useServiceWorker } from '@/features/pwa/useServiceWorker';

export function ServiceWorkerManager() {
  const { updateAvailable, applyUpdate } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-20 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-sm bg-surface p-3 border border-line shadow-overlay lg:bottom-6"
    >
      <p className="min-w-0 flex-1 text-sm text-ink">
        Yeni sürüm hazır.
        <span className="block text-xs text-ink-faint">Yenileyerek güncelleyebilirsiniz.</span>
      </p>
      <Button size="sm" variant="primary" onClick={applyUpdate}>
        Yenile
      </Button>
    </div>
  );
}
