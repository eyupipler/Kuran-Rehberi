import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { UPSTREAM_REPO_URL } from '@/config';

export const metadata: Metadata = {
  title: 'Kaynaklar',
  description:
    'Kuran Rehberi\'ndeki Kuran metni, mealler, morfoloji ve kelime kökü verilerinin kaynakları ve lisansları.',
};

interface SourceEntry {
  title: string;
  description: string;
  source: string;
  href?: string;
  license: string;
}

const SOURCES: SourceEntry[] = [
  {
    title: 'Kuran metni',
    description: 'Arapça metin (Uthmani hat), 114 sure ve 6236 ayet.',
    source: 'Tanzil.net',
    href: 'https://tanzil.net',
    license: 'CC-BY 3.0',
  },
  {
    title: 'Türkçe ve İngilizce mealler',
    description:
      '37 Türkçe, 6 İngilizce meal. Şinasi Güneş meali apacikkuran.com üzerinden, Hakkı Yılmaz meali ayrı bir ayrıştırıcıyla eklenmiştir.',
    source: 'Tanzil.net · fawazahmed0/quran-api · apacikkuran.com',
    href: 'https://github.com/fawazahmed0/quran-api',
    license: 'CC-BY 3.0 / Unlicense · bazı mealler telif korumalıdır',
  },
  {
    title: 'Morfoloji ve kelime kökleri',
    description:
      'Kelime bazlı ayrıştırma, lemma, kelime türü ve kök bilgisi. Kelime türü kısaltmaları Türkçeye bu projede çevrilmiştir.',
    source: 'Quranic Arabic Corpus (Kais Dukes)',
    href: 'https://corpus.quran.com',
    license: 'GNU GPL',
  },
  {
    title: 'Kök anlamları (Türkçe)',
    description:
      'Bir bölümü bu proje için elle derlenmiş sözlükten gelir. Sözlükte karşılığı olmayan kökler için anlam, o kökten türeyen kelimelerin çevirilerinden istatistiksel olarak türetilir ve arayüzde bu şekilde işaretlenir.',
    source: 'Kuran Rehberi (elle derlenmiş) + türetilmiş',
    license: 'Bu depo ile aynı lisans (MIT)',
  },
  {
    title: 'Kelime bazlı Türkçe karşılıklar',
    description:
      'Morfoloji verisi ile Türkçe meallerin otomatik hizalanmasından üretilmiştir. Meal içindeki kelime vurgulaması bu veriye dayanır ve yaklaşıktır.',
    source: 'Kuran Rehberi (otomatik hizalama)',
    license: 'Bu depo ile aynı lisans (MIT)',
  },
  {
    title: 'İlgili ayetler',
    description:
      'Anlam bütünlüğü bağlantıları bu proje için elle derlenmiştir. Tefsir otoritesi taşımaz.',
    source: 'Kuran Rehberi (elle derlenmiş)',
    license: 'Bu depo ile aynı lisans (MIT)',
  },
  {
    title: 'Transliterasyon',
    description:
      'Arapça metnin Latin okunuşu kural tabanlı olarak üretilir. Tecvid kurallarını yansıtmaz, telaffuz rehberi değildir.',
    source: 'Kuran Rehberi (kural tabanlı)',
    license: 'Bu depo ile aynı lisans (MIT)',
  },
];

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Kaynaklar"
        description="Platformdaki her metnin ve analizin nereden geldiği."
      />

      <p className="mb-6 text-sm leading-relaxed text-ink-muted">
        Aşağıdaki tablo, uygulamada gösterilen verilerin kaynaklarını ve lisanslarını özetler.
        Ayrıntılı sürüm depodaki{' '}
        <a
          href={`${UPSTREAM_REPO_URL}/blob/main/SOURCES.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2"
        >
          SOURCES.md
        </a>{' '}
        dosyasındadır.
      </p>

      <ul className="space-y-4">
        {SOURCES.map((entry) => (
          <li key={entry.title} className="rounded-sm bg-surface p-4 border border-line">
            <h2 className="text-sm font-semibold text-ink">{entry.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{entry.description}</p>
            <dl className="mt-3 grid gap-2 border-t border-line pt-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-ink-faint">Kaynak</dt>
                <dd className="mt-0.5 text-ink">
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2"
                    >
                      {entry.source}
                    </a>
                  ) : (
                    entry.source
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-ink-faint">Lisans</dt>
                <dd className="mt-0.5 text-ink">{entry.license}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-sm bg-surface-sunken p-4">
        <h2 className="text-sm font-semibold text-ink">Henüz eklenmeyenler</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          Kıraat ses kayıtları ve tefsir metinleri, kullanım şartları netleştirilmiş güvenilir bir
          kaynak belirlenmeden eklenmeyecektir.
        </p>
      </section>

      <p className="mt-6 text-sm text-ink-muted">
        Kaynak veya lisans bilgisinde bir hata görürseniz{' '}
        <a
          href={`${UPSTREAM_REPO_URL}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2"
        >
          issue açabilirsiniz
        </a>
        .{' '}
        <Link href="/" className="text-accent underline underline-offset-2">
          Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}
