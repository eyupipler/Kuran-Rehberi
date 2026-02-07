import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://kuranrehberi.com'; // Kendi domain'inizi yazın

export const metadata: Metadata = {
  // Temel Meta
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

  // Robots & Indexing
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

  // Open Graph (Facebook, LinkedIn, WhatsApp)
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

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Kuran Rehberi | Kapsamlı Kuran Araştırma Platformu',
    description: 'Kuran-ı Kerim araştırma platformu. 12+ meal, kelime kökü analizi, morfolojik arama.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@kuranrehberi',
  },

  // Verification (Google Search Console, Bing, Yandex)
  verification: {
    google: 'GOOGLE_VERIFICATION_CODE', // Google Search Console'dan alın
    yandex: 'YANDEX_VERIFICATION_CODE',
    // bing: 'BING_VERIFICATION_CODE',
  },

  // Canonical & Alternates
  alternates: {
    canonical: siteUrl,
    languages: {
      'tr-TR': siteUrl,
      'en-US': `${siteUrl}/en`,
    },
  },

  // App & Icons
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Other
  category: 'religion',
  classification: 'Islamic Studies, Quran Research',
};

// JSON-LD Yapılandırılmış Veri (Schema.org)
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
        {/* JSON-LD Yapılandırılmış Veri */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* Ek Meta Etiketleri */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kuran Rehberi" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-primary-700">
                  Kuran Rehberi
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2">
                  Sureler
                </a>
                <a href="/search" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2">
                  Arama
                </a>
                <a href="/roots" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 px-3 py-2">
                  Kelime Kokleri
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-gray-50 dark:bg-gray-900 border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
            <p>Kuran Rehberi - Acik Kaynak Kuran Arastirma Platformu</p>
            <p className="text-sm mt-2">
              Veriler: <a href="https://tanzil.net" className="text-primary-600 hover:underline">Tanzil.net</a>,{' '}
              <a href="https://corpus.quran.com" className="text-primary-600 hover:underline">Quranic Arabic Corpus</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
