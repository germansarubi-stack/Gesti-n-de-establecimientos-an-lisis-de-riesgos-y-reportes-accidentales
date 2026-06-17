/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // 1. AHORA COLORS ESTÁ ADENTRO DE EXTEND. 
      // Tailwind no borra sus colores nativos, solo agrega estos nuevos.
      colors: {
        primary: {
          50: '#fffbea',
          100: '#fff7d6',
          200: '#ffecad',
          300: '#ffe184',
          400: '#ffd65b',
          500: '#ffc800', // Amarillo principal
          600: '#cc9f00',
          700: '#997700',
          800: '#664f00',
          900: '#332800',
        },
        secondary: {
          50: '#e0f7ff',
          100: '#b3edff',
          200: '#80e1ff',
          300: '#4dd5ff',
          400: '#26cbff',
          500: '#00c3ff', // Celeste principal
          600: '#00a8d8',
          700: '#0088b0',
          800: '#006888',
          900: '#004860',
        },
        accent: {
          50: '#f4e8ff',
          100: '#e8d1ff',
          200: '#d1a3ff',
          300: '#b974ff',
          400: '#a246ff',
          500: '#8b18ff', // Violeta principal
          600: '#6d0be6',
          700: '#5408cc',
          800: '#3c06a3',
          900: '#24047a',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in',
        slideUp: 'slideUp 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
        slideLeft: 'slideLeft 0.5s ease-out',
        slideRight: 'slideRight 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 13px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  safelist: [
    'from-primary-50',
    'via-secondary-50',
    'to-neutral-50',
    'from-neutral-50',
    'to-primary-50',
    'text-gradient-primary',
  ],
}