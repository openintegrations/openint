import {beforeAll, test} from '@jest/globals'

/* eslint-disable jest/no-export */

export const $test = <T>(name: string, fn: () => T | Promise<T>) => {
  const ref = {current: undefined as T}

  // eslint-disable-next-line jest/valid-title
  test(name, async () => {
    ref.current = await fn()
  })

  return ref
}

export const $beforeAll = <T>(fn: () => T | Promise<T>) => {
  const ref = {current: undefined as T}

  beforeAll(async () => {
    ref.current = await fn()
  })

  return ref
}

type RuntimeName = 'bun' | 'node' | 'deno' | 'browser' | 'webworker' | 'unknown'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Detects the JavaScript runtime environment
 */
export function detectRuntime() {
  // Check for Bun
  const isBun =
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof (process.versions as any).bun !== 'undefined'

  // Check for Node.js
  const isNode =
    !isBun &&
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined'

  // Check for Deno
  const isDeno = typeof (globalThis as any).Deno !== 'undefined'

  // Check for browser
  const isBrowser =
    !isBun &&
    !isNode &&
    !isDeno &&
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'

  // Check for Web Worker
  const isWebWorker =
    !isBun &&
    !isNode &&
    !isDeno &&
    !isBrowser &&
    typeof self !== 'undefined' &&
    typeof (self as any).importScripts === 'function'

  // Get version information where available
  const version = isBun
    ? (process.versions as any).bun
    : isNode
      ? process.versions.node
      : isDeno
        ? (globalThis as any).Deno.version.deno
        : undefined

  // Determine runtime name
  let name: RuntimeName = 'unknown'
  if (isBun) {
    name = 'bun'
  } else if (isNode) {
    name = 'node'
  } else if (isDeno) {
    name = 'deno'
  } else if (isBrowser) {
    name = 'browser'
  } else if (isWebWorker) {
    name = 'webworker'
  }

  return {
    isBun,
    isNode,
    isDeno,
    isBrowser,
    isWebWorker,
    name,
    version,
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
