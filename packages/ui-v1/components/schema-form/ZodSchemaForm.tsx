'use client'

import {zodToOas31Schema} from '@openint/util/schema'
import {z} from '@openint/util/zod-utils'
import {JSONSchemaForm, type JSONSchemaFormProps} from './JSONSchemaForm'

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
  const jsonSchema = zodToOas31Schema(schema)

  return <JSONSchemaForm jsonSchema={jsonSchema} {...props} />
}
