/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Georgia Water Brand Colors (from logo)
      colors: {
        // Brand colors extracted from logo
        'brand': {
          // Cream background from logo
          'cream': {
            50: '#fefcfb',
            100: '#fdf9f6',
            200: '#fbf3ed', // Main cream background
            300: '#f7ebe1',
            400: '#f1ddd0',
            500: '#e8ccb8',
            600: '#d4b59a',
            700: '#bc9a7a',
            800: '#9f7f5f',
            900: '#7d6248',
          },
          // Navy blue from logo
          'navy': {
            50: '#f0f4f8',
            100: '#d9e2ec',
            200: '#bcccdc',
            300: '#9fb3c8',
            400: '#829ab1',
            500: '#1a365d', // Main navy from logo
            600: '#2c5282', // Lighter navy
            700: '#102a43',
            800: '#0a1929',
            900: '#061220',
          }
        },
        // Primary system colors (using brand navy)
        'primary': {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#1a365d', // Main brand navy
          600: '#2c5282',
          700: '#102a43',
          800: '#0a1929',
          900: '#061220',
        },
        // Water safety status colors (WCAG AA compliant)
        'safe': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'warning': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'danger': {
          50: '#fef2f2',
          100: '#fecaca',
          200: '#fca5a5',
          300: '#f87171',
          400: '#f56565',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Success color aliases
        'success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      },
      // Typography scale for readability
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
      },
      // Accessible spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      // Animation for better UX
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
      // Focus styles for accessibility
      ringWidth: {
        '3': '3px',
      },
      ringColor: {
        'focus': '#2563eb',
      },
    },
  },
  plugins: [
    // Custom plugin for accessibility utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.focus-visible': {
          '&:focus-visible': {
            outline: '3px solid #2563eb',
            outlineOffset: '2px',
          },
        },
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}