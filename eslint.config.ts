import pluginJs from '@eslint/js'
import codegen from 'eslint-plugin-codegen'
// @ts-expect-error No types available
import pluginEslintComments from 'eslint-plugin-eslint-comments'
// @ts-expect-error No types available
import pluginJest from 'eslint-plugin-jest'
// @ts-expect-error No types available
import pluginJestFormatting from 'eslint-plugin-jest-formatting'
// @ts-expect-error No types available
import pluginPromise from 'eslint-plugin-promise'
import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginTs from 'typescript-eslint'

// TODO: Consider putting eslint config into its own folder, like some other recommended setups!

// TODO: Add prettier, react, react hooks and next.js, jest
export default pluginTs.config(
  {
    name: 'globaIgnores',
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
  {
    name: 'defaultFiles',
    files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.cts', '**.*.mts'],
  },
  {
    name: 'javascript',
    extends: [pluginJs.configs.recommended],
    rules: {
      'arrow-body-style': 'warn',
      'object-shorthand': 'warn',
      'prefer-const': 'warn',
      quotes: ['warn', 'single', {avoidEscape: true}],
      'require-await': 'off',
      // TODO: Figure this out...

      // 'react/jsx-curly-brace-presence': 'warn',

      // 'react-hooks/exhaustive-deps': [
      //   'warn',
      //   {additionalHooks: '(useUpdateEffect)'},
      // ],
      // 'import/no-unresolved': 'error',
    },
  },
  {
    name: 'unicorn',
    extends: [pluginUnicorn.configs.recommended],
    rules: {
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  {
    name: 'codegen',
    extends: [codegen.flatConfig.recommendedConfig as any],
    rules: {'codegen/codegen': 'warn'},
  },
  {
    name: 'promise',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    extends: [pluginPromise.configs['flat/recommended']],
    rules: {'promise/always-return': 'off'},
  },
  {
    plugins: {
      'eslint-comments': pluginEslintComments,
    },
    rules: {
      'eslint-comments/disable-enable-pair': 'off',
      'eslint-comments/no-unlimited-disable': 'off',
      'eslint-comments/no-unused-disable': 'warn',
    },
  },

  {
    files: [
      '**/__{mocks,tests}__/**/*.{js,ts,tsx}',
      '**/*.{spec,test}.{js,ts,tsx}',
    ],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    plugins: {'jest-formatting': pluginJestFormatting},
    extends: [pluginJest.configs['flat/recommended']],

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    rules: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...pluginJestFormatting.configs.recommended.overrides.rules,
      'jest/expect-expect': 'off',
    },
  },
  {
    name: 'typescript',
    extends: [pluginTs.configs.strict],
    // extends: [pluginTs.configs.strictTypeChecked],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
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
      'no-implied-eval': 'off',
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
    },
  },
)
