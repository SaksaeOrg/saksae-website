/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
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
