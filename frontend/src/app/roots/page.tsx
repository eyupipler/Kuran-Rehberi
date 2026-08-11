'use client';

import { Suspense } from 'react';
import { LoadingState } from '@/components/ui';
import { RootsBrowser } from '@/features/roots/RootsBrowser';

export default function RootsPage() {
  // useSearchParams statik dışa aktarımda Suspense sınırı gerektirir.
  return (
    <Suspense fallback={<LoadingState label="Kökler hazırlanıyor..." />}>
      <RootsBrowser />
    </Suspense>
  );
}
