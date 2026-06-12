/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14919B',
          dark: '#0D7377',
          light: '#E0F7F7',
          50: '#F0FAFA',
        },
        brand: {
          dark: '#1A1D1F',
          gray: '#6F767E',
          'gray-light': '#9CA3AF',
          border: '#E6E8EC',
          surface: '#F7F8FA',
        },
      },
    },
  },
  plugins: [],
};