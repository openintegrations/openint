import {md} from './md'

describe('md function', () => {
  test('should remove common indentation from all lines', () => {
    const result = md`
      This is a test
      of the md function
      It should remove leading spaces
    `
    expect(result).toBe(
      'This is a test\nof the md function\nIt should remove leading spaces',
    )
  })

  test('should handle expressions embedded in the template', () => {
    const name = 'world'
    const result = md`
      Hello ${name}
      How are you?
    `
    expect(result).toBe('Hello world\nHow are you?')
  })

  test('should remove leading and trailing empty lines', () => {
    const result = md`
      This has empty lines
      before and after
    `
    expect(result).toBe('This has empty lines\nbefore and after')
  })

  test('should handle lines with different indentation levels', () => {
    const result = md`
      First level
      Second level
      Third level
    `
    expect(result).toBe('First level\nSecond level\nThird level')
  })

  test('should preserve empty lines in the middle', () => {
    const result = md`
      First line

      Third line
    `
    expect(result).toBe('First line\n\nThird line')
  })

  test('should handle a string with only one line', () => {
    const result = md`
Single line
    `
    expect(result).toBe('Single line')
  })

  test('should handle multiple expressions', () => {
    const first = 'first'
    const second = 'second'
    const result = md`
      This is the ${first} expression
      This is the ${second} expression
    `
    expect(result).toBe(
      'This is the first expression\nThis is the second expression',
    )
  })
})
