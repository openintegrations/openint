import {z, type Z} from '@openint/util/zod-utils'
import {createEnv} from '@t3-oss/env-nextjs'

export * from './env'
export * from './env-test'
export * from './proxyRequired'

/** @deprecated */
export function getEnv<T extends Z.ZodTypeAny = Z.ZodString>(
  name: string,
  schema?: T,
): Z.infer<T> {
  const env = createEnv({
    server: {[name]: schema ?? z.string()},
    runtimeEnv: process.env,
  })
  return env[name as keyof typeof env]
}
