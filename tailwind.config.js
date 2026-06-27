/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          900: '#432818',
          800: '#6f1d1b',
          600: '#99582a',
          400: '#bb9457',
          100: '#ffe6a7',
        }
      }
    },
  },
  plugins: [],
}
