'use client';

import { getRoot } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

/** Seçili kelimenin kökü için ayet geçişlerini getirir. */
export function useRootOccurrences(root: string | null, translator: string) {
  return useAsync(
    (signal) => getRoot(root!, { translator }, { signal }),
    [root, translator],
    { enabled: Boolean(root) }
  );
}
