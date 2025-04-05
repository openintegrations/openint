/**
 * Safely parses a string into a number, throwing errors if the value is outside the safe integer range
 * or cannot be parsed as a number.
 */
export function parseNumber(value: string): number {
  const num = Number(value)

  if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
    throw new Error(
      `Number overflow: ${value} is outside the safe integer range`,
    )
  }
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number: ${value}`)
  }

  return num
}
