import type {FieldProps, RegistryFieldsType} from '@rjsf/utils'
import {useState} from 'react'
import type {ConnectorConfig} from '@openint/api-v1/models'
import {Input, Switch} from '@openint/shadcn/ui'
import ConnectorScopes from '../ConnectorScopes'

interface OAuthFormData {
  client_id?: string
  client_secret?: string
  scopes?: string[]
}

interface Scope {
  scope: string
  display_name: string
  description: string
}

interface OAuthFormContext {
  openint_scopes: string[]
  scopes: Scope[]
  connectorName: string
  initialData: ConnectorConfig
}

export function OAuthField<T extends OAuthFormData = OAuthFormData>(
  props: FieldProps<T>,
) {
  const {formData, onChange, formContext} = props
  const {openint_scopes, scopes, connectorName, initialData} =
    formContext as OAuthFormContext

  const scopeLookup =
    scopes?.reduce<Record<string, Scope>>((acc, scope) => {
      acc[scope.scope] = scope
      return acc
    }, {}) ?? {}

  const [useOpenIntCredentials, setUseOpenIntCredentials] = useState(
    !formData?.client_id && !formData?.client_secret,
  )

  const availableScopes: string[] = useOpenIntCredentials
    ? openint_scopes
    : scopes.map((s) => s.scope)

  const handleChange = (field: string, value?: string | string[]) => {
    onChange({
      ...formData,
      [field]: value,
    } as T)
  }

  const handleSwitchChange = (newValue: boolean) => {
    onChange({
      ...formData,
      client_id:
        newValue && initialData?.config
          ? undefined
          : initialData.config.oauth.client_id,
      client_secret:
        newValue && initialData?.config
          ? undefined
          : initialData.config.oauth.client_secret,
      scopes: newValue
        ? formData?.scopes?.filter((s) => openint_scopes.includes(s))
        : formData?.scopes,
    } as T)
    setUseOpenIntCredentials(newValue)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="use-openint-credentials"
          className="text-sm font-medium text-gray-700">
          Use OpenInt {connectorName} credentials
        </label>
        <Switch
          id="use-openint-credentials"
          checked={useOpenIntCredentials}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {!useOpenIntCredentials && (
        <div className="space-y-2">
          <label
            htmlFor="client-id"
            className="text-sm font-medium text-gray-700">
            Client ID
          </label>
          <Input
            id="client-id"
            type="text"
            value={formData?.client_id || ''}
            onChange={(e) => {
              handleChange('client_id', e.target.value)
            }}
            placeholder="Enter client ID"
          />
          <label
            htmlFor="client-secret"
            className="text-sm font-medium text-gray-700">
            Client Secret
          </label>
          <Input
            id="client-secret"
            type="text"
            value={formData?.client_secret || ''}
            onChange={(e) => {
              handleChange('client_secret', e.target.value)
            }}
            placeholder="Enter client secret"
          />
        </div>
      )}
      <ConnectorScopes
        scopeLookup={scopeLookup}
        scopes={formData?.scopes || []}
        availableScopes={availableScopes}
        editable
        hideCustomInput={useOpenIntCredentials}
        onAddScope={(scope) => {
          handleChange('scopes', [...(formData?.scopes || []), scope])
        }}
        onRemoveScope={(scope) => {
          handleChange(
            'scopes',
            (formData?.scopes || []).filter((s: string) => s !== scope),
          )
        }}
      />
    </div>
  )
}

/**
 * Fields contain widgets, but are responsible for rendering even more things like
 * headers, footers, etc.
 */
export const fields = {
  OAuthField,
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
