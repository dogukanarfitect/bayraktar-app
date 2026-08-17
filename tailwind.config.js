/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: '#9F2F4D',
        wine: '#761A33',
        ink: '#171717',
        muted: '#75726E',
        soft: '#F7F6F2',
        line: '#E8E5DF',
        success: '#168068',
        sand: '#EFE9E2',
      },
    },
  },
  plugins: [],
};
