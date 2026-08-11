import type { Metadata } from 'next';
import './globals.css';
import { MAINTAINER, MAINTAINER_URL, SITE_URL } from '@/config';
import { AppShell } from '@/components/layout/AppShell';
import { Providers } from '@/components/layout/Providers';
import { themeBootstrapScript } from '@/context/ThemeContext';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kuran Rehberi | Kuran-ı Kerim Araştırma Platformu',
    template: '%s | Kuran Rehberi',
  },
  description:
    'Kuran-ı Kerim araştırma platformu. 114 sure, 6236 ayet, 40+ Türkçe ve İngilizce meal, kelime kökü analizi, morfolojik arama ve ayet karşılaştırma.',
  keywords: [
    'Kuran',
    'Kuran-ı Kerim',
    'Kuran meali',
    'Türkçe meal',
    'Kuran çevirisi',
    'kelime kökü',
    'Arapça morfoloji',
    'ayet arama',
    'meal karşılaştırma',
  ],
  applicationName: 'Kuran Rehberi',
  authors: [{ name: MAINTAINER, url: MAINTAINER_URL }],
  creator: MAINTAINER,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: 'Kuran Rehberi',
    title: 'Kuran Rehberi | Kuran-ı Kerim Araştırma Platformu',
    description:
      'Kuran-ı Kerim araştırma platformu. Çoklu meal, kelime kökü analizi, morfolojik arama ve ayet karşılaştırma.',
    images: [{ url: '/logo.png', width: 861, height: 687, alt: 'Kuran Rehberi' }],
  },
  twitter: {
    card: 'summary',
    title: 'Kuran Rehberi | Kuran-ı Kerim Araştırma Platformu',
    description: 'Çoklu meal, kelime kökü analizi ve morfolojik arama.',
    images: ['/logo.png'],
  },
  alternates: { canonical: SITE_URL },
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', shortcut: '/logo.png', apple: '/apple-touch-icon.png' },
  category: 'religion',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Kuran Rehberi',
  url: SITE_URL,
  description: 'Kuran-ı Kerim araştırma platformu. Meal, kelime kökü analizi, morfolojik arama.',
  inLanguage: ['tr', 'ar', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
