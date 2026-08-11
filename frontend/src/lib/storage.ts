'use client';

import { useCallback, useEffect, useState } from 'react';

export const STORAGE_KEYS = {
  settings: 'kuran-rehberi-settings',
  theme: 'kuran-rehberi-theme',
  notes: 'kuran-rehberi-notes',
  favorites: 'kuran-rehberi-favorites',
  collections: 'kuran-rehberi-collections',
  history: 'kuran-rehberi-history',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Kota dolu veya depolama kapalı — kullanıcı akışını kesmeye değmez.
  }
}

/**
 * localStorage destekli state. İlk render sunucu çıktısıyla aynı kalsın diye
 * kayıtlı değer effect içinde okunur; `hydrated` bunun tamamlandığını bildirir.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (hydrated) writeStorage(key, value);
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return { value, setValue, hydrated, reset };
}
