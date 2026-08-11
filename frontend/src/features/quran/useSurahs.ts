'use client';

import { useEffect, useState } from 'react';
import { errorMessage, getSurahs } from '@/lib/api';
import type { Surah } from '@/lib/api';

// Sure listesi her sayfada gerekiyor ve hiç değişmiyor; tek istekle paylaşılır.
let cache: Surah[] | null = null;
let inflight: Promise<Surah[]> | null = null;

function loadSurahs(): Promise<Surah[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getSurahs()
      .then((data) => {
        cache = [...data].sort((a, b) => a.id - b.id);
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useSurahs() {
  const [surahs, setSurahs] = useState<Surah[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache) {
      setSurahs(cache);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    loadSurahs()
      .then((data) => {
        if (!active) return;
        setSurahs(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(errorMessage(err));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  return { surahs, loading, error, reload: () => setAttempt((n) => n + 1) };
}

export function findSurah(surahs: Surah[], id: number): Surah | undefined {
  return surahs.find((surah) => surah.id === id);
}
