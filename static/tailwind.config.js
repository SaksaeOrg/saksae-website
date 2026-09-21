/** @type {import('tailwindcss').Config} */
module.exports = {
  // Les fichiers de locale portent des classes qui n'existent que dans les
  // pages traduites : sans ce scan, Tailwind les purgerait silencieusement.
  content: ['./index.html', './js/**/*.js', './src/locales/*.mjs'],
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
