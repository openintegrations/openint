/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import Mustache from 'mustache'
import {isPlainObject} from '@openint/util/object-utils'

export function renderTemplateObject<
  T extends Record<string, unknown>,
  U extends Record<string, unknown> = T,
>({
  templateObject,
  connectorConfig,
  connectionSettings,
}: {
  templateObject: T
  connectorConfig: Record<string, unknown>
  connectionSettings: Record<string, unknown>
}): U {
  // Handle non-object inputs
  if (!isPlainObject(templateObject)) {
    throw new Error('Template must be a plain object')
  }

  const context = {
    connectorConfig,
    connectionSettings,
  }

  try {
    // Convert object to string
    const templateString = JSON.stringify(templateObject)

    // Process the template string with custom delimiters to prevent escaping
    // Using triple braces {{{ }}} to prevent HTML escaping
    const processedString = Mustache.render(
      templateString,
      context,
      {},
      {escape: (text) => String(text)},
    )

    // Parse back to object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(processedString) as U
  } catch (error) {
    console.warn('Error processing object template:', error)
    throw new Error('Error processing object template')
  }
}
