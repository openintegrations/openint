// Custom widgets

import type {RJSFSchema, StrictRJSFSchema, UiSchema} from '@rjsf/utils'
import type {fields} from './fields'
import type {widgets} from './widgets'

// Mark: - generateUiSchema

// Allow ui schemas to be specified directly in the json schema
declare module 'zod-openapi/dist/extendZodTypes' {
  // @ts-expect-error : We don't care for the generic types
  interface ZodOpenApiMetadata extends UiSchema {
    // ref?: string
    // format?: 'oauth' | 'multi-select'
    ['ui:field']?: keyof typeof fields
    ['ui:widget']?: keyof typeof widgets
  }
}

/** TODO: Need to handle $ref's also */
export function generateUISchema(jsonSchema: RJSFSchema): UiSchema {
  const uiSchema: UiSchema = {
    ...Object.fromEntries(
      Object.entries(jsonSchema).filter(([k]) => k.startsWith('ui:')),
    ),
  }

  if (isTypeObject(jsonSchema) && jsonSchema.properties) {
    for (const [key, _value] of Object.entries(jsonSchema.properties)) {
      const value = _value as StrictRJSFSchema
      const friendlyLabel = value.title ?? titleCase(key)
      console.log(key, value)

      uiSchema[key] = {}

      if (typeof value === 'object') {
        if (isTypeObject(value)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          uiSchema[key] = {
            ...uiSchema[key],
            ...generateUISchema(value as RJSFSchema),
          }
          Object.assign(uiSchema[key], generateUISchema(value as RJSFSchema))
        }
      }
      Object.assign(uiSchema[key], {
        'ui:title': friendlyLabel,
        'ui:classNames': 'pt-2',
        ...Object.fromEntries(
          Object.entries(value).filter(([k]) => k.startsWith('ui:')),
        ),
      })
    }
  }

  // TODO: Handle #/components/schemas also

  return uiSchema
}

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
