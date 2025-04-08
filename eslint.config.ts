import configArray, {
  configs,
  defineConfig,
} from '@openint/dev-configs/eslint.config'
import pkgJson from './package.json'

export const shortConfig = defineConfig(
  configs.globaIgnores,
  configs.defaultFiles,
  configs.javascript,
  // configs.typescript as any,
  configs.import,
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
