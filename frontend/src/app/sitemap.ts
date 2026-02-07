import { MetadataRoute } from 'next';

const baseUrl = 'https://kuranrehberi.com';

// 114 sure için URL'ler oluştur
const surahUrls = Array.from({ length: 114 }, (_, i) => ({
  url: `${baseUrl}/surah/${i + 1}`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
}));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roots`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...surahUrls,
  ];
}
