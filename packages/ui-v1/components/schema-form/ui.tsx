// Custom widgets

import type {
  FieldProps,
  RegistryFieldsType,
  RegistryWidgetsType,
  RJSFSchema,
  StrictRJSFSchema,
  UiSchema,
  WidgetProps,
} from '@rjsf/utils'

// MARK: - Widgets

export function MultiSelect(_props: WidgetProps<boolean>) {
  const {value, onChange} = _props

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <select
      value={value as string}
      onChange={handleSelectChange}
      className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border border-gray-300 p-2 shadow-sm">
      <option value="option1">Option 1</option>
      <option value="option2">Option 2</option>
      <option value="option3">Option 3</option>
    </select>
  )
}

export const widgets = {
  MultiSelectWidget: MultiSelect,
  // Consider overriding default widgets with custom shadcn ones
  // instead of using pure css for customization
  // Default widgets we can override
  // - AltDateTimeWidget
  // - AltDateWidget
  // - CheckboxesWidget
  // - CheckboxWidget
  // - ColorWidget
  // - DateTimeWidget
  // - DateWidget
  // - EmailWidget
  // - FileWidget
  // - HiddenWidget
  // - PasswordWidget
  // - RadioWidget
  // - RangeWidget
  // - SelectWidget
  // - TextareaWidget
  // - TextWidget
  // - TimeWidget
  // - UpDownWidget
  // - URLWidget
} satisfies RegistryWidgetsType

// MARK: - Fields

/**
 * Fields contain widgets, but are responsible for rendering even more things like
 * headers, footers, etc.
 */
export const fields = {
  // eslint-disable-next-line arrow-body-style
  OAuthField: (_props: FieldProps) => {
    return <div>custom oauth field</div>
  },
  // Default fields we can override
  // - ArrayField
  // - ArraySchemaField
  // - BooleanField
  // - DescriptionField
  // - OneOfField
  // - AnyOfField
  // - NullField
  // - NumberField
  // - ObjectField
  // - SchemaField
  // - StringField
  // - TitleField
  // - UnsupportedField
} satisfies RegistryFieldsType

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
export function generateUiSchema(jsonSchema: RJSFSchema): UiSchema {
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
            ...generateUiSchema(value as RJSFSchema),
          }
          Object.assign(uiSchema[key], generateUiSchema(value as RJSFSchema))
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
