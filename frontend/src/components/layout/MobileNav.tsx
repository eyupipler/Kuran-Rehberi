'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, isActivePath } from '@/components/layout/navigation';

export function MobileNav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname() || '/';

  return (
    <nav
      aria-label="Alt menü"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item);
          const isSearch = item.href === '/search';
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={
                  isSearch
                    ? (event) => {
                        // Mobilde arama sekmesi hızlı arama penceresini açar.
                        event.preventDefault();
                        onOpenPalette();
                      }
                    : undefined
                }
                className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-1 border-t-2 px-1 text-[10px] font-medium transition-colors duration-150 ${
                  active ? 'border-accent text-accent' : 'border-transparent text-ink-faint'
                }`}
              >
                <item.Icon className="h-5 w-5" />
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
