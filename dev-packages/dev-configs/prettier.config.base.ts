import type {PluginConfig as PluginSortImportsConfig} from '@ianvs/prettier-plugin-sort-imports'
import type {Config} from 'prettier'
import type {PluginEmbedOptions} from 'prettier-plugin-embed'
import type {SqlBaseOptions} from 'prettier-plugin-sql'
import type {PluginOptions as PluginTailwindcssOptions} from 'prettier-plugin-tailwindcss'

/** Strict enforcement of prettier config options */
type OmitIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K]: T[K]
}

export default {
  ...({
    arrowParens: 'always',
    bracketSameLine: true,
    bracketSpacing: false,
    jsxSingleQuote: false,
    printWidth: 80,
    quoteProps: 'as-needed',
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,
    plugins: [
      // require.resolve works much better than imports.
      // Would be nice to eventually switch to equivalent imports though
      require.resolve('prettier-plugin-embed'),
      require.resolve('prettier-plugin-sql'),
      require.resolve('@ianvs/prettier-plugin-sort-imports'),
      require.resolve('prettier-plugin-packagejson'),
      require.resolve('prettier-plugin-tailwindcss'), // needs to come last
    ],
  } satisfies OmitIndexSignature<Config>),

  ...({
    tailwindStylesheet: './packages/ui-v1/global.css',
    tailwindFunctions: ['cn'],
  } satisfies PluginTailwindcssOptions),

  ...({
    importOrder: [
      '<TYPES>',
      '<TYPES>^@openint/(.+)$',
      '<TYPES>^@/(.+)$',
      '<TYPES>^[./]',
      '',
      '^node:(.+)$',
      '<THIRD_PARTY_MODULES>',
      '^@openint/(.+)$',
      '^@/(.+)$',
      '^[./]',
    ],
  } satisfies PluginSortImportsConfig),
  // Plugin configurations
  ...({
    embeddedSqlTags: ['sql'],
  } satisfies PluginEmbedOptions),
  ...({
    language: 'postgresql',
    keywordCase: 'upper',
    expressionWidth: 80,
  } satisfies SqlBaseOptions),
}
