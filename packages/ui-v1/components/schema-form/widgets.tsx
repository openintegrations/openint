import type {RegistryWidgetsType, WidgetProps} from '@rjsf/utils'
import ConnectorScopes from '../ConnectorScopes'
import MultiSelectWidget from './widgets/MultiSelectWidget'

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
  MultiSelectWidget,
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
