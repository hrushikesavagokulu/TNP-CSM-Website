/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode (toggled by adding/removing 'dark' on <html>)
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // ── Brand colour tokens (Phase 2 will expand these) ──────────────────
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d8ff',
          300: '#a4bcff',
          400: '#7b96fc',
          500: '#5a6ef8',  // primary
          600: '#3d4eef',
          700: '#2f3cd8',
          800: '#2830ae',
          900: '#272d89',
          950: '#181b52',
        },
        surface: {
          light: '#f8fafc',
          dark:  '#0f172a',
        },
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      // ── Animation ────────────────────────────────────────────────────────
      animation: {
        'fade-in':   'fadeIn 0.4s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },

  plugins: [],
};
