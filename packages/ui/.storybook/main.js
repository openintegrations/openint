import {dirname, join} from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')))
}

/** @type { import('@storybook/nextjs').StorybookConfig } */
const config = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/experimental-addon-test'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/experimental-nextjs-vite'),
    options: {},
  },
}
export default config
// const {dirname, join} = require('path')
// const {default: svgr} = require('vite-plugin-svgr')

// /**
//  * This function is used to resolve the absolute path of a package.
//  * It is needed in projects that use Yarn PnP or are set up within a monorepo.
//  */
// function getAbsolutePath(value) {
//   return dirname(require.resolve(join(value, 'package.json')))
// }

// /** @type { import('@storybook/react-vite').StorybookConfig } */
// const config = {
//   stories: [
//     '../stories/**/*.mdx',
//     '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
//   ],
//   addons: [
//     getAbsolutePath('@storybook/addon-onboarding'),
//     getAbsolutePath('@storybook/addon-links'),
//     getAbsolutePath('@storybook/addon-essentials'),
//     getAbsolutePath('@chromatic-com/storybook'),
//     getAbsolutePath('@storybook/addon-interactions'),
//   ],
//   framework: {
//     name: getAbsolutePath('@storybook/react-vite'),
//     options: {},
//   },

//   async viteFinal(config, {configType}) {
//     config.plugins = config.plugins || []
//     config.plugins.push(svgr())

//     return config
//   },
// }

// export default config
