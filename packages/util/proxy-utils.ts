/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function noopFunctionMap<T = any>() {
  return new Proxy({}, {get: () => () => undefined}) as T
}

type ProxyRequiredOptions = {
  formatError?: (context: {
    key: string
    value: unknown
    throwOn: 'missing' | 'undefined' | 'nullish'
    reason: 'missing' | 'undefined' | 'null'
  }) => Error
  /**
   * Controls which values trigger an error:
   * - 'missing': throw when property is not present in object
   * - 'undefined': throw when property is undefined
   * - 'nullish': throw when property is null or undefined (default)
   */
  throwOn?: 'missing' | 'undefined' | 'nullish'
}

/**
 * Wraps around the given object and throws an error if a property is accessed that is `null` or `undefined`.
 * Useful for getting values from things like headers or env vars
 */
export function proxyRequired<T extends object>(
  target: T,
  opts?: ProxyRequiredOptions,
) {
  const formatError =
    opts?.formatError ??
    (({key, reason, throwOn}) =>
      new Error(`${key} is required (${reason}) when throwOn is '${throwOn}'`))
  const throwOn = opts?.throwOn ?? 'nullish'

  return new Proxy(target, {
    get(target, p) {
      const key = p as keyof typeof target
      const value = target[key]
      const hasProperty = Object.prototype.hasOwnProperty.call(target, key)

      if (
        (throwOn === 'missing' && !hasProperty) ||
        (throwOn === 'undefined' && value === undefined) ||
        (throwOn === 'nullish' && value == null)
      ) {
        const reason = !hasProperty
          ? 'missing'
          : value === undefined
            ? 'undefined'
            : 'null'
        throw formatError({key: key as string, value, throwOn, reason})
      }
      return value
    },
  }) as {[k in keyof typeof target]-?: NonNullable<(typeof target)[k]>}
}

/**
 * Recursively wraps an object and its nested objects to throw errors on accessing null/undefined values.
 * All nested object properties are also proxied with the same behavior.
 */
export function proxyRequiredRecursive<T extends object>(
  target: T,
  opts?: ProxyRequiredOptions,
  parentPath = '',
) {
  const formatError =
    opts?.formatError ??
    (({key, reason}) => new Error(`${key} is required (${reason})`))
  const throwOn = opts?.throwOn ?? 'nullish'

  return new Proxy(target, {
    get(target, p) {
      const key = p as keyof typeof target
      const value = target[key]
      const keyPath = parentPath ? `${parentPath}.${String(key)}` : String(key)
      const hasProperty = Object.prototype.hasOwnProperty.call(target, key)

      if (
        (throwOn === 'missing' && !hasProperty) ||
        (throwOn === 'undefined' && value === undefined) ||
        (throwOn === 'nullish' && value == null)
      ) {
        const reason = !hasProperty
          ? 'missing'
          : value === undefined
            ? 'undefined'
            : 'null'
        throw formatError({key: keyPath, value, throwOn, reason})
      }

      // Recursively proxy nested objects
      if (typeof value === 'object' && value !== null) {
        return proxyRequiredRecursive(value, opts, keyPath)
      }

      return value
    },
  }) as {[k in keyof typeof target]-?: NonNullable<(typeof target)[k]>}
}
