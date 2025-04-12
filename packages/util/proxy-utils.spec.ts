/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  noopFunctionMap,
  proxyReadonly,
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
    expect(() => proxied.b).toThrow('b is required (undefined)')
  })

  it('should throw on accessing null properties by default', () => {
    const obj = {a: 1, b: null}
    const proxied = proxyRequired(obj)
    expect(proxied.a).toBe(1)
    expect(() => proxied.b).toThrow('b is required (null)')
  })

  it('should use custom error formatter', () => {
    const obj = {a: 1, b: undefined}
    const proxied = proxyRequired(obj, {
      formatError: ({key, reason}) =>
        new Error(`Missing value for ${key} (${reason})`),
    })
    expect(proxied.a).toBe(1)
    expect(() => proxied.b).toThrow('Missing value for b (undefined)')
  })

  describe('throwOn option', () => {
    it('should throw on missing properties when throwOn is "missing"', () => {
      const obj = {a: 1} as {a: number; b?: unknown}
      const proxied = proxyRequired(obj, {throwOn: 'missing'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b).toThrow('b is required (missing)')
    })

    it('should throw on explicitly defined undefined values when throwOn is "undefined"', () => {
      const obj = {a: 1, b: null, c: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'undefined'})
      expect(proxied.a).toBe(1)
      expect(proxied.b).toBe(null)
      expect(() => proxied.c).toThrow('c is required (undefined)')
    })

    it('should throw on both null and undefined when throwOn is "nullish"', () => {
      const obj = {a: 1, b: null, c: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'nullish'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b).toThrow('b is required (null)')
      expect(() => proxied.c).toThrow('c is required (undefined)')
    })

    it('should allow accessing explicitly defined null/undefined values when throwOn is "missing"', () => {
      const obj = {a: 1, b: null, c: undefined}
      const proxied = proxyRequired(obj, {throwOn: 'missing'})
      expect(proxied.a).toBe(1)
      expect(proxied.b).toBe(null)
      expect(proxied.c).toBe(undefined)
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
    expect(() => proxied.b.c).toThrow('b.c is required (undefined)')
    expect(() => (proxied as any).c.d).toThrow('c is required (missing)')
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
    expect(() => proxied.b.d).toThrow('b.d is required (null)')
  })

  it('should use custom error formatter with full path', () => {
    const obj = {
      a: 1,
      b: {
        c: undefined,
      },
    }
    const proxied = proxyRequiredRecursive(obj, {
      formatError: ({key, reason}) =>
        new Error(`Missing value at path: ${key} (${reason})`),
    })
    expect(proxied.a).toBe(1)
    expect(() => proxied.b.c).toThrow('Missing value at path: b.c (undefined)')
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
      formatError({key, value, reason}) {
        return new Error(
          `Custom error message for ${key}: ${value} (${reason})`,
        )
      },
    })
    expect(proxied.a).toBe(1)
    expect(() => proxied.b.c).toThrow(
      'Custom error message for b.c: undefined (undefined)',
    )
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
      expect(() => proxied.b.d).toThrow('b.d is required (missing)')
    })

    it('should throw on explicitly defined undefined values in nested objects when throwOn is "undefined"', () => {
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
      expect(() => proxied.b.d).toThrow('b.d is required (undefined)')
    })

    it('should throw on both null and undefined in nested objects when throwOn is "nullish"', () => {
      const obj = {
        a: 1,
        b: {
          c: null,
          d: undefined,
        },
      }
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'nullish'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b.c).toThrow('b.c is required (null)')
      expect(() => proxied.b.d).toThrow('b.d is required (undefined)')
    })

    it('should allow accessing explicitly defined null/undefined values in nested objects when throwOn is "missing"', () => {
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

    // eslint-disable-next-line jest/no-identical-title
    it('throw on explicitly defined undefined values in nested objects when throwOn is "undefined"', () => {
      const obj = {
        a: 1,
        b: {
          c: undefined,
        },
      }
      const proxied = proxyRequiredRecursive(obj, {throwOn: 'undefined'})
      expect(proxied.a).toBe(1)
      expect(() => proxied.b.c).toThrow('b.c is required (undefined)')
    })

    it('should handle arrays with different throwOn options', () => {
      const obj = {
        arr: [
          {a: null, b: undefined},
          {a: 1, b: 2},
        ],
      }

      // Test 'missing' option
      const missingProxy: any = proxyRequiredRecursive(obj, {
        throwOn: 'missing',
      })
      expect(missingProxy.arr[0].a).toBe(null)
      expect(missingProxy.arr[0].b).toBe(undefined)
      expect(missingProxy.arr[1].a).toBe(1)

      // Test 'undefined' option
      const undefinedProxy: any = proxyRequiredRecursive(obj, {
        throwOn: 'undefined',
      })
      expect(undefinedProxy.arr[0].a).toBe(null)
      expect(() => undefinedProxy.arr[0].b).toThrow(
        'arr.0.b is required (undefined)',
      )
      expect(undefinedProxy.arr[1].a).toBe(1)

      // Test 'nullish' option
      const nullishProxy: any = proxyRequiredRecursive(obj, {
        throwOn: 'nullish',
      })
      expect(() => nullishProxy.arr[0].a).toThrow('arr.0.a is required (null)')
      expect(() => nullishProxy.arr[0].b).toThrow(
        'arr.0.b is required (undefined)',
      )
      expect(nullishProxy.arr[1].a).toBe(1)
    })
  })
})

describe('proxyReadonly', () => {
  test('allows reading properties', () => {
    const obj = {a: 1, b: 'test'}
    const proxy = proxyReadonly(obj)
    expect(proxy.a).toBe(1)
    expect(proxy.b).toBe('test')
  })

  test('prevents setting properties', () => {
    const obj = {a: 1}
    const proxy = proxyReadonly(obj)
    expect(() => {
      // @ts-expect-error - Testing runtime error
      proxy.a = 2
    }).toThrow('Cannot modify read-only object')
  })

  test('prevents deleting properties', () => {
    const obj = {a: 1}
    const proxy = proxyReadonly(obj)
    expect(() => {
      // @ts-expect-error - Testing runtime error
      delete proxy.a
    }).toThrow('Cannot delete properties from read-only object')
  })

  test('maintains type safety', () => {
    const obj = {a: 1, b: 'test'}
    const proxy = proxyReadonly(obj)
    // These should compile without errors
    const a: number = proxy.a
    const b: string = proxy.b
    expect(a).toBe(1)
    expect(b).toBe('test')
  })
})
