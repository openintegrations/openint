// @ts-check
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// Failing due to https://github.com/eslint/css/issues/56, should be released in few days hopefully
// import pluginCss from '@eslint/css'
import pluginJs from '@eslint/js'
// @ts-expect-error No types available
import pluginNext from '@next/eslint-plugin-next'
import configPrettier from 'eslint-config-prettier/flat'
import codegen from 'eslint-plugin-codegen'
// @ts-expect-error No types available
import pluginEslintComments from 'eslint-plugin-eslint-comments'
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
import {defineConfig} from 'eslint/config'
import pluginTs from 'typescript-eslint'

export type ConfigWithExtendsArray = Extract<
  Parameters<typeof defineConfig>[0],
  {extends?: unknown}
>
export type Config = ReturnType<typeof defineConfig>[number]

export {defineConfig}

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
      'no-fallthrough': 'warn'
    },
  },
  typescript: {
    // extends: [pluginTs.configs.strict as Config[]],
    extends: [pluginTs.configs.strictTypeChecked as Config[]],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
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

      '@typescript-eslint/no-confusing-void-expression': 'warn',
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
    },
  },
  next: {
    plugins: {'@next/next': pluginNext},
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
    },
  },
  prettier: {
    extends: [configPrettier],
  },
} satisfies Record<string, Omit<ConfigWithExtendsArray, 'name'>>)

export default defineConfig(
  Object.values(configs) as [ConfigWithExtendsArray],
  // defineConfigs will modify the config names actually
) as Array<ConfigWithExtendsArray & {name: `${keyof typeof configs}${string}`}>
