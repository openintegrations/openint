import {BaseError as _BaseError} from 'make-error'
import {javascriptStringify} from './json-utils'
import {isPlainObject} from './object-utils'

export {BaseError} from 'make-error'

export default class RichError extends _BaseError {
  info?: Record<string, unknown>

  constructor(message: string, info?: Record<string, unknown>) {
    super(message)
    this.info = info
  }
}

export function normalizeError(err: unknown) {
  if (err instanceof Error) {
    return err
  }
  if (isPlainObject(err)) {
    return new RichError(getErrorMessage(err), err)
  }
  return new Error(getErrorMessage(err))
}

export function getErrorMessage(err: unknown) {
  if (typeof err === 'string') {
    return err
  }
  if (!!err && typeof err === 'object') {
    if ('message' in err) {
      return (err as {message: string}).message
    }
  }
  return javascriptStringify(err) ?? '<Error>'
}

export function getLocalizedErrorMessage(err: unknown) {
  if (typeof err === 'string') {
    return err
  }
  if (!!err && typeof err === 'object') {
    if ('localizedMessage' in err) {
      return (err as {localizedMessage: string}).localizedMessage
    }
    if ('message' in err) {
      return (err as {message: string}).message
    }
  }
  return 'Something went wrong'
}

function get(obj: unknown, key: string) {
  if (
    obj != null &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    key in obj
  ) {
    return obj[key as keyof typeof obj] as unknown
  }
  return undefined
}
function getString(obj: unknown, key: string) {
  const val = get(obj, key)
  return typeof val === 'string' ? val : undefined
}
function getNumber(obj: unknown, key: string) {
  const val = get(obj, key)
  return typeof val === 'number' ? val : undefined
}
function getBoolean(obj: unknown, key: string) {
  const val = get(obj, key)
  return typeof val === 'boolean' ? val : undefined
}

export function isAggregateError(e: unknown): e is AggregateError {
  return (
    e instanceof AggregateError ||
    (get(e, 'name') === 'AggregateError' && Array.isArray(get(e, 'errors')))
  )
}

export function formatError(err: unknown): string {
  if (isAggregateError(err)) {
    const msgs = err.errors.map(formatError)
    return `AggregateError: ${msgs.length} errors${msgs
      .map((m, i) => `\n\t${i + 1}: ${m}`)
      .join('')}`
  }
  if (typeof err === 'string') {
    return err
  }

  const name = getString(err, 'name')
  const code = getString(err, 'code')
  const message = getString(err, 'message')

  const msg = [
    name !== 'Error' && name,
    code && message?.includes(`${code}`) && code,
    message?.trim(),
  ]
    .filter((f) => !!f)
    .join(' ')
  if (msg) {
    return msg
  }
  return `Unknown error: ${err}`
}
