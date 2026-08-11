/** @type {import('tailwindcss').Config} */

// Renkler globals.css'teki CSS değişkenlerinden okunur; böylece açık/koyu tema
// `dark:` varyantı tekrarlamadan tek sınıf adıyla çalışır.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: token('--canvas'),
        surface: {
          DEFAULT: token('--surface'),
          raised: token('--surface-raised'),
          sunken: token('--surface-sunken'),
        },
        line: {
          DEFAULT: token('--line'),
          strong: token('--line-strong'),
        },
        ink: {
          DEFAULT: token('--ink'),
          muted: token('--ink-muted'),
          faint: token('--ink-faint'),
        },
        accent: {
          DEFAULT: token('--accent'),
          hover: token('--accent-hover'),
          soft: token('--accent-soft'),
          ink: token('--accent-ink'),
          contrast: token('--accent-contrast'),
        },
        marker: {
          DEFAULT: token('--marker'),
          ink: token('--marker-ink'),
        },
        danger: {
          DEFAULT: token('--danger'),
          soft: token('--danger-soft'),
        },
      },
      // Keskin köşe dili: yarıçaplar neredeyse sıfır.
      borderRadius: {
        none: '0',
        sm: '1px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        xl: '3px',
        '2xl': '3px',
        '3xl': '4px',
        full: '9999px',
      },
      boxShadow: {
        // Yalnızca üst üste binen katmanlarda kullanılır (modal, açılır liste).
        overlay: '0 1px 2px rgb(13 22 38 / 0.06), 0 12px 32px -8px rgb(13 22 38 / 0.18)',
        none: 'none',
      },
      maxWidth: {
        reader: '42rem',
      },
    },
  },
  plugins: [],
};
