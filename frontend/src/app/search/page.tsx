'use client';

import { Suspense } from 'react';
import { LoadingState } from '@/components/ui';
import { SearchView } from '@/features/search/SearchView';

export default function SearchPage() {
  // useSearchParams statik dışa aktarımda Suspense sınırı gerektirir.
  return (
    <Suspense fallback={<LoadingState label="Arama hazırlanıyor..." />}>
      <SearchView />
    </Suspense>
  );
}
