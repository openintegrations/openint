import pluginJs from '@eslint/js'
import codegen from 'eslint-plugin-codegen'
// @ts-expect-error No types available
import pluginEslintComments from 'eslint-plugin-eslint-comments'
// @ts-expect-error No types available
import pluginPromise from 'eslint-plugin-promise'
import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginTs from 'typescript-eslint'

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
  pluginJs.configs.recommended,
  pluginUnicorn.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  codegen.flatConfig.recommendedConfig as any,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  pluginPromise.configs['flat/recommended'],
  // {
  //   plugins: {
  //     'eslint-comments': pluginEslintComments,
  //   },
  //   // extends: [pluginEslintComments.configs.recommended],
  // },
  {
    name: 'typescript',
    // @ts-expect-error not matching type but works at runtime, unclear why.
    plugins: {pluginTs: pluginTs},
    extends: [pluginTs.configs.strictTypeChecked],

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
      'require-await': 'off',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'warn',
    },
  },
)
