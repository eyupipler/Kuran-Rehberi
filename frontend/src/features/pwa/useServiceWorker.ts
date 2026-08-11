'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Service worker kaydı. Yalnızca production derlemesinde ve güvenli bağlamda çalışır;
 * geliştirme sunucusunda kayıt yapılmaz ki eski varlıklar önbellekten servis edilmesin.
 */
export function useServiceWorker() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const onUpdateFound = () => {
      const installing = registration?.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        // Zaten bir kontrolcü varsa yeni sürüm beklemeye alınmış demektir.
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          setWaitingWorker(installing);
        }
      });
    };

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) setWaitingWorker(reg.waiting);
        reg.addEventListener('updatefound', onUpdateFound);
      })
      .catch(() => {
        // Kayıt başarısız olursa uygulama çevrimiçi olarak normal çalışmaya devam eder.
      });

    return () => registration?.removeEventListener('updatefound', onUpdateFound);
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    waitingWorker.postMessage('skip-waiting');
    waitingWorker.addEventListener('statechange', () => {
      if (waitingWorker.state === 'activated') window.location.reload();
    });
  }, [waitingWorker]);

  return { updateAvailable: waitingWorker !== null, applyUpdate };
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Tarayıcı "ana ekrana ekle" istemini yakalar; desteklenmiyorsa buton gizlenir. */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setPromptEvent(null);
  }, [promptEvent]);

  return { canInstall: promptEvent !== null, installed, install };
}
