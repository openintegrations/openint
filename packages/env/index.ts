import {z} from '@opensdks/util-zod'
import {createEnv} from './createEnv'

export * from './env'
export * from './env-test'
export * from './proxyRequired'

/** @deprecated */
export function getEnv<T extends z.ZodTypeAny = z.ZodString>(
  name: string,
  schema?: T,
): z.infer<T> {
  const env = createEnv({
    server: {[name]: schema ?? z.string()},
    runtimeEnv: process.env,
  })
  return env[name as keyof typeof env]
}
