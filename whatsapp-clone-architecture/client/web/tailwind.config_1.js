/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tg-bg': '#17212b',
        'tg-sidebar': '#0e1621', 
        'tg-chat': '#0e1621',
        'tg-bubble-out': '#2b5278',
        'tg-bubble-in': '#182533',
        'tg-accent': '#5288c1',
        'tg-text': '#ffffff',
        'tg-secondary': '#7d8b99'
      }
    }
  },
  plugins: []
}
