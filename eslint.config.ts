import configArray, {configs, defineConfig} from '@openint/eslint-config'
import pkgJson from './package.json'

const {globaIgnores, defaultFiles, javascript, typescript} = configs

export const shortCOnfig = defineConfig(
  globaIgnores,
  defaultFiles,
  javascript,
  typescript,
)

const finalConfig = defineConfig(
  ...configArray.filter((c) => !c.name.startsWith('unicorn')),

  {
    name: 'reactVersion',
    settings: {
      react: {version: pkgJson.pnpm.overrides.react},
    },
  },
)

export default finalConfig

// @ts-expect-error Upgrade types so .main exists
if (import.meta.main) {
  console.log(finalConfig)
}
