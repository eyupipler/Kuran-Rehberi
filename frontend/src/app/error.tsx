'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { WarningIcon } from '@/components/ui/icons';

/**
 * Beklenmeyen bir render hatasında tüm sayfanın boş kalmasını engeller.
 * Hata sessizce yutulmaz; konsola yazılır ve kullanıcıya kurtarma yolu sunulur.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Sayfa hatası:', error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <WarningIcon className="h-9 w-9 text-danger" />
      <h1 className="text-lg font-semibold text-ink">Bu sayfa görüntülenemedi</h1>
      <p className="text-sm leading-relaxed text-ink-muted">
        Beklenmeyen bir hata oluştu. Sayfayı yeniden deneyebilir ya da ana sayfaya dönebilirsiniz.
        Notlarınız ve favorileriniz etkilenmedi.
      </p>
      <div className="mt-2 flex gap-2">
        <Button variant="primary" size="sm" onClick={reset}>
          Tekrar dene
        </Button>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-sm bg-surface-sunken px-3 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
        >
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
