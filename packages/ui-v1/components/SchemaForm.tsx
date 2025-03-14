import type {default as Form, FormProps, ThemeProps} from '@rjsf/core'
import {withTheme} from '@rjsf/core'
import {type RJSFSchema, type UiSchema} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import type {z} from '@openint/util'
import {zodToJsonSchema} from '@openint/util'

// Define the theme (copied from original SchemaForm)
const theme: ThemeProps = {
  widgets: {},
}

/** Customized form with our theme */
export const JsonSchemaForm = withTheme(theme) as typeof Form

/** For use with createRef... */
export type SchemaFormElement = Form

export interface SchemaFormProps<TSchema extends z.ZodTypeAny>
  extends Omit<
    FormProps<z.infer<TSchema>>,
    'schema' | 'validator' | 'onSubmit'
  > {
  /**
   * The Zod schema to use for the form
   */
  schema: TSchema
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
   */
  hideSubmitButton?: boolean
  /**
   * Callback for form submission
   */
  onSubmit?: (data: {formData: z.infer<TSchema>}) => void
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

function generateUiSchema(jsonSchema: RJSFSchema): UiSchema {
  const uiSchema: UiSchema = {}

  if (isTypeObject(jsonSchema) && jsonSchema.properties) {
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      const friendlyLabel = titleCase(key)
      uiSchema[key] = {
        'ui:title': friendlyLabel,
        'ui:classNames': 'pt-2',
      }

      if (typeof value === 'object') {
        if (isTypeObject(value)) {
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

/**
 * SchemaForm component for handling forms with proper styling and security features.
 * This component includes functionality for hiding sensitive fields like passwords and tokens.
 */
export const SchemaForm = React.forwardRef(function SchemaForm<
  TSchema extends z.ZodTypeAny,
>(
  {
    schema,
    className,
    loading,
    hideSensitiveFields = true,
    jsonSchemaTransform,
    hideSubmitButton,
    formData: _formData,
    onSubmit,
    ...props
  }: SchemaFormProps<TSchema>,
  forwardedRef: React.ForwardedRef<Form<z.infer<TSchema>>>,
) {
  // Convert Zod schema to JSON schema
  const _jsonSchema = zodToJsonSchema(schema) as RJSFSchema

  // Custom transform function that handles sensitive fields
  const handleJsonSchemaTransform = React.useCallback(
    (schema: RJSFSchema): RJSFSchema => {
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
    },
    [jsonSchemaTransform, hideSensitiveFields],
  )

  const jsonSchema = handleJsonSchemaTransform(_jsonSchema)

  // For debugging
  ;(globalThis as any).formSchema = schema
  ;(globalThis as any).formJsonSchema = jsonSchema

  const formDataRef = React.useRef(_formData)
  const [localFormData, setLocalFormData] = React.useState(
    () => formDataRef.current,
  )

  const handleFormChange = React.useCallback((data: any) => {
    formDataRef.current = data.formData
    setLocalFormData(data.formData)
  }, [])

  const uiSchema = generateUiSchema(jsonSchema)

  return (
    <JsonSchemaForm<z.infer<TSchema>>
      disabled={loading}
      {...props}
      ref={forwardedRef}
      formData={localFormData}
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
})

/**
 * New approach https://www.kripod.dev/blog/fixing-generics-in-react/
 * Original does not work no more https://fettblog.eu/typescript-react-generic-forward-refs/
 */
declare module 'react' {
  function forwardRef<T, P = NonNullable<unknown>>(
    render: (props: P, ref: ForwardedRef<T>) => ReturnType<FunctionComponent>,
  ): ((
    props: PropsWithoutRef<P> & RefAttributes<T>,
  ) => ReturnType<FunctionComponent>) & {
    displayName?: string
  }
}

export default SchemaForm
