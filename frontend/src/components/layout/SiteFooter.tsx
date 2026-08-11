import Link from 'next/link';
import {
  MAINTAINER,
  MAINTAINER_URL,
  UPSTREAM_REPO_LABEL,
  UPSTREAM_REPO_URL,
} from '@/config';

const LINKS = [
  { href: '/surahs', label: 'Sureler' },
  { href: '/roots', label: 'Kelime Kökleri' },
  { href: '/search', label: 'Arama' },
  { href: '/notes', label: 'Notlarım' },
  { href: '/kaynaklar', label: 'Kaynaklar' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line pb-24 lg:pb-0">
      <div className="mx-auto flex max-w-[84rem] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="text-sm font-semibold text-ink">
            Kuran <span className="text-accent">Rehberi</span>
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
            Açık kaynak Kuran araştırma platformu. Metin, meal ve morfoloji verilerinin kaynakları{' '}
            <Link href="/kaynaklar" className="text-accent hover:underline">
              Kaynaklar
            </Link>{' '}
            sayfasında listelenmiştir.
          </p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-ink-faint">
            Ana proje{' '}
            <a
              href={UPSTREAM_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {UPSTREAM_REPO_LABEL}
            </a>
            . Bu sürüme{' '}
            <a
              href={MAINTAINER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {MAINTAINER}
            </a>{' '}
            destek oldu.
          </p>
        </div>

        <nav aria-label="Alt bilgi menüsü" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-ink-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={UPSTREAM_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-muted transition-colors hover:text-accent"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
