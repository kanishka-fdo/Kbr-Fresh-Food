/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edf8f1',
          100: '#d4f1de',
          200: '#a9e3be',
          300: '#6fcb94',
          400: '#3aaa66',
          500: '#1f8a4c',
          600: '#176f3c',
          700: '#125831',
          800: '#0d4526',
          900: '#08331b',
          950: '#041a0d',
        },
        accent: {
          50:  '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbe71',
          400: '#ff9a38',
          500: '#f97316',
          600: '#ea6108',
          700: '#c24a09',
        },
        fresh: {
          green: '#22c55e',
          lime:  '#84cc16',
          teal:  '#14b8a6',
          cyan:  '#06b6d4',
        },
        pastel: {
          pink:     '#ffe8ef',
          mint:     '#e6f7ec',
          cream:    '#fffdf0',
          lavender: '#f4effa',
          blue:     '#eaf4ff',
          green:    '#e7f5e8',
          yellow:   '#fff4e0',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'], // Replacing Playfair with Outfit for display
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(0,0,0,0.08)',
        glow: '0 0 20px rgba(56, 120, 39, 0.15)',
        card: '0 10px 30px -10px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
