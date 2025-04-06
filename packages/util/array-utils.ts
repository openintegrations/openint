import type {MaybeArray, NonEmptyArray} from './type-utils'

export {inPlaceSort, sort} from 'fast-sort'

export function nonEmpty<T>(arr: T[]) {
  if (arr.length === 0) {
    throw new Error('Expected non-empty array')
  }
  return arr as NonEmptyArray<T>
}

/**
 * https://stackoverflow.com/a/16436975/692499
 */
export function arrayEquals<T>(
  a: T[],
  b: T[],
  isEqual: (a: T | undefined, b: T | undefined) => boolean = Object.is,
) {
  if (a === b) {
    return true
  }
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; ++i) {
    if (!isEqual(a[i], b[i])) {
      return false
    }
  }
  return true
}

export function fromMaybeArray<T>(maybeArray: MaybeArray<T>) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray]
}

/**
 * Removes all falsy values (false, null, 0, "", undefined, and NaN) from an array
 */
export function compact<T>(
  array: Array<T | false | null | undefined | 0 | '' | 0n>,
) {
  return array.filter(Boolean) as T[]
}
