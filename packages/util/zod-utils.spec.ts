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

test('extract openapi metadata from zod type', () => {
  const schema = z.unknown().openapi({
    ref: 'mySchema',
    description: 'my description',
  })

  // Does not set the schema description unfortunately
  expect(schema.description).toBeUndefined()
  expect(schema._def.zodOpenApi?.openapi).toEqual({
    ref: 'mySchema',
    description: 'my description',
  })
})

test('discriminated union error does not contain the matched discriminator', () => {
  const catSchema = z.object({type: z.literal('cat'), meow: z.boolean()})

  const dogSchema = z.object({type: z.literal('dog'), bark: z.boolean()})

  const petSchema = z.discriminatedUnion('type', [catSchema, dogSchema])

  // valid cases
  expect(petSchema.parse({type: 'cat', meow: true})).toBeTruthy()
  expect(petSchema.parse({type: 'dog', bark: true})).toBeTruthy()

  // discriminator error
  expect(
    petSchema.safeParse({type: 'fish', swim: true}).error?.message,
  ).toContain('invalid_union_discriminator')
  expect(
    petSchema.safeParse(
      {type: 'fish', swim: true},
      {
        errorMap: (issue, ctx) => ({
          message:
            issue.code === 'invalid_union_discriminator'
              ? 'Invalid pet type'
              : ctx.defaultError,
        }),
      },
    ).error?.message,
  ).toContain('Invalid pet type')

  // TODO: Figure out how to get matched discriminator from the error
  // to improve the quality of the error message
  expect(
    JSON.stringify(
      petSchema.safeParse(
        {type: 'cat', bark: true},
        {
          errorMap: (issue, ctx) => {
            console.log('Error issue:', issue)
            console.log('Error context:', ctx)
            return {
              message: ctx.defaultError,
            }
          },
        },
      ).error?.issues,
    ),
  ).not.toContain('cat')
})
