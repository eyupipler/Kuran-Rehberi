/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Daha yumuşak, pastel tonlarında yeşil palet
        primary: {
          50: '#f0f9f4',
          100: '#e0f2e8',
          200: '#c3e5d3',
          300: '#98d4b5',
          400: '#6bbf91',
          500: '#48a872',
          600: '#358a5b',
          700: '#2d7049',
          800: '#275a3c',
          900: '#224a34',
        },
        // Yumuşak gri tonları
        soft: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Krem tonları (arka plan için)
        cream: {
          50: '#fefdfb',
          100: '#fdfaf5',
          200: '#faf5eb',
          300: '#f5eddd',
          400: '#ede1c9',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.10)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
