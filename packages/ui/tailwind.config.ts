import type {Config} from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import {OpenIntTheme} from './themes'

// TODO: Get apps/web to import from here instead of duplicating the config
// css file import is probably sligthly more tricky though

export default {
  darkMode: 'class',
  content: [
    // Be very careful about including extra
    // paths here we don't need otherwise it causes massive DX perf issues
    // where it takes 60 seconds to compile a one line hello world change
    '**/*.tsx',
    '!node_modules',
  ],
  theme: {
    extend: {
      keyframes: {
        // Dropdown menu
        'scale-in': {
          '0%': {opacity: '0', transform: 'scale(0)'},
          '100%': {opacity: '1', transform: 'scale(1)'},
        },
        'slide-down': {
          '0%': {opacity: '0', transform: 'translateY(-10px)'},
          '100%': {opacity: '1', transform: 'translateY(0)'},
        },
        'slide-up': {
          '0%': {opacity: '0', transform: 'translateY(10px)'},
          '100%': {opacity: '1', transform: 'translateY(0)'},
        },
        // Toast
        'toast-hide': {
          '0%': {opacity: '1'},
          '100%': {opacity: '0'},
        },
        'toast-slide-in-right': {
          '0%': {transform: 'translateX(calc(100% + 1rem))'},
          '100%': {transform: 'translateX(0)'},
        },
        'toast-slide-in-bottom': {
          '0%': {transform: 'translateY(calc(100% + 1rem))'},
          '100%': {transform: 'translateY(0)'},
        },
        'toast-swipe-out': {
          '0%': {transform: 'translateX(var(--radix-toast-swipe-end-x))'},
          '100%': {
            transform: 'translateX(calc(100% + 1rem))',
          },
        },
      },
      animation: {
        // Dropdown menu
        'scale-in': 'scale-in 0.2s ease-in-out',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        // Toast
        'toast-hide': 'toast-hide 100ms ease-in forwards',
        'toast-slide-in-right':
          'toast-slide-in-right 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-slide-in-bottom':
          'toast-slide-in-bottom 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-swipe-out': 'toast-swipe-out 100ms ease-out forwards',
      },
      backgroundColor: {
        'openint-red-btn': 'salmon',
        'openint-green-btn': OpenIntTheme.green.darkened,
      },
      boxShadow: {
        'openint-green-glow': `0px 0px 8px 4px ${OpenIntTheme.greenGlow}`,
        'openint-black-drop-shadow': `0px 2px 4px 0px ${OpenIntTheme.dropShadow}`,
      },
      colors: {
        // --- Begin shadcn tailwind config
        border: 'var(--border)',
        button: {
          DEFAULT: 'var(--button)',
          foreground: 'var(--button-foreground)',
          hover: 'var(--button-hover)',
          stroke: 'var(--button-stroke)',
          light: 'var(--button-light)',
          secondary: {
            DEFAULT: 'var(--button-secondary)',
            foreground: 'var(--button-secondary-foreground)',
            stroke: 'var(--button-secondary-stroke)',
            hover: 'var(--button-secondary-hover)',
          },
        },
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
          hover: 'var(--destructive-hover)',
          stroke: 'var(--destructive-stroke)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          loading: 'var(--spinner-bg)',
        },
        tooltip: {
          DEFAULT: 'var(--tooltip)',
          foreground: 'var(--tooltip-foreground)',
        },
        tab: {
          DEFAULT: 'var(--tab)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
        },
        navbar: {
          DEFAULT: 'var(--navbar)',
        },
        // --- End shadcn tailwind config
        // ...OpenIntTheme, // Needs to be commented out for tremor to work...
        'openint-black': OpenIntTheme.black,
        'openint-gold': OpenIntTheme.gold,
        'openint-gray-muted': OpenIntTheme.gray,
        'openint-green': OpenIntTheme.green,
        'openint-red': OpenIntTheme.red,
        outline: {
          'hover-foreground': 'var(--outline-hover-foreground)',
        },
      },
      current: 'currentColor',
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
        mono: ['Source Code Pro', ...defaultTheme.fontFamily.mono],
      },
      textColor: {
        'openint-gray': '#c0c0c0',
      },
      transparent: 'transparent',
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwindcss-radix')()],
} satisfies Config
