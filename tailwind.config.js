/** @type {import('tailwindcss').Config} */
export default {
  // Mengaktifkan mode gelap berbasis class '.dark' atau atribut '[data-theme="dark"]'
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
