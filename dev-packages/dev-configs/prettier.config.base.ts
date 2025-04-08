import type {Config} from 'prettier'

export default {
  arrowParens: 'always',
  bracketSameLine: true,
  bracketSpacing: false,
  importOrder: [
    '^node:(.+)$',
    '<THIRD_PARTY_MODULES>',
    '^@openint/(.+)$',
    '^@/(.+)$',
    '^[./]',
  ],
  jsxSingleQuote: false,
  plugins: [
    // This plugin breaks on makeSyncEngine.ts... So commenting out for now.
    require.resolve('@ianvs/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-packagejson'),
    require.resolve('prettier-plugin-tailwindcss'), // needs to come last
    // require.resolve('prettier-plugin-sql'),
  ],
  printWidth: 80,
  quoteProps: 'as-needed',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  // Extensions not standard in prettier
  tailwindStylesheet: './packages/ui-v1/global.css',
  tailwindFunctions: ['cn'],
} satisfies Config
