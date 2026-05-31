/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        darkbg: '#0B0F19',
        glass: 'rgba(255, 255, 255, 0.08)',
        glassDark: 'rgba(15, 23, 42, 0.65)'
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
      }
    },
  },
  plugins: [],
}
