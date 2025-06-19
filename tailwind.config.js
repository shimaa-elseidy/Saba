/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {   colors: {
        'yellow-transparent': 'rgba(255, 235, 59, 0.5)',
      }},
  },
  plugins: [],
}

