import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config';
import allRoots from '@/data/roots.json';
import { SURAH_COUNT, SURAH_VERSE_COUNTS } from '@/data/surahMeta';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
      { url: `${SITE_URL}/surahs`, changeFrequency: 'monthly', priority: 0.9 },
      { url: `${SITE_URL}/search`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/roots`, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/kaynaklar`, changeFrequency: 'yearly', priority: 0.4 },
    ] as const
  ).map((page) => ({ ...page, lastModified }));

  const surahPages: MetadataRoute.Sitemap = Array.from({ length: SURAH_COUNT }, (_, index) => ({
    url: `${SITE_URL}/surah/${index + 1}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const versePages: MetadataRoute.Sitemap = SURAH_VERSE_COUNTS.flatMap((verseCount, index) =>
    Array.from({ length: verseCount }, (_, verseIndex) => ({
      url: `${SITE_URL}/verse/${index + 1}/${verseIndex + 1}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    }))
  );

  const rootPages: MetadataRoute.Sitemap = (allRoots as string[]).map((root) => ({
    url: `${SITE_URL}/roots/${encodeURIComponent(root)}`,
    lastModified,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...surahPages, ...versePages, ...rootPages];
}
