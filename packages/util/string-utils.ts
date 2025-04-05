// MARK: - Casing
import {camelCase as _camelCase, snakeCase as _snakeCase} from 'change-case'
import {startCase} from 'lodash'
import type {CamelCase, SnakeCase} from 'type-fest'

export {capitalCase, sentenceCase} from 'change-case'
export {startCase} from 'lodash'

export function camelCase<T extends string>(str: T) {
  return _camelCase(str) as CamelCase<T>
}

export function snakeCase<T extends string>(str: T) {
  return _snakeCase(str) as SnakeCase<T>
}

/** Adapted from https://github.com/esamattis/underscore.string/blob/master/titleize.js */
export function titleCase(str: string | undefined) {
  return startCase(str ?? '')
    .toLowerCase()
    .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase())
}

// MARK: - Pluralization

export {default as pluralize} from 'pluralize'

// MARK: - Hashing

export {default as md5Hash} from 'md5-hex'

/**
 * Converts a Uint8Array to a base64url string
 */
export function toBase64Url(bytes: Uint8Array) {
  const base64String = btoa(String.fromCharCode(...bytes))
  return base64String
    .replace(/\+/g, '-') // Replace '+' with '-' for URL-safe base64
    .replace(/\//g, '_') // Replace '/' with '_' for URL-safe base64
    .replace(/=+$/, '') // Remove padding '=' characters at the end
}
