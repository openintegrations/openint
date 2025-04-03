import type {RegistryWidgetsType, WidgetProps} from '@rjsf/utils'
import ConnectorScopes from '../ConnectorScopes'

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

export function ScopesWidget(props: WidgetProps<string[]>) {
  const {value, onChange, options} = props

  const scopes = value as string[]

  return (
    <ConnectorScopes
      scopes={scopes}
      availableScopes={options?.['availableScopes'] as string[]}
      editable
      onAddScope={(newValue) => {
        onChange([...scopes, newValue])
      }}
      onRemoveScope={(scope) => {
        onChange(scopes.filter((v) => v !== scope))
      }}
    />
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
