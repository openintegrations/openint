import type {WidgetProps} from '@rjsf/utils'
import {MultiSelect} from '../../MultiSelect'

export function MultiSelectWidget<T extends string[] = string[]>(
  props: WidgetProps<T>,
) {
  const {onChange, value} = props
  const {items, default: defaultValue = []} = props.schema

  const handleChange = (newValue: string[]) => {
    onChange(newValue as T)
  }

  const selectValue = (value ?? defaultValue) as string[]

  const enumOptions =
    items && typeof items === 'object' && 'enum' in items
      ? (items.enum as string[])
      : []

  return (
    <MultiSelect
      items={enumOptions}
      onChange={handleChange}
      value={selectValue}
    />
  )
}
