import type {ParserOptions} from '@electric-sql/pglite'
import type * as pgTypes from 'pg-types'

import {builtins} from 'pg-types'

/**
 * Safely parses a string into a number, throwing errors if the value is outside the safe integer range
 * or cannot be parsed as a number.
 */
export function parseNumber(value: string): number {
  const num = Number(value)

  if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
    throw new Error(
      `Number overflow: ${value} is outside the safe integer range`,
    )
  }
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number: ${value}`)
  }

  return num
}

export const parsers = {
  // electric-sql/pglite use the same types as node-postgres given that
  // ultimately type oid comes from postgres itself
  [builtins.DATE]: (val) => val,
  [builtins.TIMESTAMP]: (val) => val,
  [builtins.TIMESTAMPTZ]: (val) => val,
  [builtins.INTERVAL]: (val) => val,
  [builtins.NUMERIC]: (val) => parseNumber(val),
  [builtins.INT8]: (val) => parseNumber(val),
  [builtins.INT4]: (val) => parseNumber(val),
  [builtins.INT2]: (val) => parseNumber(val),
  [builtins.FLOAT8]: (val) => parseNumber(val),
  [builtins.FLOAT4]: (val) => parseNumber(val),
  [builtins.MONEY]: (val) => parseNumber(val),
} satisfies ParserOptions

// this is also unfortunately global... but that appears to be the way
// pgTypes is designed to work?
export function setTypeParsers(types: typeof pgTypes) {
  for (const [type, parser] of Object.entries(parsers)) {
    types.setTypeParser(
      Number(type),
      parser as pgTypes.TypeParser<string, unknown>,
    )
  }
  return types
}
