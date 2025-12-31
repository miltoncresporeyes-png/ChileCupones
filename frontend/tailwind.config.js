/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E31C23', // Red like Chilean flag/many banks
        secondary: '#0039A6', // Blue
      }
    },
  },
  plugins: [],
}
