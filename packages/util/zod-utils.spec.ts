import {describe, expect, test} from '@jest/globals'
import {safeJSONParse} from './json-utils'
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
  expect(safeJSONParse(result.error?.message)).toEqual({
    issues: [
      {
        code: 'invalid_type',
        expected: 'boolean',
        received: 'string',
        path: [0, 'foo'],
        message: 'Expected boolean, received string',
      },
    ],
    data: [{foo: 'bar'}],
  })
})

test('parse: extracts input from zod error', () => {
  try {
    schema.parse(invalidInputs)
    expect(false).toBe(true) // Fail
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
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
    // eslint-disable-next-line jest/no-conditional-expect
    expect(getInputData(error)).toEqual(invalidInputs)
  }
})
