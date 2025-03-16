// Custom widgets

import type {FieldProps, RegistryFieldsType} from '@rjsf/utils'

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
