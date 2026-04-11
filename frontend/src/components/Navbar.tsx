'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { useFavorites } from '@/context/FavoritesContext';
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
  const { settings, updateTranslator, updateLanguage, updateOnlyMeal, updateCompactMode, updateFontSize } = useSettings();
  const { favorites, setPanelOpen, panelOpen } = useFavorites();

  useEffect(() => {
    fetch(`${API_BASE}/search/translators`)
      .then((res) => res.json())
      .then((data) => setTranslators(data))
      .catch(console.error);
  }, []);

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-soft-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <span className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-600">
              <Image
                src="/logo.png"
                alt="Kuran Rehberi"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-white group-hover:text-primary-300 transition-colors tracking-tight">Kuran</span>
              <span className="text-[11px] font-medium text-primary-400 group-hover:text-primary-300 transition-colors tracking-widest uppercase">Rehberi</span>
            </div>
          </a>

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
            <a href="/notes" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium">
              Notlarım
            </a>

            {/* Favoriler butonu */}
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="relative text-soft-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all duration-200 ml-1"
              aria-label="Favoriler"
            >
              <svg className="w-5 h-5" fill={panelOpen ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </button>

            {/* Ayarlar butonu */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all duration-200"
              aria-label="Ayarlar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="relative p-2 rounded-lg text-soft-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              aria-label="Favoriler"
            >
              <svg className="w-5 h-5" fill={panelOpen ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length > 9 ? '9+' : favorites.length}
                </span>
              )}
            </button>
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
                  className="w-full border border-soft-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
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
                  className="w-full border border-soft-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-soft-700 dark:text-white focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                >
                  <optgroup label="Türkçe">
                    {translators.filter((t) => t.language === 'tr').map((t) => (
                      <option key={t.code} value={t.code}>{t.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="İngilizce">
                    {translators.filter((t) => t.language === 'en').map((t) => (
                      <option key={t.code} value={t.code}>{t.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Font Büyüklüğü */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-soft-600 dark:text-gray-300 mb-2">
                Font Büyüklüğü
              </label>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateFontSize(size)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      settings.fontSize === size
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-soft-200 dark:border-gray-600 text-soft-600 dark:text-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {size === 'sm' ? 'Küçük' : size === 'md' ? 'Normal' : 'Büyük'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-4">
              {/* Sadece Meal Modu */}
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="text-sm font-medium text-soft-600 dark:text-gray-300">Sadece Meal Modu</p>
                  <p className="text-xs text-soft-400 dark:text-gray-500">Arapça metni gizler</p>
                </div>
                <button
                  onClick={() => updateOnlyMeal(!settings.onlyMeal)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.onlyMeal ? 'bg-primary-500' : 'bg-soft-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      settings.onlyMeal ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Kompakt Mod */}
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="text-sm font-medium text-soft-600 dark:text-gray-300">Kompakt Mod</p>
                  <p className="text-xs text-soft-400 dark:text-gray-500">Daha sıkışık düzen</p>
                </div>
                <button
                  onClick={() => updateCompactMode(!settings.compactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.compactMode ? 'bg-primary-500' : 'bg-soft-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            <p className="text-xs text-soft-400 mt-3">Ayarlarınız cihazınıza yerel olarak kaydedilir.</p>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-soft-200 dark:border-gray-700 mt-2 pt-4">
            <div className="flex flex-col space-y-1">
              <a href="/" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium" onClick={() => setMobileMenuOpen(false)}>
                Sureler
              </a>
              <a href="/search" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium" onClick={() => setMobileMenuOpen(false)}>
                Arama
              </a>
              <a href="/roots" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium" onClick={() => setMobileMenuOpen(false)}>
                Kelime Kökleri
              </a>
              <a href="/notes" className="text-soft-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium" onClick={() => setMobileMenuOpen(false)}>
                Notlarım
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
