// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1E1E1E',
          700: '#2D2D2D',
          600: '#3D3D3D',
          500: '#646464',
          400: '#969696',
          300: '#BDBDBD',
          200: '#E0E0E0',
          100: '#F5F5F5',
        },
        purple: {
          500: '#7E57C2',
          600: '#6A42BE',
          700: '#5C3AB4',
        }
      }
    },
  },
  plugins: [],
}
