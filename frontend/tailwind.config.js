/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF4713',
          secondary: '#AD1164',
        },
        neutral: {
          50: '#F9F9F9',
          100: '#F2F2F2',
          200: '#E5E5E5',
          500: '#737373',
          800: '#262626',
          950: '#0A0A0A',
        },
        status: {
          open: '#3B82F6',
          'in-progress': '#FF4713',
          pending: '#F59E0B',
          resolved: '#10B981',
          closed: '#737373',
        },
        sla: {
          ok: '#10B981',
          warning: '#F59E0B',
          breached: '#EF4444',
        },
        priority: {
          low: '#3B82F6',
          medium: '#F59E0B',
          high: '#FF4713',
          critical: '#AD1164',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF4713 0%, #AD1164 100%)',
        'brand-gradient-h': 'linear-gradient(90deg, #FF4713 0%, #AD1164 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
