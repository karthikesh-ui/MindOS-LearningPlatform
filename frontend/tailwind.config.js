/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b0d12',
          800: '#161922',
          700: '#22262f',
          600: '#3a3f4c',
          500: '#5b616e',
          400: '#7a8090',
          300: '#9aa0ad',
          200: '#c4c9d2',
          100: '#e6e8ed',
          50: '#f4f5f7',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#fafbfc',
          card: '#f7f8fa',
          border: '#eceef2',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#5aa6ff',
          500: '#2f87ff',
          600: '#1668f0',
          700: '#0f52c4',
          800: '#0f459e',
          900: '#103b7d',
        },
        accent: {
          50: '#eafff5',
          100: '#d2ffe9',
          200: '#a6fdd3',
          300: '#62f5b3',
          400: '#27e58f',
          500: '#06c976',
          600: '#00a25e',
          700: '#00804c',
          800: '#02633d',
          900: '#055234',
        },
        success: {
          500: '#16a34a',
          600: '#15803d',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Lexend', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,20,29,0.04), 0 1px 1px rgba(16,20,29,0.03)',
        card: '0 1px 2px rgba(16,20,29,0.05), 0 4px 12px rgba(16,20,29,0.04)',
        lift: '0 8px 24px rgba(16,20,29,0.08), 0 2px 6px rgba(16,20,29,0.04)',
        glow: '0 0 0 1px rgba(47,135,255,0.18), 0 8px 24px rgba(47,135,255,0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
