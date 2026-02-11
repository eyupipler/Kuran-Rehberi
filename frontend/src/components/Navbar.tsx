'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { API_BASE } from '@/config';

interface Translator {
  code: string;
  name: string;
  language: string;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [translators, setTranslators] = useState<Translator[]>([]);
  const { settings, updateTranslator, updateLanguage } = useSettings();

  useEffect(() => {
    fetch(`${API_BASE}/search/translators`)
      .then((res) => res.json())
      .then((data) => setTranslators(data))
      .catch(console.error);
  }, []);

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-soft-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Kuran Rehberi
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-1">
            <a href="/" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium">
              Sureler
            </a>
            <a href="/search" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium">
              Arama
            </a>
            <a href="/roots" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium">
              Kelime Kökleri
            </a>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all duration-200 ml-2"
              aria-label="Ayarlar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-lg text-soft-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              aria-label="Ayarlar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-soft-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {settingsOpen && (
          <div className="pb-4 border-t border-soft-200 dark:border-gray-700 mt-2 pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-soft-600 dark:text-gray-300 mb-1">
                  Varsayılan Dil
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => updateLanguage(e.target.value)}
                  className="w-full border border-soft-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">İngilizce</option>
                  <option value="all">Tüm Diller</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-soft-600 dark:text-gray-300 mb-1">
                  Varsayılan Tercüman
                </label>
                <select
                  value={settings.defaultTranslator}
                  onChange={(e) => updateTranslator(e.target.value)}
                  className="w-full border border-soft-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                >
                  <optgroup label="Türkçe">
                    {translators
                      .filter((t) => t.language === 'tr')
                      .map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="İngilizce">
                    {translators
                      .filter((t) => t.language === 'en')
                      .map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>
            <p className="text-xs text-soft-400 mt-2">Ayarlarınız otomatik olarak kaydedilir.</p>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-soft-200 dark:border-gray-700 mt-2 pt-4">
            <div className="flex flex-col space-y-1">
              <a
                href="/"
                className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sureler
              </a>
              <a
                href="/search"
                className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Arama
              </a>
              <a
                href="/roots"
                className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kelime Kökleri
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
