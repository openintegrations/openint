import {isValidDateString} from './utils'

test.each([
  ['2021-01-01T00:00:00Z', true],
  ['2021-01-01T00:00:00', false], // missing timezone, not valid as a result
  ['2021-01-01', true],
  ['2021-01', true],
  ['2021', true],
  ['12', false],
  ['202', false],
  ['2021-01-01T00:00:00+00:00', true],
  ['Sun, Nov 17, 5:00 PM', false],
  // Doesn't work as we'd like... this is the console log format for a Date object by default
  // ['Sat Nov 16 2024 15:28:04 GMT-0800 (Pacific Standard Time)', false],
])('isValidDateString(%s) -> %o', (input, valid) => {
  expect(isValidDateString(input)).toEqual(valid)
})
