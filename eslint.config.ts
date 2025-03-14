import configArray, {defineConfig} from '@openint/eslint-config'
import pkgJson from './package.json'

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
