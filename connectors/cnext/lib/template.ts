/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import Mustache from 'mustache'
import {isPlainObject} from '@openint/util/object-utils'
import {proxyRequiredRecursive} from '@openint/util/proxy-utils'

export function renderTemplateObject<
  T extends Record<string, unknown>,
  U extends Record<string, unknown> = T,
>(templateObject: T, context: Record<string, unknown>): U {
  // Handle non-object inputs
  if (!isPlainObject(templateObject)) {
    throw new Error('Template must be a plain object')
  }

  try {
    // Convert object to string
    const templateString = JSON.stringify(templateObject)

    // Wrap context with proxyRequiredRecursive to ensure all required values are present
    const proxiedContext = proxyRequiredRecursive(context, {
      throwOn: 'missing',
      formatError: ({key, reason}) =>
        new Error(
          `Template variable "${key}" is required but ${reason} in context`,
        ),
    })

    // Process the template string with custom delimiters to prevent escaping
    // Using triple braces {{{ }}} to prevent HTML escaping
    const processedString = Mustache.render(
      templateString,
      proxiedContext,
      {},
      {escape: (text) => String(text)},
    )

    // Parse back to object

    return JSON.parse(processedString) as U
  } catch (error) {
    if (error instanceof Error && error.message.includes('Template variable')) {
      throw error
    }
    console.warn('Error processing object template:', error)
    throw new Error('Error processing object template')
  }
}
