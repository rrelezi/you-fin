/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        youfin: {
          primary: '#FF9F1C',
          secondary: '#2EC4B6',
          dark: {
            100: '#2D3748',
            200: '#1A202C',
            300: '#171923',
            400: '#111111',
            500: '#000000'
          },
          light: {
            100: '#FFFFFF',
            200: '#F7FAFC',
            300: '#EDF2F7',
            400: '#E2E8F0',
            500: '#CBD5E0'
          },
          success: '#00C853',
          error: '#FF4B4B',
          warning: '#FFB74D'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        card: '0 2px 4px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.25), 0 12px 24px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(255, 159, 28, 0.3)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      },
      animation: {
        'slide-in': 'slide-in 0.5s ease-out',
        'slide-out': 'slide-out 0.5s ease-in',
        'fade-in': 'fade-in 0.3s ease-in',
        'fade-out': 'fade-out 0.3s ease-out'
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      }
    }
  },
  plugins: [],
} 