'use client';

import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
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
