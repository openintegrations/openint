import type Z from 'zod'
import zod, {ZodError} from 'zod'
import {extendZodWithOpenApi} from 'zod-openapi'
import {compact} from './array-utils'
import {R} from './remeda'

const DANGEROUSLY_ENABLE_ZOD_INPUT_DEBUG =
  process.env['DANGEROUSLY_ENABLE_ZOD_INPUT_DEBUG'] === 'true'

function makeZod() {
  // This is the only way to ensure extendZodWithOpenApi is called before we use z
  extendZodWithOpenApi(zod)

  if (DANGEROUSLY_ENABLE_ZOD_INPUT_DEBUG) {
    const orgMessage = Object.getOwnPropertyDescriptor(
      zod.ZodError.prototype,
      'message',
    )!.get
    if (!orgMessage) {
      throw new Error('Failed to get original ZodError.message getter')
    }
    Object.defineProperty(zod.ZodError.prototype, 'message', {
      get() {
        const msg = orgMessage.call(this)
        // We do this to prevent data from being too long to display
        return `{
    "issues": ${msg},
    "data": ${JSON.stringify(this.data)}
  }`
      },
      configurable: true,
      enumerable: true,
    })

    // extend zod to include the data in the error
    const origSafeParse = zod.ZodType.prototype.safeParse
    zod.ZodType.prototype.safeParse = function (data, params) {
      const result = origSafeParse.call(this, data, params)
      if (!result.success) {
        Object.assign(result.error, {data})
      }
      return result
    }
    const origSafeParseAsync = zod.ZodType.prototype.safeParseAsync
    zod.ZodType.prototype.safeParseAsync = async function (data, params) {
      const result = await origSafeParseAsync.call(this, data, params)
      if (!result.success) {
        Object.assign(result.error, {data})
      }
      return result
    }
  }

  // Consider adding more specific handling around adding local data failure
  // to the issues object also via z.setErrorMap

  return zod
}

export type {Z}
export type ZodErrorWithData<T = unknown> = Z.ZodError & {data: T}

export const z = makeZod()

export function isZodError<T>(error: unknown): error is ZodErrorWithData<T> {
  if (error instanceof ZodError) {
    if (DANGEROUSLY_ENABLE_ZOD_INPUT_DEBUG && !('data' in error)) {
      console.error('No data found in ZodError. Did you z from makeZod', error)
      throw new Error('No data found in ZodError. Did you z from makeZod')
    }
    return true
  }
  return false
}

export function getInputData<T>(error: unknown): T | undefined {
  if (isZodError<T>(error)) {
    return error.data
  }
  return undefined
}

export function parseIf<T>(value: unknown, typeguard: (v: unknown) => v is T) {
  return typeguard(value) ? value : undefined
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value != null
}

export type JsonLiteral = Z.infer<typeof zLiteral>
export const zLiteral = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  // z.undefined(), // Technicall not valid json..
])

export type Json = JsonLiteral | {[key: string]: Json} | Json[]
export const zJson: Z.ZodType<Json> = z.lazy(() =>
  z.union([zLiteral, z.array(zJson), z.record(zJson)]),
)

export type JsonObject = Z.infer<typeof zJsonObject>
export const zJsonObject = z.record(zJson)

export function zGuard<T, U>(fn: (input: T) => U | Promise<U>) {
  return (out: T, ctx: Z.RefinementCtx) => {
    function catchError(err: unknown) {
      if (err instanceof ZodError) {
        err.issues.forEach((issue) => ctx.addIssue({...issue, fatal: true}))
      } else {
        ctx.addIssue({code: 'custom', fatal: true, message: `${err}`})
      }
      return err as U // Due to fatal, this will never be used
    }
    try {
      const ret = fn(out)
      return R.isPromise(ret) ? ret.catch(catchError) : ret
    } catch (err) {
      return catchError(err)
    }
  }
}

export function zGuardTransform<ZType extends Z.ZodTypeAny, U>(
  fn: (input: Z.output<ZType>) => U | Promise<U>,
) {
  return (zType: ZType) => zType.transform(zGuard(fn))
}

export function zRefineNonNull<TOut, ZType extends Z.ZodType<TOut>>(
  zType: ZType,
) {
  return zType
    .superRefine((input) => !!input)
    .transform((input) => input as NonNullable<TOut>)
}

/**
 * e.g. `schema.transform(cast<TOut>())
 * Useful as a casting typeguard
 * HOC because prettier doesn't understand how to format... https://share.cleanshot.com/vfED5U
 * and it is also tricky in ts to declare
 *
 */
// prettier-ignore
export const cast = <T>() => (_input: unknown) => _input as T

// prettier-ignore
/** `schema.refine(castIs<TOut>)` */
export const castIs = <T>() =>(_input: unknown): _input is T => true

/** `zCast<TOut>()` standalone */
export const zCast = <T>(...args: Parameters<(typeof z)['unknown']>) =>
  z.unknown(...args) as Z.ZodType<T, Z.ZodTypeDef, unknown>

/** Alternative to zCast that only accepts Records as inputs */
export const zRecord = <T extends Record<string, unknown>>() =>
  z.record(z.unknown()) as Z.ZodType<T, Z.ZodTypeDef, Record<string, unknown>>

export const zObject = <T extends Record<string, unknown>>() =>
  z.object({}) as unknown as Z.ZodType<T, Z.ZodTypeDef, Record<string, unknown>>

/** `castInput(schema)<TInput>()` */
export const castInput =
  <T extends Z.ZodTypeAny>(schema: T) =>
  <TInput extends T['_input']>() =>
    schema as Z.ZodType<T['_output'], Z.ZodTypeDef, TInput>

export function isZodType(input: unknown): input is Z.ZodTypeAny {
  const obj = input as Z.ZodTypeAny
  return typeof obj === 'object' && typeof obj._def === 'object'
}

/** Not secure because we could leak secrets to logs */
export function zodInsecureDebug() {
  z.setErrorMap((_issue, ctx) => {
    // Need to get the `schema` as well.. otherwise very hard to debug
    // which part is failing because we use Zod for almost everything...
    console.error('[zod] Data did not pass validation', {
      data: ctx.data as unknown,
      issue: _issue,
    })
    return {message: ctx.defaultError}
  })
}

// MARK: - Custom wrapper and error handling

/** Better ZodParser... @see https://github.com/colinhacks/zod/issues/105 */
export function zParser<T extends Z.ZodType>(schema: T) {
  const _catchErr = (err: unknown) =>
    catchZodError(err, {rootTypeName: schema.description})

  const parseUnknown = (
    ...args: Parameters<typeof schema.parse>
  ): Z.output<T> => {
    try {
      return schema.parse(...args) as unknown
    } catch (err) {
      return _catchErr(err)
    }
  }
  const parseUnknownAsync: typeof schema.parseAsync = (
    ...args: Parameters<typeof schema.parseAsync>
  ): Promise<Z.output<T>> => schema.parseAsync(...args).catch(_catchErr)

  return {
    schema,
    _input: schema._input as Z.input<T>,
    _output: schema._output as Z.output<T>,
    parseUnknown,
    parse: (
      input: T['_input'],
      ...rest: Rest1<Parameters<typeof parseUnknown>>
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      parseUnknown(input, ...rest),
    parseUnknownAsync,
    parseAsync: (
      input: T['_input'],
      ...reest: Rest1<Parameters<typeof parseUnknown>>
    ) => parseUnknownAsync(input, ...reest),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rest1<T extends [any, ...any[]]> = T extends [any, ...infer U] ? U : []

export function catchZodError(err: unknown, opts?: {rootTypeName?: string}) {
  if (err instanceof ZodError && err.issues[0]) {
    const issue = err.issues[0]
    const paths = compact([opts?.rootTypeName, ...issue.path])
    throw new Error(`${issue.code} at ${paths.join('.')}: ${issue.message}`)
  }
  throw err
}

/**
 * Default boolean coercion with z.coerce.boolean() may not work how you expect.
 * Any truthy value is coerced to true, and any falsy value is coerced to false.
 *
 * @see https://zod.dev/?id=booleans
 */
export function zCoerceBoolean(params?: Z.RawCreateParams) {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      const v = val.toLowerCase()
      if (v === 'false' || v === '0') {
        return false
      }
    }
    return Boolean(val)
  }, z.boolean(params))
}
