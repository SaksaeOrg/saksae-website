/** @type {import('tailwindcss').Config} */
module.exports = {
  // src/i18n-en.mjs porte des classes utilisées uniquement par la page
  // anglaise : sans ce scan, Tailwind les purgerait silencieusement.
  content: ['./index.html', './js/**/*.js', './src/i18n-en.mjs'],
  theme: {
    extend: {
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-soft': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
  plugins: [],
};
