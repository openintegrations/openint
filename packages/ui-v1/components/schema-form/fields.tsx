import type {FieldProps, RegistryFieldsType} from '@rjsf/utils'
import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {OAuthConnectorConfig} from '@openint/cnext/auth-oauth2/schemas'

import Image from 'next/image'
import {useState} from 'react'
import {env} from '@openint/env'
import {Input, Switch} from '@openint/shadcn/ui'
import {ConnectorBadges} from '../../domain-components/ConnectorCard'
import {ConnectorScopes} from '../ConnectorScopes'
import {CopyID} from '../CopyID'
import {CredentialsField} from './fields/CredentialsField'

interface Scope {
  scope: string
  display_name: string
  description: string
}

interface OAuthFormContext {
  openint_scopes: string[]
  scopes: Scope[]
  initialData: ConnectorConfig
  connector: Core['connector']
}

export function OAuthField(props: FieldProps<OAuthConnectorConfig>) {
  const {formData, onChange, formContext} = props
  const {openint_scopes, scopes, initialData, connector} =
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
    } as OAuthConnectorConfig)
  }

  const handleSwitchChange = (newValue: boolean) => {
    onChange({
      ...formData,
      client_id: newValue ? undefined : initialData?.config?.oauth?.client_id,
      client_secret: newValue
        ? undefined
        : initialData?.config?.oauth?.client_secret,
      redirect_uri: newValue
        ? undefined
        : initialData?.config?.oauth?.redirect_uri,
      scopes: newValue
        ? (formData?.scopes || []).filter((s) => openint_scopes.includes(s))
        : formData?.scopes,
    } as OAuthConnectorConfig)

    setUseOpenIntCredentials(newValue)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="use-openint-credentials"
          className="text-sm font-medium text-gray-700">
          Use OpenInt {connector?.display_name} credentials
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
          <label
            htmlFor="redirect_uri"
            className="text-sm font-medium text-gray-700">
            Redirect URI (Optional)
          </label>
          <div className="text-sm text-gray-500">
            If not specified, will default to{' '}
            <pre>{env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY}</pre>
          </div>
          <Input
            id="redirect_uri"
            type="text"
            // TODO: Validate that this is a URL field...
            // TODO: Delegate to schema form for this rather than
            // rendering these individual fields but losing all validation information
            value={formData?.redirect_uri || ''}
            onChange={(e) => {
              handleChange('redirect_uri', e.target.value)
            }}
            placeholder={env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY}
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

export function DisabledField(props: FieldProps<boolean>) {
  const {formData, onChange, formContext} = props
  const {initialData, connector} = formContext as OAuthFormContext

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 space-y-1">
        <div className="flex items-center gap-2">
          {connector?.logo_url && (
            <Image
              src={connector.logo_url}
              alt={`${connector.display_name} logo`}
              width={24}
              height={24}
              className="object-contain"
            />
          )}
          <h3 className="font-medium">{connector?.display_name}</h3>
        </div>
        {initialData?.id && <CopyID value={initialData?.id} />}

        <div className="flex items-center space-x-2 text-sm">
          <ConnectorBadges
            stage={connector?.stage}
            platforms={connector?.platforms}
          />
        </div>
      </div>

      <div className="flex items-center">
        <label
          htmlFor="disabled"
          className="w-36 flex-shrink-0 text-sm font-medium text-gray-700">
          Disabled
        </label>
        <Switch
          id="disabled"
          checked={formData}
          onCheckedChange={(checked) => {
            onChange(checked)
          }}
        />
      </div>

      {initialData?.created_at || initialData?.updated_at ? (
        <div className="flex flex-col space-y-1 text-xs text-gray-500">
          {initialData?.created_at && (
            <div className="flex items-center">
              <span className="w-36 flex-shrink-0">Created:</span>
              <span>{new Date(initialData.created_at).toLocaleString()}</span>
            </div>
          )}
          {initialData?.updated_at && (
            <div className="flex items-center">
              <span className="w-36 flex-shrink-0">Updated:</span>
              <span>{new Date(initialData.updated_at).toLocaleString()}</span>
            </div>
          )}
          {initialData?.connection_count !== undefined && (
            <div className="flex items-center">
              <span className="w-36 flex-shrink-0">Connections:</span>
              <span>{initialData.connection_count}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Fields contain widgets, but are responsible for rendering even more things like
 * headers, footers, etc.
 */
export const fields = {
  OAuthField,
  DisabledField,
  CredentialsField,
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
