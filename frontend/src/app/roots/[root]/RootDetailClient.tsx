'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/config';
import { transliterate, transliterateRoot } from '@/utils/transliteration';
import { useSettings } from '@/context/SettingsContext';


interface RootInfo {
  id: number;
  root: string;
  rootLatin: string;
  meaningTr: string;
  meaningEn: string;
  occurrenceCount: number;
}

interface Occurrence {
  surahId: number;
  verseNumber: number;
  arabicText: string;
  surahName: string;
  surahArabicName: string;
  word: string;
  wordPosition: number;
  lemma: string;
  partOfSpeech: string;
  translationTr: string | null;
  verseMealTr: string | null;
}

interface DerivedForm {
  word: string;
  lemma: string;
  partOfSpeech: string;
  count: number;
}

interface Distribution {
  surahId: number;
  surahName: string;
  count: number;
}

// Kelime türünü teknik Türkçe karşılığıyla çevir
const getPartOfSpeechTr = (pos: string): string => {
  const posMap: Record<string, string> = {
    // Temel türler
    'N': 'İsim (Nom.)',
    'PN': 'Özel İsim',
    'V': 'Fiil',
    'ADJ': 'Sıfat',
    'ADV': 'Zarf',
    'PRON': 'Zamir',
    'DET': 'Tamlayıcı',
    'CONJ': 'Bağlaç',
    'INTJ': 'Ünlem',
    // Edatlar
    'P': 'Harf-i Cer',
    'PREP': 'Harf-i Cer',
    'PART': 'Harf',
    // Özel gramer kategorileri
    'REL': 'İsm-i Mevsul',
    'NEG': 'Nefi Harfi',
    'EMPH': 'Tekid',
    'ACC': 'Harf-i Nasb',
    'COND': 'Şart Edatı',
    'ANS': 'Cevap Harfi',
    'RES': 'Atıf',
    'SUP': 'Nida / Temenni',
    'PRO': 'Zamir',
    'INL': 'Harf-i İbtida',
    'SUB': 'Harf-i Mastar',
    'EXP': 'Tefsir Harfi',
    'SUR': 'Taaccüb',
    'EXH': 'Tahziz',
    'INC': 'İbtida Harfi',
    'INT': 'İstifham (Soru)',
    'VOC': 'Nida (Seslenme)',
    'PREV': 'Keff Harfi',
    'CIRC': 'Hâl',
    'COM': 'Maiyyet',
    'EQ': 'Müsavat',
    'REM': 'Tenbih',
    'RSLT': 'Netice',
    'RETRACT': 'İstidrak',
    'AMD': 'Istinaf',
    'AVR': 'Tahzir',
    'CERT': 'Tekit',
    'EXL': 'Ünlem',
    'FUT': 'İstikbal (Gelecek)',
    'IMPV': 'Emir Kipi',
    'LOC': 'Zarf-ı Mekân',
    'T': 'Zarf-ı Zaman',
    'REM2': 'İstidrak',
  };
  return posMap[pos] || pos;
};

interface Props {
  rootParam: string;
}

// Arapça metninde belirtilen pozisyondaki kelimeyi vurgula
function ArabicWithHighlight({ text, targetWord, wordPosition }: { text: string; targetWord: string; wordPosition: number }) {
  const words = text.split(/\s+/);
  return (
    <span dir="rtl">
      {words.map((w, i) => {
        const isTarget = (i + 1 === wordPosition) || w === targetWord;
        return (
          <span key={i}>
            {i > 0 && ' '}
            {isTarget ? (
              <mark className="bg-primary-200 dark:bg-primary-800/50 text-primary-800 dark:text-primary-100 rounded px-0.5 not-italic font-arabic">
                {w}
              </mark>
            ) : w}
          </span>
        );
      })}
    </span>
  );
}

// Türkçe ses değişimleri için kök normalize et
function turkishStem(word: string): string {
  const lower = word.toLowerCase()
    .replace(/İ/g, 'i').replace(/I/g, 'ı')
    .replace(/Ğ/g, 'ğ').replace(/Ş/g, 'ş')
    .replace(/Ç/g, 'ç').replace(/Ö/g, 'ö').replace(/Ü/g, 'ü');
  const suffixes = ['lerin', 'larin', 'lerde', 'lardan', 'lerden',
    'ların', 'lar', 'ler', 'den', 'dan', 'ten', 'tan', 'de', 'da', 'te', 'ta',
    'nin', 'nın', 'nun', 'nün', 'in', 'ın', 'un', 'ün', 'yi', 'yı', 'yu', 'yü',
    'ye', 'ya', 'nde', 'nda', 'nden', 'ndan'];
  let stem = lower;
  for (const suf of suffixes) {
    if (stem.length > suf.length + 2 && stem.endsWith(suf)) {
      stem = stem.slice(0, stem.length - suf.length);
      break;
    }
  }
  return stem.length > 5 ? stem.slice(0, 5) : stem;
}

const TR_CHARS = 'a-züğışçöâîûA-ZÜĞIŞÇÖÂÎÛ';

// Türkçe meal metninde çeviriyi bulup vurgula
function MealWithHighlight({ meal, translationTr }: { meal: string; translationTr: string | null }) {
  if (!meal || !translationTr) return <>{meal}</>;

  const terms = translationTr
    .split(/[,،\/;]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);

  for (const term of terms) {
    try {
      // 1. Try exact case-insensitive substring first (no stemming)
      const termLower = term.toLowerCase().replace(/İ/g, 'i').replace(/I/g, 'ı');
      const mealLower = meal.toLowerCase().replace(/İ/g, 'i').replace(/I/g, 'ı');
      if (termLower.length >= 4 && mealLower.includes(termLower)) {
        const idx = mealLower.indexOf(termLower);
        return (
          <>
            {meal.slice(0, idx)}
            <mark className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-0.5 not-italic font-medium">
              {meal.slice(idx, idx + term.length)}
            </mark>
            {meal.slice(idx + term.length)}
          </>
        );
      }
      // 2. Try stem match
      const stem = turkishStem(term);
      if (stem.length < 3) continue;
      const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(${escaped}[${TR_CHARS}]*)`, 'gi');
      if (pattern.test(meal)) {
        const parts = meal.split(new RegExp(`(${escaped}[${TR_CHARS}]*)`, 'gi'));
        if (parts.length > 1) {
          return (
            <>
              {parts.map((part, i) =>
                i % 2 === 1 ? (
                  <mark key={i} className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-0.5 not-italic font-medium">
                    {part}
                  </mark>
                ) : part
              )}
            </>
          );
        }
      }
    } catch { continue; }
  }

  return <>{meal}</>;
}

export default function RootDetailClient({ rootParam }: Props) {
  const { settings, updateOnlyMeal, updateTranslator } = useSettings();

  const [rootInfo, setRootInfo] = useState<RootInfo | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [derivedForms, setDerivedForms] = useState<DerivedForm[]>([]);
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'occurrences' | 'forms' | 'distribution'>('occurrences');
  const [showAll, setShowAll] = useState(false);

  // Settings'den oku
  const onlyMeal = settings.onlyMeal;

  // State for translators
  const [translators, setTranslators] = useState<{ code: string; name: string }[]>([]);
  // User override — null means "follow settings.defaultTranslator"
  const [translatorOverride, setTranslatorOverride] = useState<string | null>(null);
  const selectedTranslator = translatorOverride ?? settings.defaultTranslator;

  useEffect(() => {
    // Fetch available translators
    fetch(`${API_BASE}/search/translators?language=tr`)
      .then(res => res.json())
      .then(data => setTranslators(data))
      .catch(err => console.error('Tercümanlar yüklenemedi:', err));
  }, []);

  useEffect(() => {
    if (!rootParam) return;

    setLoading(true);
    setError(null);

    // useParams() zaten decode edilmiş değeri verir
    const decodedRoot = decodeURIComponent(rootParam);

    fetch(`${API_BASE}/roots/${encodeURIComponent(decodedRoot)}?translator=${selectedTranslator}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Kök bulunamadı');
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setRootInfo(data.root);
        setOccurrences(data.occurrences || []);
        setDerivedForms(data.derivedForms || []);
        setDistribution(data.distribution || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Kök yüklenemedi:', err);
        setError('Kök bulunamadı veya bir hata oluştu');
        setLoading(false);
      });
  }, [rootParam, selectedTranslator]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 border-t-primary-500"></div>
      </div>
    );
  }

  if (error || !rootInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-soft-500 mb-4">{error || 'Kök bulunamadı'}</p>
        <Link href="/roots" className="text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kelime Köklerine Dön
        </Link>
      </div>
    );
  }


  const displayedOccurrences = showAll ? occurrences : occurrences.slice(0, 50);

  return (
    <div>
      {/* Başlık - Mobil uyumlu ve yumuşak */}
      <div className="mb-6 sm:mb-8">
        <Link href="/roots" className="text-primary-500 hover:text-primary-600 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kelime Köklerine Dön
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 shadow-soft overflow-hidden">
          {/* Üst Kısım: Kök ve İstatistik */}
          <div className="p-6 sm:p-8 bg-cream-50 dark:bg-gray-800/50 border-b border-soft-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <h1 className="text-4xl sm:text-5xl font-arabic text-primary-600 dark:text-primary-400">
                    {rootInfo.root}
                  </h1>
                  <span className="text-xl sm:text-2xl text-soft-500 font-serif italic">
                    {transliterateRoot(rootInfo.root)}
                  </span>
                </div>
                {rootInfo.rootLatin && (
                  <p className="text-sm text-soft-400 font-mono">ID: {rootInfo.id}</p>
                )}
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-soft-200 dark:border-gray-700 shadow-sm">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-soft-800 dark:text-white">
                    {rootInfo.occurrenceCount}
                  </span>
                  <span className="text-xs text-soft-500 uppercase tracking-wider">Tekrar</span>
                </div>
                <div className="w-px h-8 bg-soft-200 dark:bg-gray-700"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-soft-800 dark:text-white">
                    {derivedForms.length}
                  </span>
                  <span className="text-xs text-soft-500 uppercase tracking-wider">Form</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sözlük Kısmı */}
          <div className="p-6 sm:p-8">
            <h2 className="text-sm font-bold text-soft-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              Sözlük Anlamları
            </h2>

            <div className="space-y-6">
              {(() => {
                // meaningTr yoksa occurrence'lardan türet
                const rawMeaning = rootInfo.meaningTr ||
                  [...new Set(
                    occurrences
                      .map(o => o.translationTr)
                      .filter(Boolean)
                      .flatMap(t => t!.split(/[,،\/;]+/).map(s => s.trim()).filter(s => s.length > 1))
                  )].slice(0, 6).join(', ');

                return rawMeaning ? (
                  <div>
                    <ul className="space-y-3">
                      {rawMeaning.split(',').map((meaning, index) => (
                        <li key={index} className="flex gap-3 text-lg sm:text-xl text-soft-800 dark:text-gray-200 leading-relaxed">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="capitalize-first">{meaning.trim()}</span>
                        </li>
                      ))}
                    </ul>
                    {!rootInfo.meaningTr && (
                      <p className="text-xs text-soft-400 mt-3 italic">* Kelime kullanımlarından türetilmiştir</p>
                    )}
                  </div>
                ) : (
                  <p className="text-soft-500 italic">Türkçe anlam bulunamadı.</p>
                );
              })()}

              {rootInfo.meaningEn && (
                <div className="pt-6 border-t border-soft-100 dark:border-gray-700/50 mt-6">
                  <p className="text-sm font-medium text-soft-400 mb-2 uppercase tracking-wide">İngilizce</p>
                  <p className="text-base text-soft-600 dark:text-gray-400 font-serif italic">
                    {rootInfo.meaningEn}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Menüsü - Mobil uyumlu */}
      <div className="border-b border-soft-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <nav className="flex gap-1 sm:gap-2 min-w-max items-center">
          <button
            onClick={() => setActiveTab('occurrences')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'occurrences'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-soft-500 hover:text-soft-700'
              }`}
          >
            Ayetler ({occurrences.length})
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'forms'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-soft-500 hover:text-soft-700'
              }`}
          >
            Türetilmiş Formlar ({derivedForms.length})
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${activeTab === 'distribution'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-soft-500 hover:text-soft-700'
              }`}
          >
            Sure Dağılımı
          </button>
          {activeTab === 'occurrences' && (
            <button
              onClick={() => updateOnlyMeal(!onlyMeal)}
              className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all whitespace-nowrap ${
                onlyMeal
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-soft-200 dark:border-gray-600 text-soft-600 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              Sadece meal
            </button>
          )}

          {/* Tercüman Seçimi */}
          <div className={`${activeTab === 'occurrences' ? 'ml-2' : 'ml-auto'} border-l border-soft-200 dark:border-gray-700 pl-3 hidden sm:block`}>
            <select
              value={selectedTranslator}
              onChange={(e) => { setTranslatorOverride(e.target.value); updateTranslator(e.target.value); }}
              className="text-sm border border-soft-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-soft-600 dark:text-gray-300 focus:ring-1 focus:ring-primary-200 focus:outline-none"
            >
              {translators.map(t => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
          </div>
        </nav>
      </div>

      {/* Tab İçerikleri */}
      {activeTab === 'occurrences' && (
        <div className={onlyMeal ? 'space-y-2' : 'space-y-3 sm:space-y-4'}>
          {displayedOccurrences.map((occ, index) => (
            <div
              key={`${occ.surahId}-${occ.verseNumber}-${occ.wordPosition}-${index}`}
              className={onlyMeal
                ? 'p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700'
                : 'p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 hover:shadow-soft-md transition-all duration-200'
              }
            >
              {onlyMeal ? (
                /* Sadece Meal Modu */
                <Link href={`/verse/${occ.surahId}/${occ.verseNumber}`} className="block">
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-primary-500 font-medium whitespace-nowrap mt-0.5">
                      {occ.surahName} {occ.verseNumber}
                    </span>
                    <p className="text-sm text-soft-600 dark:text-gray-300 leading-relaxed flex-1">
                      {occ.verseMealTr
                        ? <MealWithHighlight meal={occ.verseMealTr} translationTr={occ.translationTr || rootInfo.meaningTr} />
                        : '-'}
                    </p>
                  </div>
                </Link>
              ) : (
                /* Normal Mod */
                <>
                  <div className="flex flex-col gap-4">
                    {/* Üst Bilgi: Sure/Ayet ve Kelime Analizi */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-soft-100 dark:border-gray-700 pb-2">
                      <Link
                        href={`/verse/${occ.surahId}/${occ.verseNumber}`}
                        className="font-medium text-primary-500 hover:text-primary-600 transition-colors text-sm sm:text-base inline-flex items-center gap-1"
                      >
                        {occ.surahName} Suresi {occ.verseNumber}. Ayet
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex flex-col items-center">
                          <span className="text-lg sm:text-xl font-arabic bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 px-3 py-1.5 rounded-lg">{occ.word}</span>
                          <span className="text-[10px] sm:text-xs text-soft-400 mt-0.5">{transliterate(occ.word)}</span>
                          <span className="text-[10px] sm:text-xs text-primary-500 dark:text-primary-400 mt-0.5">
                            {occ.translationTr || rootInfo.meaningTr || transliterateRoot(rootInfo.root)}
                          </span>
                        </div>
                        {occ.partOfSpeech && (
                          <span className="root-badge text-[10px] sm:text-xs">{getPartOfSpeechTr(occ.partOfSpeech)}</span>
                        )}
                      </div>
                    </div>

                    {/* İçerik: Sol (Meal) - Sağ (Arapça) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sol: Türkçe Meal (çevrilen kelime vurgulanmış) */}
                      <div className="text-left font-serif">
                        {occ.verseMealTr ? (
                          <p className="prose-text text-soft-700 dark:text-gray-300 leading-relaxed">
                            <MealWithHighlight meal={occ.verseMealTr} translationTr={occ.translationTr || rootInfo.meaningTr} />
                          </p>
                        ) : (
                          <p className="text-soft-400 italic text-sm">Meal bulunamadı.</p>
                        )}
                      </div>

                      {/* Sağ: Arapça Metin (kök kelimesi vurgulanmış) */}
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-arabic arabic-text text-soft-800 dark:text-gray-200 leading-loose">
                          <ArabicWithHighlight
                            text={occ.arabicText}
                            targetWord={occ.word}
                            wordPosition={occ.wordPosition}
                          />
                        </p>
                        <p className="text-xs text-soft-400 mt-1 font-latin">
                          {transliterate(occ.arabicText)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          {occurrences.length > 50 && !showAll && (
            <div className="text-center py-4">
              <button
                onClick={() => setShowAll(true)}
                className="px-5 sm:px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-soft hover:shadow-soft-md transition-all duration-200"
              >
                Tümünü Göster ({occurrences.length - 50} daha)
              </button>
            </div>
          )}

          {occurrences.length === 0 && (
            <div className="text-center py-8 text-soft-500">
              Bu kök için geçiş bulunamadı
            </div>
          )}
        </div>
      )}

      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {derivedForms.map((form, index) => (
            <div
              key={`${form.word}-${index}`}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700 hover:shadow-soft transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xl sm:text-2xl font-arabic text-soft-800 dark:text-white block">{form.word}</span>
                  <span className="text-sm text-soft-400">{transliterate(form.word)}</span>
                </div>
                <span className="text-sm px-2.5 py-1 bg-cream-100 dark:bg-gray-700 text-soft-600 dark:text-gray-300 rounded-full font-medium">
                  {form.count}x
                </span>
              </div>
              {rootInfo.meaningTr && (
                <p className="text-sm text-primary-500 dark:text-primary-400 font-medium mb-1">{rootInfo.meaningTr}</p>
              )}
              {form.lemma && (
                <p className="text-xs text-soft-500 dark:text-gray-400">Lemma: {form.lemma} <span className="text-soft-400">({transliterate(form.lemma)})</span></p>
              )}
              {form.partOfSpeech && (
                <span className="root-badge mt-2 inline-block">{getPartOfSpeechTr(form.partOfSpeech)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'distribution' && (
        <div className="space-y-2">
          {distribution.map((dist) => (
            <div
              key={dist.surahId}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-soft-200 dark:border-gray-700"
            >
              <Link
                href={`/surah/${dist.surahId}`}
                className="w-full sm:w-48 font-medium text-primary-500 hover:text-primary-600 transition-colors text-sm sm:text-base"
              >
                {dist.surahName}
              </Link>
              <div className="flex-1">
                <div
                  className="h-5 sm:h-6 bg-primary-100 rounded-lg overflow-hidden"
                  style={{
                    width: `${Math.min(100, (dist.count / (distribution[0]?.count || 1)) * 100)}%`,
                  }}
                >
                  <div className="h-full bg-primary-400 rounded-lg flex items-center justify-end pr-2">
                    <span className="text-[10px] sm:text-xs text-white font-medium">{dist.count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
