import configArray, {
  configs,
  defineConfig,
} from '@openint/dev-configs/eslint.config.base'
import pkgJson from './package.json'

export const shortConfig = defineConfig(
  configs.globaIgnores as any,
  configs.defaultFiles as any,
  configs.javascript,
  // configs.typescript as any,
  configs.import as any,
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

// export default shortConfig
export default finalConfig

// @ts-expect-error Upgrade types so .main exists
if (import.meta.main) {
  console.log(finalConfig)
}
