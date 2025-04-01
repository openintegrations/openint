import type {FieldProps, RegistryFieldsType} from '@rjsf/utils'
import React from 'react'
import {Input, Switch} from '@openint/shadcn/ui'
import {ConnectorScopes} from '../ConnectorScopes'

interface OAuthFormData {
  client_id?: string
  client_secret?: string
  scopes?: string[]
}

export function OAuthField<T extends OAuthFormData = OAuthFormData>(
  props: FieldProps<T>,
) {
  const {formData, onChange, uiSchema, formContext} = props
  console.log({formData, uiSchema})

  const [useOpenIntCredentials, setUseOpenIntCredentials] =
    React.useState(false)

  const handleChange = (field: string, value: string | string[]) => {
    onChange({
      ...formData,
      [field]: value,
    } as T)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="use-openint-credentials"
          className="text-sm font-medium text-gray-700">
          Use OpenInt {formContext?.connectorName ?? ''} credentials
        </label>
        <Switch
          id="use-openint-credentials"
          checked={useOpenIntCredentials}
          onCheckedChange={setUseOpenIntCredentials}
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
        scopes={formData?.scopes || []}
        availableScopes={(formContext?.openint_scopes || []) as string[]}
        editable={!useOpenIntCredentials}
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
