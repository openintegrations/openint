/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  noopFunctionMap,
  proxyRequired,
  proxyRequiredRecursive,
} from './proxy-utils'

test('noopProxy', () => {
  const obj = noopFunctionMap()
  expect(obj.hello()).toEqual(undefined)
  expect(typeof obj.anything).toEqual('function')
})

describe('proxyRequired', () => {
  it('should allow access to defined properties', () => {
    const obj = {a: 1, b: 'test'}
    const proxied = proxyRequired(obj)
    expect(proxied.a).toBe(1)
    expect(proxied.b).toBe('test')
  })

  it('should throw on accessing undefined properties by default', () => {
    const obj = {a: 1, b: undefined}
    const proxied = proxyRequired(obj)
    expect(proxied.a).toBe(1)
    expect(() => proxied.b).toThrow('b is required')
  })

  it('should throw on accessing null properties by default', () => {
    const obj = {a: 1, b: null}
    const proxied = proxyRequired(obj)
    expect(proxied.a).toBe(1)
    expect(() => proxied.b).toThrow('b is required')
  })

  it('should use custom error formatter', () => {
    const obj = {a: 1, b: undefined}
    const proxied = proxyRequired(obj, {
      formatError: (key) => new Error(`Missing value for ${key}`),
    })
    expect(proxied.a).toBe(1)
    expect(() => proxied.b).toThrow('Missing value for b')
  })

  describe('throwOn option', () => {
    it('should throw on missing properties when throwOn is "missing"', () => {
      const obj = {a: 1} as {a: number; b?: unknown}
      const proxied = proxyRequired(obj, {throwOn: 'missing'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b).toThrow('b is required')
    })

    it('should allow null but throw on undefined when throwOn is "undefined"', () => {
      const obj = {a: 1, b: null, c: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'undefined'})
      expect(proxied.a).toBe(1)
      expect(proxied.b).toBe(null)
      expect(() => proxied.c).toThrow('c is required')
    })

    it('should throw on both null and undefined when throwOn is "nullish"', () => {
      const obj = {a: 1, b: null, c: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'nullish'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b).toThrow('b is required')
      expect(() => proxied.c).toThrow('c is required')
    })

    it('should allow accessing explicitly defined null/undefined values when throwOn is "missing"', () => {
      const obj = {a: 1, b: null, c: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'missing'})
      expect(proxied.a).toBe(1)
      expect(proxied.b).toBe(null)
      expect(proxied.c).toBe(undefined)
    })

    it('should throw on explicitly defined undefined values when throwOn is "undefined"', () => {
      const obj = {a: 1, b: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'undefined'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b).toThrow('b is required')
    })
  })
})

describe('proxyRequiredRecursive', () => {
  it('should allow access to defined nested properties', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    }
    const proxied = proxyRequiredRecursive(obj)
    expect(proxied.a).toBe(1)
    expect(proxied.b.c).toBe(2)
    expect(proxied.b.d.e).toBe(3)
  })

  it('should throw on accessing undefined nested properties by default', () => {
    const obj = {
      a: 1,
      b: {
        c: undefined,
        d: {
          e: 3,
        },
      },
    }
    const proxied = proxyRequiredRecursive(obj)
    expect(proxied.a).toBe(1)
    expect(proxied.b.d.e).toBe(3)
    expect(() => proxied.b.c).toThrow('b.c is required')
  })

  it('should throw on accessing null nested properties by default', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        d: null,
      },
    }
    const proxied = proxyRequiredRecursive(obj)
    expect(proxied.a).toBe(1)
    expect(proxied.b.c).toBe(2)
    expect(() => proxied.b.d).toThrow('b.d is required')
  })

  it('should use custom error formatter with full path', () => {
    const obj = {
      a: 1,
      b: {
        c: undefined,
      },
    }
    const proxied = proxyRequiredRecursive(obj, {
      formatError: (path) => new Error(`Missing value at path: ${path}`),
    })
    expect(proxied.a).toBe(1)
    expect(() => proxied.b.c).toThrow('Missing value at path: b.c')
  })

  it('should handle arrays correctly', () => {
    type ArrayElement = number | {b: number}
    const obj = {
      a: [1, 2, {b: 3}] as ArrayElement[],
    }
    const proxied = proxyRequiredRecursive(obj)
    expect(proxied.a[0]).toBe(1)
    expect(proxied.a[1]).toBe(2)
    expect((proxied.a[2] as {b: number}).b).toBe(3)
  })

  it('should allow custom error message', () => {
    const obj = {
      a: 1,
      b: {
        c: undefined,
      },
    }
    const proxied = proxyRequiredRecursive(obj, {
      formatError(key, value) {
        return new Error(`Custom error message for ${key}: ${value}`)
      },
    })
    expect(proxied.a).toBe(1)
    expect(() => proxied.b.c).toThrow('Custom error message for b.c: undefined')
  })

  describe('throwOn option', () => {
    it('should throw on missing properties when throwOn is "missing"', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
        },
      } as {a: number; b: {c: number; d?: unknown}}
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'missing'})
      expect(proxied.a).toBe(1)
      expect(proxied.b.c).toBe(2)
      expect(() => proxied.b.d).toThrow('b.d is required')
    })

    it('should allow null but throw on undefined when throwOn is "undefined"', () => {
      const obj = {
        a: 1,
        b: {
          c: null,
          d: undefined,
        },
      }
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'undefined'})
      expect(proxied.a).toBe(1)
      expect(proxied.b.c).toBe(null)
      expect(() => proxied.b.d).toThrow('b.d is required')
    })

    it('should throw on both null and undefined when throwOn is "nullish"', () => {
      const obj = {
        a: 1,
        b: {
          c: null,
          d: undefined,
        },
      }
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'nullish'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b.c).toThrow('b.c is required')
      expect(() => proxied.b.d).toThrow('b.d is required')
    })

    it('should allow accessing explicitly defined null/undefined values when throwOn is "missing"', () => {
      const obj = {
        a: 1,
        b: {
          c: null,
          d: undefined,
        },
      }
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'missing'})
      expect(proxied.a).toBe(1)
      expect(proxied.b.c).toBe(null)
      expect(proxied.b.d).toBe(undefined)
    })

    it('should throw on explicitly defined undefined values when throwOn is "undefined"', () => {
      const obj = {
        a: 1,
        b: {
          c: undefined,
        },
      }
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'undefined'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b.c).toThrow('b.c is required')
    })
  })
})
