import type {FieldProps, RegistryFieldsType} from '@rjsf/utils'
import {Copy} from 'lucide-react'
import {useState} from 'react'
import type {ConnectorConfig} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge, Input, Switch} from '@openint/shadcn/ui'
import {ConnectorBadges} from '../../domain-components/ConnectorCard'
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

export function DisabledField(props: FieldProps<boolean>) {
  const {formData, onChange, formContext} = props
  const {initialData, connectorName} = formContext as OAuthFormContext
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (initialData?.id) {
      navigator.clipboard
        .writeText(initialData.id)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => console.error('Failed to copy: ', err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          {initialData?.connector?.logo_url && (
            <img
              src={initialData.connector.logo_url}
              alt={`${connectorName} logo`}
              className="h-6 w-6 object-contain"
            />
          )}
          <h3 className="font-medium">{connectorName}</h3>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Badge variant="secondary">{initialData?.id || ''}</Badge>
          {initialData?.id && (
            <button
              onClick={(e) => {
                copyToClipboard(e)
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="ml-1.5 rounded-sm p-0.5 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-200"
              aria-label="Copy ID to clipboard"
              title="Copy ID to clipboard">
              <Copy
                className={cn(
                  'h-3.5 w-3.5',
                  copied ? 'text-green-500' : 'text-gray-400',
                )}
              />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <ConnectorBadges
            stage={initialData?.connector?.stage}
            platforms={initialData?.connector?.platforms}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="disabled" className="text-sm font-medium text-gray-700">
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
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span>{new Date(initialData.created_at).toLocaleString()}</span>
            </div>
          )}
          {initialData?.updated_at && (
            <div className="flex items-center justify-between">
              <span>Updated:</span>
              <span>{new Date(initialData.updated_at).toLocaleString()}</span>
            </div>
          )}
          {initialData?.connection_count !== undefined && (
            <div className="flex items-center justify-between">
              <span>Connections:</span>
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
