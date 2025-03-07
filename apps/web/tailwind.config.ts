import type {Config} from 'tailwindcss'
import {default as config} from '@openint/ui/tailwind.config'

export default {
  ...config,
  // needs to override all content here because path is relative
  content: [
    // No styles in here, be very careful about including extra
    // paths here we don't need otherwise it causes massive DX perf issues
    // where it takes 60 seconds to compile a one line hello world change
    // '../../integrations/**/*.tsx',

    '../../packages/engine-frontend/**/*.tsx',
    '!../../packages/engine-frontend/node_modules',
    '../../packages/ui/**/*.tsx',
    '!../../packages/ui/node_modules',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',

    // Path to the tremor module
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
} satisfies Config
