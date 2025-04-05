import type {FieldProps} from '@rjsf/utils'
import {MultiSelect} from '../../MultiSelect'

interface Schema {
  type: string
  items: {
    enum: string[]
  }
  default?: string[]
}

const camelCaseToFieldName = (name: string): string =>
  name
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export function MultiSelectField<T extends string[] = string[]>(
  props: FieldProps<T>,
) {
  const {onChange, formData} = props
  const {items, default: defaultValue = []} = props.schema as Schema

  const handleChange = (newValue: string[]) => {
    onChange(newValue as T)
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold">{camelCaseToFieldName(props.name)}</h3>
      <MultiSelect
        items={items.enum ?? []}
        onChange={handleChange}
        value={formData ?? defaultValue}
      />
    </div>
  )
}
