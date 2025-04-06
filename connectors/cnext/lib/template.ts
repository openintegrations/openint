import Mustache from 'mustache'

export function fillOutStringTemplateVariables<
  T extends Record<string, unknown>,
  U extends Record<string, unknown> = T,
>(
  template: T,
  connectorConfig: Record<string, unknown>,
  connectionSettings: Record<string, unknown>,
): U {
  if (!template || typeof template !== 'object') {
    return template as U
  }

  const context = {
    connectorConfig,
    connectionSettings,
  }

  try {
    // Convert object to string
    const templateString = JSON.stringify(template)

    // Process the template string with custom delimiters to prevent escaping
    // Using triple braces {{{ }}} to prevent HTML escaping
    const processedString = Mustache.render(
      templateString,
      context,
      {},
      {escape: (text) => text},
    )

    // Parse back to object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(processedString)
  } catch (error) {
    console.warn('Error processing object template:', error)
    throw new Error('Error processing object template')
  }
}
