import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { SettingsProvider } from '@/context/SettingsContext';

const siteUrl = 'https://kuranrehberi.com';

export const metadata: Metadata = {
  title: {
    default: 'Kuran Rehberi | Yeni Özellikler Eklenecektir - Demo',
    template: '%s | Kuran Rehberi'
  },
  description: 'Kuran-ı Kerim araştırma platformu. 114 sure, 6236 ayet, 12+ Türkçe ve İngilizce meal, kelime kökü analizi, morfolojik arama ve ayet karşılaştırma özellikleri. Ücretsiz Kuran meali okuma ve araştırma.',
  keywords: [
    'Kuran', 'Kuran-ı Kerim', 'Kuran meali', 'Türkçe meal', 'Kuran çevirisi',
    'Diyanet meali', 'Elmalılı meali', 'Kuran arama', 'ayet arama',
    'kelime kökü', 'Arapça gramer', 'sure', 'ayet', 'tefsir',
    'Quran', 'Quran translation', 'Islamic studies', 'Arabic morphology'
  ],
  authors: [{ name: 'Kuran Rehberi' }],
  creator: 'Kuran Rehberi',
  publisher: 'Kuran Rehberi',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName: 'Kuran Rehberi',
    title: 'Kuran Rehberi | Kapsamlı Kuran Araştırma Platformu',
    description: 'Kuran-ı Kerim araştırma platformu. 12+ meal, kelime kökü analizi, morfolojik arama. Ücretsiz Kuran meali okuma ve araştırma.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Kuran Rehberi - Kuran Araştırma Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuran Rehberi | Kapsamlı Kuran Araştırma Platformu',
    description: 'Kuran-ı Kerim araştırma platformu. 12+ meal, kelime kökü analizi, morfolojik arama.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@kuranrehberi',
  },
  verification: {
    google: 'GOOGLE_VERIFICATION_CODE',
    yandex: 'YANDEX_VERIFICATION_CODE',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'tr-TR': siteUrl,
      'en-US': `${siteUrl}/en`,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  category: 'religion',
  classification: 'Islamic Studies, Quran Research',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Kuran Rehberi',
  alternateName: 'Quran Guide',
  url: 'https://kuranrehberi.com',
  description: 'Kuran-ı Kerim araştırma platformu. Meal, tefsir, kelime kökü analizi.',
  inLanguage: ['tr', 'ar', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://kuranrehberi.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Kuran Rehberi',
    logo: {
      '@type': 'ImageObject',
      url: 'https://kuranrehberi.com/logo.png'
    }
  }
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Kuran Rehberi',
  url: 'https://kuranrehberi.com',
  logo: 'https://kuranrehberi.com/logo.png',
  sameAs: [
    'https://twitter.com/kuranrehberi',
    'https://github.com/kuranrehberi'
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <meta name="theme-color" content="#358a5b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kuran Rehberi" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen">
        <SettingsProvider>
          <Navbar />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>

          <footer className="bg-cream-100 dark:bg-gray-900 border-t border-soft-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
              <p className="text-soft-600 dark:text-gray-400 font-medium">
                Kuran Rehberi
              </p>
              <p className="text-sm text-soft-500 dark:text-gray-500 mt-1">
                Açık Kaynak Kuran Araştırma Platformu
              </p>
              <a
                href="https://github.com/eyupipler/Kuran-Rehberi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 text-sm mt-2 inline-block transition-colors"
              >
                GitHub'da İncele
              </a>
            </div>
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
