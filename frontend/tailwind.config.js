// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f8ff',
          100: '#e6f0ff',
          500: '#0b6eff', // cor principal azul
          600: '#0a57d1',
          700: '#0746a8'
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          700: '#0e8a3a'
        }
      }
    }
  },
  plugins: []
}
