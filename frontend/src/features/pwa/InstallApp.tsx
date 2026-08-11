'use client';

import { Button } from '@/components/ui';
import { DownloadIcon } from '@/components/ui/icons';
import { useInstallPrompt } from '@/features/pwa/useServiceWorker';

export function InstallApp() {
  const { canInstall, installed, install } = useInstallPrompt();

  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-ink-muted">
        Uygulamayı cihazınıza kurabilirsiniz. Daha önce açtığınız sureler ve ayetler internet
        bağlantısı olmadan da okunabilir.
      </p>

      {installed ? (
        <p className="text-xs text-accent">Uygulama bu cihaza kurulu.</p>
      ) : canInstall ? (
        <Button size="sm" variant="primary" onClick={install}>
          <DownloadIcon className="h-4 w-4" />
          Uygulamayı kur
        </Button>
      ) : (
        <p className="text-xs text-ink-faint">
          Tarayıcınız kurulumu desteklemiyorsa menüden &ldquo;Ana ekrana ekle&rdquo; seçeneğini
          kullanabilirsiniz.
        </p>
      )}
    </div>
  );
}
