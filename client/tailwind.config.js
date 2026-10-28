/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        navy: {
          DEFAULT: '#0F1B33',
          sidebar: '#111E36',
          soft: '#1B2A47',
        },
        ink: '#17243B',
        muted: '#64748B',
        line: '#E2E8F0',
        page: '#F5F7FB',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#EF4444',
        accent: '#A855F7',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 27, 51, 0.04), 0 8px 20px -12px rgba(15, 27, 51, 0.16)',
        sidebar: '12px 0 40px -24px rgba(15, 27, 51, 0.55)',
        popover: '0 18px 40px -16px rgba(15, 27, 51, 0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px) scale(0.99)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-up': 'slide-up 180ms ease-out',
        'toast-in': 'toast-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
