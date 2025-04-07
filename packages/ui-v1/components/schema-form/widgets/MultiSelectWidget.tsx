import type {WidgetProps} from '@rjsf/utils'
import {MultiSelect} from '../../MultiSelect'

interface Schema {
  type: string
  items: {
    enum: string[]
  }
  default?: string[]
}

export default function MultiSelectField<T extends string[] = string[]>(
  props: WidgetProps<T>,
) {
  const {onChange, value} = props
  const {items, default: defaultValue = []} = props.schema as Schema

  const handleChange = (newValue: string[]) => {
    onChange(newValue as T)
  }

  const selectValue = (value ?? defaultValue) as string[]

  return (
    <MultiSelect
      items={items.enum ?? []}
      onChange={handleChange}
      value={selectValue}
    />
  )
}
