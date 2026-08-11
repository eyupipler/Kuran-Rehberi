'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { FavoritesPanel } from '@/components/layout/FavoritesPanel';
import { MobileNav } from '@/components/layout/MobileNav';
import { Navbar } from '@/components/layout/Navbar';
import { SettingsPanel } from '@/components/layout/SettingsPanel';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SurahSidebar } from '@/components/layout/SurahSidebar';
import { ServiceWorkerManager } from '@/features/pwa/ServiceWorkerManager';

function isReadingRoute(pathname: string): boolean {
  return pathname.startsWith('/surah/') || pathname.startsWith('/verse/');
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const withSidebar = isReadingRoute(pathname);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only sr-only-focusable rounded-sm bg-accent text-accent-contrast"
      >
        İçeriğe geç
      </a>

      <Navbar onOpenSettings={() => setSettingsOpen(true)} onOpenPalette={openPalette} />

      <div className="mx-auto flex w-full max-w-[84rem]">
        {withSidebar && <SurahSidebar />}
        {/* Alt boşluk mobilde sabit navigasyonun altında kalmayı önler. */}
        <main
          id="main"
          className="min-w-0 flex-1 px-5 pb-24 pt-8 sm:px-8 lg:pb-16"
        >
          {children}
        </main>
      </div>

      <SiteFooter />
      <MobileNav onOpenPalette={openPalette} />

      <FavoritesPanel />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ServiceWorkerManager />
    </>
  );
}
