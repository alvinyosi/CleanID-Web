/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4A8FF0',
        primarySoft: '#EAF2FF',
        accent: '#F5B400',
        ink: '#1F2A44',
        secondary: '#6B7A99',
        panel: '#F7FAFF',
        aqua: '#DDF8F4',
      },
      borderRadius: {
        card: '24px',
        panel: '28px',
      },
      boxShadow: {
        soft: '0 16px 42px rgba(56, 104, 173, 0.10)',
        glass: '0 20px 50px rgba(74, 143, 240, 0.14)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        signature: ['"Great Vibes"', 'cursive'],
      }
    },
  },
  plugins: [],
}
