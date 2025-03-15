/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {RJSFSchema, StrictRJSFSchema, UiSchema} from '@rjsf/utils'
import type z from 'zod'
import type {oas30, oas31} from 'zod-openapi'
import {createDocument} from 'zod-openapi'
import type {ZodOpenApiMetadataDef} from 'zod-openapi/dist/extendZodTypes'

export type Oas31Schema = oas31.SchemaObject & {$schema?: string}
export type Oas30Schema = oas30.SchemaObject & {$schema?: string}

/**
 * Convert to JSONSchema using OpenAPI 3.1 spec, which is a superset of JSONSchema Draft 2020-12
 * This is preferred over zod-to-json-schema because it allows for metadata such as title
 * and summary to be specified via the `.openapi()` method.
 */
export function zodToOas31Schema(
  zodSchema: z.ZodTypeAny,
  zodDefinitions?: Record<string, z.ZodTypeAny>,
): Oas31Schema {
  const oas = createDocument({
    openapi: '3.1.0', // Only 3.1 is basically fully compatible with JSON-schema
    info: {title: '', version: ''},
    components: {
      schemas: {...zodDefinitions, schema: zodSchema},
    },
  })
  console.log(oas, zodSchema)
  const roofMeta = (zodSchema._def as ZodOpenApiMetadataDef).openapi

  const {
    schema = {$ref: `#/components/schemas/${roofMeta?.ref}`},
    ...definitions
  } = oas.components?.schemas ?? {}
  return {
    ...schema,
    // Normally jsonschema uses an idiomatic `definitions` key,
    // but we use `components.schemas` to not need to modify any and all refs
    ...(Object.keys(definitions).length && {
      components: {schemas: definitions},
    }),
    /**
     * Superset of the [JSON Schema Specification Draft 2020-12](https://json-schema.org/draft/2020-12/schema)
     * Technically at https://spec.openapis.org/oas/3.1/dialect/base, but many tools don't support meta schemas
     * so we forget it for now.
     */
    // $schema: 'https://json-schema.org/draft/2020-12/schema,'
    // $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
  }
}

// MARK: - Utils

// Helper functions from original SchemaForm
function titleCase(str: string) {
  const words = str.split(/(?=[A-Z])|_/)
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1))
    .join(' ')
}

function isTypeObject(schema: RJSFSchema): boolean {
  return (
    schema.type === 'object' ||
    (Array.isArray(schema.type) && schema.type.includes('object'))
  )
}

export function transformJsonSchema(
  schema: RJSFSchema,
  options: {
    jsonSchemaTransform?: (schema: RJSFSchema) => RJSFSchema
    hideSensitiveFields?: boolean
  } = {},
): RJSFSchema {
  const {jsonSchemaTransform, hideSensitiveFields = true} = options
  let transformedSchema = {...schema}

  // Apply user-provided transform first
  if (jsonSchemaTransform) {
    transformedSchema = jsonSchemaTransform(transformedSchema)
  }

  // Handle sensitive fields if needed
  if (hideSensitiveFields && transformedSchema.properties) {
    const sensitiveFieldPatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /api/i,
      /credential/i,
    ]

    // Modify properties that match sensitive patterns
    Object.entries(transformedSchema.properties).forEach(([key, prop]) => {
      if (
        typeof prop === 'object' &&
        sensitiveFieldPatterns.some((pattern) => pattern.test(key))
      ) {
        // Mark as password type for UI
        if (prop.type === 'string') {
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

export function generateUiSchema(jsonSchema: RJSFSchema): UiSchema {
  const uiSchema: UiSchema = {}

  if (isTypeObject(jsonSchema) && jsonSchema.properties) {
    for (const [key, _value] of Object.entries(jsonSchema.properties)) {
      const value = _value as StrictRJSFSchema
      const friendlyLabel = value.title ?? titleCase(key)
      uiSchema[key] = {
        'ui:title': friendlyLabel,
        'ui:classNames': 'pt-2',
      }

      if (typeof value === 'object') {
        if (isTypeObject(value)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          uiSchema[key] = {
            ...uiSchema[key],
            ...generateUiSchema(value as RJSFSchema),
          }
        }
      }
    }
  }

  return uiSchema
}
