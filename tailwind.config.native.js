/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App-native.{js,jsx,ts,tsx}",
    "./native/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'explore-green': '#4A7C59',
        'explore-green-dark': '#3A6249',
      },
      fontFamily: {
        cabin: ['System'],
      },
    },
  },
  plugins: [],
}
