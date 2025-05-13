/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#39aaf5',
          500: '#0e8fe4',
          600: '#0073b6',
          700: '#015c94',
          800: '#074e79',
          900: '#0a4264',
          950: '#062a45',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          'Merriweather',
          'ui-serif',
          'Georgia',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};