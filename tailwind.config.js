/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        bgMain: '#FFFFFF',
        bgSurface: '#F1F5F9',
        textPrimary: '#1A1A1A',
        primary: '#4052A0',
        primaryHover: '#364C7D',
      },
    },
  },
  plugins: [],
}
