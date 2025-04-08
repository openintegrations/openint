/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Failing due to https://github.com/eslint/css/issues/56, should be released in few days hopefully
// import pluginCss from '@eslint/css'
// @ts-expect-error Esm
// import {tailwindSyntax} from '@eslint/css/syntax'
import pluginJs from '@eslint/js'
// @ts-expect-error No types available
import pluginNext from '@next/eslint-plugin-next'
import configPrettier from 'eslint-config-prettier/flat'
import {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript'
import codegen from 'eslint-plugin-codegen'
// @ts-expect-error No types available
import pluginEslintComments from 'eslint-plugin-eslint-comments'
// import pluginImport from 'eslint-plugin-import'
import pluginImportX from 'eslint-plugin-import-x'
import pluginJest from 'eslint-plugin-jest'
// @ts-expect-error No types available
import pluginJestFormatting from 'eslint-plugin-jest-formatting'
// @ts-expect-error No types available
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
// @ts-expect-error No types available
import pluginPromise from 'eslint-plugin-promise'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginUnicorn from 'eslint-plugin-unicorn'
// Causes issue with tsc. So we use the typescript-eslint version which works better
// https://gist.github.com/openint-bot/fc836878d47b575d3cb3657b78e234d4
// import {defineConfig} from 'eslint/config'
import pluginTs, {
  ConfigArray,
  ConfigWithExtends,
  config as defineConfig,
} from 'typescript-eslint'

export {defineConfig}
export type ConfigWithExtendsArray = Parameters<typeof defineConfig>

type Config = ConfigArray[number]

/**
 * Utility function to assign object keys as .name property of objects.
 * Useful for creating named configurations.
 */
export function keyAsName<U extends Record<string, object>>(obj: U) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, {...value, name: key}]),
  ) as {[key in keyof U]: U[key] & {name: key}}
}

// Add css when ready

export const configs = keyAsName({
  globaIgnores: {
    ignores: [
      // # Unignore dotfiles
      '!**/.*',
      // # dependencies
      '**/node_modules/',
      // Temporary files
      '**/temp/',
      '**/*.play.*',

      // generated files
      '**/__generated__/',
      '**/*.generated.*',
      '**/*.gen.*',
      '**/*.oas.*',
      '**/storybook-static/',

      // jest
      '**/*.snap',

      // next.js
      'apps/gondola/.next/',
      'apps/web/.next/',
      'apps/web/out/',

      // vim: set filetype=ignore:
      '**/.obsidian/',
      'docs/openint.oas.json',
      '**/.storybook',
      // For now until we upgrade to new lint
      'apps/web/postcss.config.mjs',
      // Unsure why this is not part of the "tsconfig" project somehow...
      //Also cannot even add it to the default config
      // TODO: Fix this hack
      '**/dev-configs',
      '**/eslint.config.ts',

      // for kits dist files
      '**/dist/**',
    ],
  },
  defaultFiles: {
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
  },
  javascript: {
    extends: [pluginJs.configs.recommended],
    rules: {
      'arrow-body-style': 'warn',
      'object-shorthand': 'warn',
      'prefer-const': 'warn',
      quotes: ['warn', 'single', {avoidEscape: true}],
      'require-await': 'off',
      // TODO: Figure this out...
      'no-useless-escape': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'no-implied-eval': 'off',
      'no-async-promise-executor': 'warn',
      'no-constant-condition': 'warn',
      'no-fallthrough': 'warn',
      'no-useless-catch': 'warn',
      'no-loss-of-precision': 'warn',
      'no-empty-pattern': 'off',
    },
  },
  import: {
    // plugin to check mono repo rules seems to work regardless... but maybe this is best practice?
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
          bun: true, // resolve Bun modules https://github.com/import-js/eslint-import-resolver-typescript#bun
        }),
      ],
    },
    extends: [
      pluginImportX.flatConfigs.recommended,
      pluginImportX.flatConfigs.typescript,
    ],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          // TODO: Turn these to false when have whitelist
          devDependencies: true,
          optionalDependencies: true,
          peerDependencies: true,
          // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-extraneous-dependencies.md
          // consider adding whitelist
        },
      ],
      // FIXME: This should not be disabled ever - immediate code smell
      'import-x/no-relative-packages': 'error',
      'import-x/no-useless-path-segments': ['error', {noUselessIndex: true}],
    },
  },
  typescript: {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    // extends: [pluginTs.configs.strict as Config[]],
    extends: [pluginTs.configs.strictTypeChecked as Config[]],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/array-type': ['warn', {default: 'array-simple'}],
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-tslint-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {disallowTypeAnnotations: false},
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-extra-semi': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-for-in-array': 'warn',
      '@typescript-eslint/no-implied-eval': 'warn',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',

      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'warn',

      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'warn',

      '@typescript-eslint/no-base-to-string': 'warn',

      '@typescript-eslint/no-misused-spread': 'warn',
      '@typescript-eslint/no-unnecessary-template-expression': 'warn',

      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-duplicate-type-constituents': 'warn',
      '@typescript-eslint/no-meaningless-void-operator': 'warn',
      '@typescript-eslint/no-unnecessary-type-parameters': 'warn',
      '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/return-await': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/prefer-promise-reject-errors': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
    },
  },
  react: {
    extends: [pluginReact.configs.flat['recommended'] as Config],
    settings: {react: {version: 'detect'}},
    rules: {
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-curly-brace-presence': 'warn',
      'react/jsx-no-target-blank': 'off',
      'react/display-name': 'warn',
      'react/no-direct-mutation-state': 'warn',
      'react/require-render-return': 'warn',
      'react/no-deprecated': 'warn',
    },
  },
  'react-hooks': {
    extends: [pluginReactHooks.configs['recommended-latest']],
    rules: {
      'react-hooks/exhaustive-deps': [
        'warn',
        {additionalHooks: '(useUpdateEffect)'},
      ],
    },
  },
  a11y: {
    extends: [pluginJsxA11y.flatConfigs.recommended],
    rules: {
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/html-has-lang': 'warn',
      'jsx-a11y/iframe-has-title': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
    },
  },
  next: {
    plugins: {'@next/next': pluginNext},
    settings: {
      next: {
        rootDir: 'apps/web',
      },
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  unicorn: {
    extends: [pluginUnicorn.configs.recommended],
    rules: {
      'unicorn/prevent-abbreviations': 'warn',
      'unicorn/no-null': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/catch-error-name': ['warn', {name: 'err'}],
      'unicorn/escape-case': 'warn',
      'unicorn/no-await-expression-member': 'warn',
      'unicorn/no-console-spaces': 'warn',
      'unicorn/no-instanceof-array': 'warn',
      'unicorn/no-useless-fallback-in-spread': 'warn',
      'unicorn/no-useless-length-check': 'warn',
      'unicorn/no-useless-promise-resolve-reject': 'warn',
      'unicorn/no-useless-spread': 'warn',
      'unicorn/number-literal-case': 'warn',
      'unicorn/prefer-add-event-listener': 'warn',
      'unicorn/prefer-array-find': 'warn',
      'unicorn/prefer-array-flat-map': 'warn',
      'unicorn/prefer-array-flat': 'warn',
      'unicorn/prefer-array-index-of': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/prefer-code-point': 'warn',
      'unicorn/prefer-date-now': 'warn',
      'unicorn/prefer-default-parameters': 'warn',
      'unicorn/prefer-dom-node-append': 'warn',
      'unicorn/prefer-dom-node-dataset': 'warn',
      'unicorn/prefer-dom-node-remove': 'warn',
      'unicorn/prefer-dom-node-text-content': 'warn',
      'unicorn/prefer-event-target': 'warn',
      'unicorn/prefer-includes': 'warn',
      'unicorn/prefer-keyboard-event-key': 'warn',
      'unicorn/prefer-math-trunc': 'warn',
      'unicorn/prefer-modern-dom-apis': 'warn',
      'unicorn/prefer-modern-math-apis': 'warn',
      'unicorn/prefer-native-coercion-functions': 'warn',
      'unicorn/prefer-negative-index': 'warn',
      'unicorn/prefer-node-protocol': 'warn',
      'unicorn/prefer-number-properties': 'warn',
      'unicorn/prefer-object-from-entries': 'warn',
      'unicorn/prefer-optional-catch-binding': 'warn',
      'unicorn/prefer-prototype-methods': 'warn',
      'unicorn/prefer-query-selector': 'warn',
      'unicorn/prefer-reflect-apply': 'warn',
      'unicorn/prefer-regexp-test': 'warn',
      'unicorn/prefer-string-replace-all': 'warn',
      'unicorn/prefer-string-slice': 'warn',
      'unicorn/prefer-string-starts-ends-with': 'warn',
      'unicorn/prefer-string-trim-start-end': 'warn',
      'unicorn/prefer-switch': 'warn',
      'unicorn/prefer-top-level-await': 'warn',
      'unicorn/prefer-type-error': 'warn',
      'unicorn/relative-url-style': 'warn',
      'unicorn/require-array-join-separator': 'warn',
      'unicorn/require-number-to-fixed-digits-argument': 'warn',
      'unicorn/template-indent': 'warn',
      'unicorn/throw-new-error': 'warn',
    },
  },
  promise: {
    extends: [pluginPromise.configs['flat/recommended']],
    rules: {'promise/always-return': 'off'},
  },
  codegen: {
    extends: [codegen.flatConfig.recommendedConfig as Config],
    // TODO: Add a linter rule for preferring named exports especially when working with barrel files
    // Though barrel should probably not be the default pattern as we want more specific imports generally speaking
    // combined with explicit entry points in package.json though esm
    rules: {'codegen/codegen': 'warn'},
  },
  'eslint-comments': {
    plugins: {
      'eslint-comments': pluginEslintComments,
    },
    rules: {
      'eslint-comments/disable-enable-pair': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'eslint-comments/no-unused-disable': 'warn',
    },
  },
  jest: {
    files: [
      '**/__{mocks,tests}__/**/*.{js,ts,tsx}',
      '**/*.{spec,test}.{js,ts,tsx}',
    ],

    plugins: {'jest-formatting': pluginJestFormatting},
    extends: [pluginJest.configs['flat/recommended']],
    rules: {
      ...pluginJestFormatting.configs.recommended.overrides.rules,
      'jest/expect-expect': 'off',
      'jest/no-standalone-expect': [
        'error',
        {additionalTestBlockFunctions: ['$test']},
      ],
    },
  },
  prettier: {
    extends: [configPrettier],
  },
  // Does not work because requires esm module. We should upgrade fully to esm one day
  // css: {
  //   plugins: {
  //     css: pluginCss,
  //   },
  //   language: 'css/css',
  //   languageOptions: {
  //     customSyntax: tailwindSyntax,
  //   },
  //   rules: {
  //     'css/no-empty-blocks': 'error',
  //   },
  // },
} satisfies Record<string, Omit<ConfigWithExtends, 'name'>>)

export default defineConfig(
  Object.values(configs) as [any],
  // defineConfigs will modify the config names actually
) as Array<
  {name: `${keyof typeof configs}${string}`} & ConfigWithExtendsArray[number]
>
