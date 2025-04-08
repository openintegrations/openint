import type {WidgetProps} from '@rjsf/utils'
import {z} from '@openint/util/zod-utils'
import {MultiSelect} from '../../MultiSelect'

export const zMultiSelectSchema = z.object({
  items: z.object({
    enum: z.array(z.string()),
  }),
  default: z.array(z.string()).default([]),
})

export function MultiSelectWidget<T extends string[] = string[]>(
  props: WidgetProps<T>,
) {
  const {onChange} = props

  const handleChange = (newValue: string[]) => {
    onChange(newValue as T)
  }

  const schema = zMultiSelectSchema.parse(props.schema)
  const value = z.array(z.string()).optional().parse(props.value)
  const selectValue = value ?? schema.default

  return (
    <MultiSelect
      items={schema.items.enum}
      onChange={handleChange}
      value={selectValue}
    />
  )
}
