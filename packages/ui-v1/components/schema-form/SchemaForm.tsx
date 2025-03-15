import type {
  default as Form,
  FormProps,
  IChangeEvent,
  ThemeProps,
} from '@rjsf/core'
import {withTheme} from '@rjsf/core'
import {
  type RJSFSchema,
  type StrictRJSFSchema,
  type UiSchema,
} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import type {z} from '@openint/util'
import {zodToOas31Schema} from './utils'

// Define the theme (copied from original SchemaForm)
const theme: ThemeProps = {
  widgets: {},
}

/** Customized form with our theme */
export const RJSFForm = withTheme(theme) as typeof Form

/** For use with createRef... */
export type SchemaFormElement = Form

export interface ZodSchemaFormProps<TSchema extends z.ZodTypeAny>
  extends Omit<JSONSchemaFormProps<z.infer<TSchema>>, 'jsonSchema'> {
  /**
   * The Zod schema to use for the form
   */
  schema: TSchema
}

/**
 * SchemaForm component for handling forms with proper styling and security features.
 * This component includes functionality for hiding sensitive fields like passwords and tokens.
 */
export const ZodSchemaForm = <TSchema extends z.ZodTypeAny>({
  schema,
  ...props
}: ZodSchemaFormProps<TSchema>) => {
  ;(globalThis as any).formSchema = schema
  // Convert Zod schema to JSON schema
  const jsonSchema = zodToOas31Schema(schema) as RJSFSchema
  return <JSONSchemaForm jsonSchema={jsonSchema} {...props} />
}

export interface JSONSchemaFormProps<TData extends Record<string, unknown>>
  extends Omit<FormProps<TData>, 'schema' | 'validator' | 'onSubmit'> {
  jsonSchema: RJSFSchema
  /**
   * Optional class name for styling the form container
   */
  className?: string
  /**
   * Flag to indicate if the form is in a loading state
   */
  loading?: boolean
  /**
   * Optional function to transform the JSON schema before rendering
   */
  jsonSchemaTransform?: (schema: RJSFSchema) => RJSFSchema
  /**
   * Optional flag to hide sensitive fields (like passwords, tokens, etc.)
   * Defaults to true for security
   */
  hideSensitiveFields?: boolean
  /**
   * Optional flag to hide the submit button
   * Defaults to true
   */
  hideSubmitButton?: boolean
  /**
   * Callback for form submission
   */
  onSubmit?: (data: {formData: TData}) => void

  debugMode?: boolean
}

export const JSONSchemaForm = <TData extends Record<string, unknown>>({
  jsonSchema: _jsonSchema,
  className,
  loading,
  hideSensitiveFields = true,
  jsonSchemaTransform,
  hideSubmitButton = true,
  formData: initialFormData,
  onSubmit,
  debugMode: debugMode,
  ...props
}: JSONSchemaFormProps<TData>) => {
  const jsonSchema = transformJsonSchema(_jsonSchema, {
    jsonSchemaTransform,
    hideSensitiveFields,
  })

  // For debugging
  ;(globalThis as any).formJsonSchema = jsonSchema

  const formDataRef = React.useRef(initialFormData)
  const [formData, setFormData] = React.useState(() => formDataRef.current)

  const handleFormChange = React.useCallback((data: IChangeEvent<TData>) => {
    formDataRef.current = data.formData
    setFormData(data.formData)
  }, [])

  const uiSchema = generateUiSchema(jsonSchema)

  const form = (
    <RJSFForm<TData>
      disabled={loading}
      {...props}
      formData={formData}
      className={cn(
        'schema-form',
        'credentials-schema-form',
        loading && 'loading',
        className,
        'overflow-y-auto',
      )}
      schema={jsonSchema}
      validator={validator}
      uiSchema={{
        ...(hideSubmitButton && {'ui:submitButtonOptions': {norender: true}}),
        ...uiSchema,
        ...props.uiSchema,
      }}
      onChange={handleFormChange}
      onSubmit={(data) => {
        if (!data.formData) {
          throw new Error('Invariant: formData is undefined')
        }
        onSubmit?.({formData: data.formData})
      }}
    />
  )
  return debugMode ? (
    <>
      {form}
      <h3>JSON Schema</h3>
      <pre>{JSON.stringify(jsonSchema, null, 2)}</pre>
      <h3>UI Schema</h3>
      <pre>{JSON.stringify(uiSchema, null, 2)}</pre>
      <h3>FormData</h3>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  ) : (
    form
  )
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
