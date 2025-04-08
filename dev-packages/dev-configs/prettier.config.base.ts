import pluginSortImports, {
  type PluginConfig as PluginSortImportsConfig,
} from '@ianvs/prettier-plugin-sort-imports'
import type {Config} from 'prettier'
import type {PluginEmbedOptions} from 'prettier-plugin-embed'
import * as pluginEmbed from 'prettier-plugin-embed'
// @ts-expect-error No types available
import pluginPackageJson from 'prettier-plugin-packagejson'
import type {SqlBaseOptions} from 'prettier-plugin-sql'
import * as pluginSql from 'prettier-plugin-sql'
// Import modules without default exports
import * as pluginTailwindcss from 'prettier-plugin-tailwindcss'
import {PluginOptions as PluginTailwindcssOptions} from 'prettier-plugin-tailwindcss'

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
      // This plugin breaks on makeSyncEngine.ts... So commenting out for now.
      pluginSortImports,
      pluginPackageJson,
      pluginTailwindcss, // needs to come last
      pluginEmbed,
      pluginSql,
    ],
  } satisfies OmitIndexSignature<Config>),

  ...({
    tailwindStylesheet: './packages/ui-v1/global.css',
    tailwindFunctions: ['cn'],
  } satisfies PluginTailwindcssOptions),

  ...({
    importOrder: [
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
  } satisfies SqlBaseOptions),
}
