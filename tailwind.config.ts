import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Surface / background scale
        base: '#0B0D12', // app background
        sidebar: '#0E1017', // sidebar background
        card: '#141720', // card background
        input: '#11141C', // input background

        // Brand
        primary: {
          DEFAULT: '#7779ED',
          foreground: '#FFFFFF',
          hover: '#6A6CE0',
          active: '#5C5ED4',
        },
        accent: {
          DEFAULT: '#A5A7FF',
          soft: 'rgba(165,167,255,0.12)',
        },

        // Semantic
        success: {
          DEFAULT: '#70E2BD',
          soft: 'rgba(112,226,189,0.12)',
        },
        danger: {
          DEFAULT: '#FF8998',
          soft: 'rgba(255,137,152,0.12)',
        },

        // Content
        content: {
          DEFAULT: '#F0F1F8', // primary text
          muted: '#858B9F', // secondary text
          faint: '#5A6079',
        },

        // Borders
        line: 'rgba(255,255,255,0.08)',
        'line-strong': 'rgba(255,255,255,0.14)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(119,121,237,0.35), 0 18px 50px -20px rgba(119,121,237,0.55)',
        focus: '0 0 0 3px rgba(119,121,237,0.35)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 20% 20%, rgba(119,121,237,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(165,167,255,0.12), transparent 40%)',
        'indigo-soft': 'linear-gradient(135deg, #7779ED 0%, #A5A7FF 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
      screens: {
        xs: '380px',
      },
    },
  },
  plugins: [],
} satisfies Config;
