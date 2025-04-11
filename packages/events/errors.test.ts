import {describe, expect, test} from '@jest/globals'
import {TRPCError} from '@trpc/server'
import Err, {
  formatError,
  isError,
  makeError,
  parseError,
  throwError,
} from './errors'

describe('makeError', () => {
  test('creates a TRPC error with correct properties', () => {
    const error = makeError('BAD_REQUEST', {message: 'Invalid input'})

    expect(error).toBeInstanceOf(TRPCError)
    expect(error.name).toBe('BAD_REQUEST')
    expect(error.data).toEqual({message: 'Invalid input'})
    expect(error.message).toEqual(
      JSON.stringify({message: 'Invalid input'}, null, 2),
    )
  })

  test('creates a custom error with correct properties', () => {
    const error = makeError('UNKNOWN_ERROR', {
      message: 'Something went wrong',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('UNKNOWN_ERROR')
    expect(error.data).toEqual({message: 'Something went wrong'})
  })

  test('creates a validation error with correct properties', () => {
    const error = makeError('SCHEMA_VALIDATION_ERROR', {
      issues: [{path: ['field'], message: 'Required', code: 'invalid_type'}],
      description: 'Validation failed',
      json_schema: {},
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('SCHEMA_VALIDATION_ERROR')
    expect(error.data).toEqual({
      issues: [{path: ['field'], message: 'Required', code: 'invalid_type'}],
      description: 'Validation failed',
      json_schema: {},
    })
  })
})

describe('parseError', () => {
  test('parses a TRPC error correctly', () => {
    const originalError = makeError('BAD_REQUEST', {message: 'Invalid input'})
    const parsedError = parseError(originalError)

    expect(parsedError.name).toBe('BAD_REQUEST')
    expect(parsedError.data).toEqual({message: 'Invalid input'})
  })

  test('parses a custom error correctly', () => {
    const originalError = makeError('UNKNOWN_ERROR', {
      message: 'Something went wrong',
    })
    const parsedError = parseError(originalError)

    expect(parsedError.name).toBe('UNKNOWN_ERROR')
    expect(parsedError.data).toEqual({message: 'Something went wrong'})
  })

  test('parses a validation error correctly', () => {
    const originalError = makeError('SCHEMA_VALIDATION_ERROR', {
      issues: [{path: ['field'], message: 'Required', code: 'invalid_type'}],
      description: 'Validation failed',
      json_schema: {},
    })
    const parsedError = parseError(originalError)

    expect(parsedError.name).toBe('SCHEMA_VALIDATION_ERROR')
    expect(parsedError.data).toEqual({
      issues: [{path: ['field'], message: 'Required', code: 'invalid_type'}],
      description: 'Validation failed',
      json_schema: {},
    })
  })

  test('handles non-object errors', () => {
    const parsedError = parseError('String error')

    expect(parsedError.name).toBe('UNKNOWN_ERROR')
    expect(parsedError.data).toEqual({message: 'String error'})
  })

  test('handles null errors', () => {
    const parsedError = parseError(null)

    expect(parsedError.name).toBe('UNKNOWN_ERROR')
    expect(parsedError.data).toEqual({message: 'null'})
  })

  test('handles errors with digest', () => {
    const error = makeError('BAD_REQUEST', {message: 'Invalid input'})
    const errorWithDigest = {...error, digest: 'abc123'}
    const parsedError = parseError(errorWithDigest)

    expect(parsedError.name).toBe('BAD_REQUEST')
    expect(parsedError.data).toEqual({message: 'Invalid input'})
    expect(parsedError.digest).toBe('abc123')
  })

  test('handles manually constructed errors with JSON message', () => {
    const error = new Error(JSON.stringify({message: 'Invalid input'}))
    error.name = 'BAD_REQUEST'
    const parsedError = parseError(error)

    expect(parsedError.name).toBe('BAD_REQUEST')
    expect(parsedError.data).toEqual({message: 'Invalid input'})
  })

  test('handles manually constructed TRPC errors', () => {
    const error = new TRPCError({
      code: 'NOT_FOUND',
      message: 'Once upon a time in a land far far away',
    })
    const parsedError = parseError(error)
    console.log(parsedError)

    expect(parsedError.name).toBe('NOT_FOUND')
    expect(parsedError.data).toEqual({
      message: 'Once upon a time in a land far far away',
    })
  })
})

describe('isError', () => {
  test('correctly identifies error by name', () => {
    const error = makeError('BAD_REQUEST', {message: 'Invalid input'})

    expect(isError(error, 'BAD_REQUEST')).toBe(true)
    expect(isError(error, 'UNKNOWN_ERROR')).toBe(false)
  })

  test('works with parseError', () => {
    const error = makeError('BAD_REQUEST', {message: 'Invalid input'})
    const parsedError = parseError(error)

    expect(isError(parsedError, 'BAD_REQUEST')).toBe(true)
    expect(isError(parsedError, 'UNKNOWN_ERROR')).toBe(false)
  })

  test('handles unknown errors', () => {
    const error = new Error('Unknown error')

    expect(isError(error, 'UNKNOWN_ERROR')).toBe(true)
    expect(isError(error, 'BAD_REQUEST')).toBe(false)
  })
})

describe('formatError', () => {
  test('formats UNKNOWN_ERROR correctly', () => {
    const error = makeError('UNKNOWN_ERROR', {})
    const formatted = formatError(error)

    expect(formatted).toBe('An unknown error has occurred')
  })

  test('formats PATH_PARAMS_ERROR correctly', () => {
    const error = makeError('PATH_PARAMS_ERROR', {
      issues: [{path: ['id'], message: 'Required', code: 'invalid_type'}],
      description: 'Validation failed',
      json_schema: {},
    })
    const formatted = formatError(error)

    expect(formatted).toBe('Path params did not match schema')
  })

  test('formats SEARCH_PARAMS_ERROR correctly', () => {
    const error = makeError('SEARCH_PARAMS_ERROR', {
      issues: [{path: ['filter'], message: 'Required', code: 'invalid_type'}],
      description: 'Validation failed',
      json_schema: {},
    })
    const formatted = formatError(error)

    expect(formatted).toBe('Search params did not match schema')
  })

  test('formats BAD_REQUEST correctly', () => {
    const error = makeError('BAD_REQUEST', {message: 'Invalid input'})
    const formatted = formatError(error)

    // Since BAD_REQUEST is not in the errorMessageMap, it should use titleCase
    expect(formatted).toBe('Bad Request')
  })

  test('formats NOT_FOUND correctly', () => {
    const error = Err.make('NOT_FOUND', {message: 'Resource not found'})
    const formatted = Err.format(error)

    // Since NOT_FOUND is not in the errorMessageMap, it should use titleCase
    expect(formatted).toBe('Not Found')
  })
})

describe('throwError', () => {
  test('throws a TRPC error correctly', () => {
    expect(() => Err.throw('BAD_REQUEST', {message: 'Invalid input'})).toThrow(
      TRPCError,
    )
  })

  test('throws a custom error correctly', () => {
    expect(() =>
      throwError('UNKNOWN_ERROR', {message: 'Something went wrong'}),
    ).toThrow(Error)
  })
})
