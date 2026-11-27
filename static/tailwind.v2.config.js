/** @type {import('tailwindcss').Config} */
// Refonte 2027 : configuration séparée pour que la v2 se construise sans
// toucher la feuille du site en ligne (css/styles.css).
module.exports = {
  content: ['./v2/**/*.html', './v2/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        soft: '#F5F5F5',
        line: '#EBEBEB',
        'text-2': '#525252',
        muted: '#6B6B6B',
        emerald: { DEFAULT: '#10B981', text: '#047857', bg: '#D1FAE5' },
        amber: { DEFAULT: '#FBBF24', text: '#B45309', bg: '#FEF3C7' },
        indigo: { DEFAULT: '#6366F1', text: '#4F46E5', bg: '#E0E7FF' },
        late: { DEFAULT: '#EF4444', text: '#B91C1C', bg: '#FEE2E2' },
      },
      borderRadius: { btn: '8px', card: '16px' },
      fontFamily: { sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'] },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
        header: 'cubic-bezier(0.4, 0, 0.2, 1)',
        tab: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
