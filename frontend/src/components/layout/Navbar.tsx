'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconButton } from '@/components/ui';
import { HeartIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NAV_ITEMS, isActivePath } from '@/components/layout/navigation';
import { useFavorites } from '@/context/FavoritesContext';

export function Navbar({
  onOpenSettings,
  onOpenPalette,
}: {
  onOpenSettings: () => void;
  onOpenPalette: () => void;
}) {
  const pathname = usePathname() || '/';
  const { favorites, panelOpen, setPanelOpen } = useFavorites();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas">
      <div className="mx-auto flex h-16 max-w-[84rem] items-center gap-8 px-5 sm:px-8">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-sm object-cover"
          />
          <span className="text-[0.9375rem] font-semibold tracking-tight text-ink">
            Kuran <span className="text-accent">Rehberi</span>
          </span>
        </Link>

        {/* Alt çizgi göstergeli düz menü */}
        <nav aria-label="Ana menü" className="hidden h-full flex-1 items-stretch gap-7 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`-mb-px flex items-center border-b-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'border-accent text-accent'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden h-9 items-center gap-2 rounded-sm border border-line px-3 text-sm text-ink-faint transition-colors hover:border-accent hover:text-ink md:flex"
          >
            <SearchIcon className="h-4 w-4" />
            <span>Ara</span>
            <kbd className="border-l border-line pl-2 font-sans text-[10px] font-medium">Ctrl K</kbd>
          </button>

          <IconButton label="Hızlı ara" onClick={onOpenPalette} className="md:hidden">
            <SearchIcon className="h-5 w-5" />
          </IconButton>

          <ThemeToggle />

          <div className="relative">
            <IconButton
              label="Favoriler"
              active={panelOpen}
              onClick={() => setPanelOpen(!panelOpen)}
            >
              <HeartIcon className="h-5 w-5" filled={panelOpen} />
            </IconButton>
            {favorites.length > 0 && (
              <span className="pointer-events-none absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-sm bg-accent px-1 text-[10px] font-bold leading-none text-accent-contrast">
                {favorites.length > 99 ? '99+' : favorites.length}
              </span>
            )}
          </div>

          <IconButton label="Ayarlar" onClick={onOpenSettings}>
            <SettingsIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
