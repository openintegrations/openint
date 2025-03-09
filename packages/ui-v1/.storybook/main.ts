// until we figure out how to get tsconfig to include this file
import {dirname, join} from 'node:path'
import type {StorybookConfig} from '@storybook/experimental-nextjs-vite'
import {default as svgr} from 'vite-plugin-svgr'

/**
 * defineMain does not exist in storybook/experimental-nextjs-vite
 * so we still hack for now use the type based config
 * https://storybook.js.org/docs/api/csf/csf-factories#2-update-your-main-storybook-config-file
 */
// function defineMain<T>(config: T) {
//   return config
// }

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')))
}

const config = {
  stories: [
    // Should be kept in sync with global.css files
    '../stories/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../shadcn/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../shadcn/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../shadcn/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../ui/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../ui/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Will only work in (v1) directory
    // Generally speaking all stories should be in ui-v1
    '../../../apps/web/app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/experimental-addon-test'),
    //     getAbsolutePath('@storybook/addon-links'),
    //     getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/experimental-nextjs-vite'),
    options: {},
  },
  async viteFinal(config, {configType}) {
    config.plugins = config.plugins || []
    config.plugins.push(svgr())
    // Only works in v4 storybook...
    // https://github.com/tailwindlabs/tailwindcss/issues/13216#issuecomment-1992094356
    // config.plugins.push((await import('@tailwindcss/vite')).default())
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude ?? []),
        '@electric-sql/pglite',
      ],
    }

    return config
  },
} satisfies StorybookConfig

export default config
