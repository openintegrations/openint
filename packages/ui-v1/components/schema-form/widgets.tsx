import type {RegistryWidgetsType, WidgetProps} from '@rjsf/utils'
import {ConnectorScopes, type Scope} from '../ConnectorScopes'

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

// TODO: @rodrigo - We need to provide the correct availableScopes for each connector
export function ScopesWidget(props: WidgetProps<Scope[]>) {
  const {value = '', onChange, availableScopes = []} = props

  // TODO: @rodrigo - We need to decide the datatype that scopes is going to have
  // right now it's a string but the component expects an array of scopes (object with id and name)
  const scopes =
    typeof value === 'string'
      ? value.length === 0
        ? []
        : value.split(',').map((scope) => ({id: scope, name: scope}))
      : Array.isArray(value)
        ? value
        : []

  return (
    <ConnectorScopes
      scopes={scopes}
      availableScopes={availableScopes}
      editable
      onAddScope={(newValue) => {
        onChange([...scopes, newValue])
      }}
      onRemoveScope={(scope) => {
        onChange(scopes.filter((v) => v.id !== scope.id))
      }}
    />
  )
}

export const widgets = {
  MultiSelectWidget: MultiSelect,
  ScopesWidget,
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
