import {describe, expect, test} from '@jest/globals'
import {zCoerceBoolean} from '../zod-utils'

describe('z.coerce.boolean', () => {
  test.each([
    // Truthy values
    ['true', true],
    ['TRUE', true],
    ['True', true],
    [1, true],
    ['1', true],
    [true, true],

    // Falsy values
    ['false', false],
    ['FALSE', false],
    ['False', false],
    [0, false],
    ['0', false],
    [false, false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('coerces %p to %p', (input, expected) => {
    const result = zCoerceBoolean().parse(input)
    expect(result).toBe(expected)
  })
})
