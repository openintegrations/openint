import configArray, {configs, defineConfig} from '@openint/eslint-config'
import pkgJson from './package.json'

const {globaIgnores, defaultFiles, javascript, typescript} = configs

export const shortConfig = defineConfig(
  globaIgnores as any,
  defaultFiles as any,
  javascript as any,
  typescript as any,
)

const finalConfig = defineConfig(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  ...(configArray.filter((c) => !c.name.startsWith('unicorn')) as any[]),
  {
    name: 'reactVersion',
    settings: {
      react: {version: pkgJson.pnpm.overrides.react},
    },
  } as any,
)

export default finalConfig

// @ts-expect-error Upgrade types so .main exists
if (import.meta.main) {
  console.log(finalConfig)
}
