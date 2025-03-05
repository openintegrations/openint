/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  setupFiles: ['jest-date-mock'],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/apps/web/.next/',
    '/apps/web/out/',
  ],
  watchPathIgnorePatterns: [
    '\\.gen\\.d\\.ts',
    '\\.gen\\.ts',
    '\\.gen\\.json',
    '\\.schema\\.json',
  ],
  testRegex: '\\.(spec|test)\\.[jt]sx?$',
  transform: {
    '^.+\\.(js|ts|tsx)$': [
      'esbuild-jest',
      {
        sourcemap: true,
        target: 'node14',
        format: 'cjs',
      },
    ],
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {outputPath: './artifacts/test-report.html'},
    ],
  ],
}

// NOTE maybe required for kits/file-picker
// import '@testing-library/jest-dom';

// If you are using @jest/globals with injectGlobals: false, you will need to use a different import in your tests setup file:

// // In your own jest-setup.js (or any other name)
// import '@testing-library/jest-dom/jest-globals'
