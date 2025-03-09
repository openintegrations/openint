import type {Config} from 'tailwindcss'

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
    '../shadcn/**/*.tsx',
    '!../shadcn/node_modules',
  ],
} satisfies Config
