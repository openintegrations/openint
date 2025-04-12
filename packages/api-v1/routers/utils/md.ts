/**
 * Tagged template literal for multi-line text that removes leading spaces from each line.
 * This is useful for creating well-formatted markdown strings or other text blocks.
 *
 * @param strings - The template string literals
 * @param expressions - Any expressions embedded in the template
 * @returns Processed string with leading spaces removed from each line
 */
export function md(
  strings: TemplateStringsArray,
  ...expressions: unknown[]
): string {
  // Combine the template strings with the expressions
  const result = strings.reduce(
    (acc, str, i) =>
      acc + str + (i < expressions.length ? String(expressions[i]) : ''),
    '',
  )

  // Split into lines
  const lines = result.split('\n')

  // Remove leading/trailing empty lines
  if (lines.length > 0 && lines[0]?.trim() === '') lines.shift()
  if (lines.length > 0 && lines[lines.length - 1]?.trim() === '') lines.pop()

  // Find the minimum indentation (ignore empty lines)
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
  const minIndent =
    nonEmptyLines.length > 0
      ? Math.min(...nonEmptyLines.map((line) => line.search(/\S|$/)))
      : 0

  // Remove the common indentation from all lines
  const processedLines = lines.map((line) => {
    if (line.trim() === '') return ''
    return line.slice(Math.max(0, minIndent))
  })

  return processedLines.join('\n')
}
