import {describe, expect, test} from '@jest/globals'
import {getInputData, z, zCoerceBoolean} from './zod-utils'

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

const invalidInputs = [{foo: 'bar'}]
const schema = z.array(z.object({foo: z.boolean()}))

test('safeParse: extracts input from zod error', () => {
  const result = schema.safeParse(invalidInputs)

  expect(result.success).toBe(false)
  expect(getInputData(result.error)).toEqual(invalidInputs)
})

test('parse: extracts input from zod error', () => {
  try {
    schema.parse(invalidInputs)
    expect(false).toBe(true) // Fail
  } catch (error) {
    expect(getInputData(error)).toEqual(invalidInputs)
  }
})

test('safeParseAsync: extracts input from zod error', async () => {
  const result = await schema.safeParseAsync(invalidInputs)
  expect(result.success).toBe(false)
  expect(getInputData(result.error)).toEqual(invalidInputs)
})

test('parseAsync: extracts input from zod error', async () => {
  try {
    await schema.parseAsync(invalidInputs)
    expect(false).toBe(true) // Fail
  } catch (error) {
    expect(getInputData(error)).toEqual(invalidInputs)
  }
})
