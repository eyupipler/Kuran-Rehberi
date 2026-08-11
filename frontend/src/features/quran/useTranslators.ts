'use client';

import { useEffect, useMemo, useState } from 'react';
import { errorMessage, getTranslators } from '@/lib/api';
import type { Translator } from '@/lib/api';

let cache: Translator[] | null = null;
let inflight: Promise<Translator[]> | null = null;

function loadTranslators(): Promise<Translator[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getTranslators()
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useTranslators() {
  const [translators, setTranslators] = useState<Translator[]>(cache ?? []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    loadTranslators()
      .then((data) => active && setTranslators(data))
      .catch((err) => active && setError(errorMessage(err)));
    return () => {
      active = false;
    };
  }, []);

  const byLanguage = useMemo(() => {
    const groups = new Map<string, Translator[]>();
    for (const translator of translators) {
      const list = groups.get(translator.language) || [];
      list.push(translator);
      groups.set(translator.language, list);
    }
    return groups;
  }, [translators]);

  const nameOf = useMemo(() => {
    const map = new Map(translators.map((t) => [t.code, t.name]));
    return (code: string) => map.get(code) || code;
  }, [translators]);

  return { translators, byLanguage, nameOf, error };
}

export const LANGUAGE_LABELS: Record<string, string> = {
  tr: 'Türkçe',
  en: 'İngilizce',
  ar: 'Arapça',
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] || code;
}
