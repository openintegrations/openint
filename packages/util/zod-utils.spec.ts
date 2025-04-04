import {describe, expect, test} from '@jest/globals'
import {
  getInputData,
  getInputDataFromZodError,
  z,
  zCoerceBoolean,
} from '../zod-utils'

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

test('extracts input from zod error', () => {
  const invalidInputs = [{foo: 'bar'}]
  const schema = z.array(z.object({foo: z.boolean()}))
  const result = schema.safeParse(invalidInputs)

  expect(result.success).toBe(false)

  expect(getInputData(result.error)).toEqual(invalidInputs)

  try {
    schema.parse(invalidInputs)
  } catch (error) {
    expect(getInputData(error)).toEqual(invalidInputs)
  }
})
