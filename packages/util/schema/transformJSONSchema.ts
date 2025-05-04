import type {Oas31Schema} from './zodToOas31Schema'

export function transformJSONSchema(
  schema: Oas31Schema,
  options: {
    jsonSchemaTransform?: (schema: Oas31Schema) => Oas31Schema
    hideSensitiveFields?: boolean
  } = {},
): Oas31Schema {
  const {jsonSchemaTransform, hideSensitiveFields = true} = options
  let transformedSchema = {...schema}

  // Apply user-provided transform first
  if (jsonSchemaTransform) {
    transformedSchema = jsonSchemaTransform(transformedSchema)
  }

  // Handle sensitive fields if needed
  // TODO: Make it so that formats are specified explicitly...
  if (hideSensitiveFields && transformedSchema.properties) {
    const sensitiveFieldPatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /credential/i,
    ]

    // Modify properties that match sensitive patterns
    Object.entries(transformedSchema.properties).forEach(([key, prop]) => {
      if (
        typeof prop === 'object' &&
        sensitiveFieldPatterns.some((pattern) => pattern.test(key))
      ) {
        // Mark as password type for UI
        if ('type' in prop && prop.type === 'string') {
          transformedSchema.properties![key] = {
            ...prop,
            format: 'password',
          }
        }
      }
    })
  }

  return transformedSchema
}
