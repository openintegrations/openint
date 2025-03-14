import configArray from '@openint/eslint-config'

// const finalConfig = [configs.globaIgnores, configs.defaultFiles]
const finalConfig = configArray.filter((c) => !c.name.startsWith('unicorn'))

export default finalConfig

// @ts-expect-error Upgrade types so .main exists
if (import.meta.main) {
  console.log(finalConfig)
}
