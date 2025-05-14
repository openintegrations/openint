import type {FieldProps, RJSFSchema} from '@rjsf/utils'

import {Input, Label} from '@openint/shadcn/ui'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@openint/shadcn/ui/accordion'
import {titleCase} from '@openint/util/string-utils'

interface ExtendedJSONSchema extends RJSFSchema {
  'ui:options'?: {
    title?: string
    placeholder?: string
    [key: string]: unknown
  }
}

/**
 * AdvancedField is a field that collapses a section of the form.
 * It uses schema properties to render fields and handles them at the root level.
 */
export function AdvancedField<T extends Record<string, string | number>>(
  props: FieldProps<T>,
) {
  const {formData, onChange, schema} = props

  // Get field list from schema properties
  const schemaFields = schema.properties ? Object.keys(schema.properties) : []

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-fields" className="border-none">
        <AccordionTrigger className="py-2 hover:no-underline">
          <h4 className="text-sm font-semibold">
            {schema.title || 'Advanced Fields'}
          </h4>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {schemaFields.map((fieldName) => {
            // Get schema for this field
            const fieldSchema = schema.properties?.[
              String(fieldName)
            ] as ExtendedJSONSchema
            const fieldOptions = fieldSchema?.['ui:options']

            return (
              <div key={String(fieldName)} className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {fieldOptions?.title || titleCase(String(fieldName))}
                </Label>
                <Input
                  value={formData?.[fieldName]}
                  onChange={(e) => {
                    onChange({
                      ...formData,
                      [fieldName]: e.target.value,
                    } as T)
                  }}
                  placeholder={fieldOptions?.placeholder || ''}
                />
              </div>
            )
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
