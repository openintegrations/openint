'use client'

import type {
  default as Form,
  FormProps,
  IChangeEvent,
  ThemeProps,
} from '@rjsf/core'
import {withTheme} from '@rjsf/core'
import type {RegistryFieldsType, RegistryWidgetsType} from '@rjsf/utils'
import {type RJSFSchema} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {transformJSONSchema, type Oas31Schema} from '@openint/util/schema'
import {fields} from './fields'
import {jsonSchemaToUiSchema} from './jsonSchemaToUiSchema'
import {widgets} from './widgets'

const theme: ThemeProps = {}

/** Customized form with our theme */

export const RJSFForm = withTheme(theme) as typeof Form

/** For use with createRef... */
export type JSONSchemaFormRef = Form

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
  hideSubmitButton = true,
  formData: initialFormData,
  onSubmit,
  debugMode: debugMode,
  onChange,
  ...props
}: JSONSchemaFormProps<TData>) => {
  const jsonSchema = transformJSONSchema(_jsonSchema as Oas31Schema, {
    hideSensitiveFields,
  }) as RJSFSchema

  // For debugging
  ;(globalThis as any).formJsonSchema = jsonSchema

  const formDataRef = React.useRef(initialFormData)
  const [formData, setFormData] = React.useState(() => formDataRef.current)

  const handleFormChange = React.useCallback(
    (data: IChangeEvent<TData>) => {
      formDataRef.current = data.formData
      setFormData(data.formData)
      onChange?.(data)
    },
    [onChange],
  )

  const uiSchema = jsonSchemaToUiSchema(jsonSchema)

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
      validator={validator}
      widgets={widgets as RegistryWidgetsType}
      fields={fields as RegistryFieldsType}
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
