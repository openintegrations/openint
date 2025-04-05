import type {FieldProps} from '@rjsf/utils'
import {useState} from 'react'
import type {ConnectorConfig} from '@openint/api-v1/models'
import {Input} from '@openint/shadcn/ui/input'
import {Label} from '@openint/shadcn/ui/label'
import {Switch} from '@openint/shadcn/ui/switch'

type Credentials = {
  clientId: string
  clientSecret: string
} | null

interface CredentialsFormContext {
  connectorName: string
  initialData: ConnectorConfig
}

/**
 * This field is used to handle credentials for plaid connector
 */
export function CredentialsField<T extends Credentials = Credentials>(
  props: FieldProps<T>,
) {
  const {formData, onChange, formContext} = props
  const {connectorName, initialData} = formContext as CredentialsFormContext
  const [useOpenIntCredentials, setUseOpenIntCredentials] = useState(
    !formData?.clientId && !formData?.clientSecret,
  )

  const handleChange = (field: string, value?: string | string[]) => {
    onChange({
      ...formData,
      [field]: value,
    } as T)
  }

  const handleSwitchChange = (newValue: boolean) => {
    console.log('handleSwitchChange', newValue)
    if (newValue) {
      onChange(null as T)
    } else {
      if (initialData.config.credentials) {
        onChange({
          clientId: initialData.config.credentials.clientId,
          clientSecret: initialData.config.credentials.clientSecret,
        } as T)
      }
    }
    setUseOpenIntCredentials(newValue)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Use OpenInt {connectorName} credentials</Label>
        <Switch
          checked={useOpenIntCredentials}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {!useOpenIntCredentials && (
        <div className="space-y-2">
          <Label>Client ID</Label>
          <Input
            type="text"
            value={formData?.clientId || ''}
            onChange={(e) => {
              handleChange('clientId', e.target.value)
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
            value={formData?.clientSecret || ''}
            onChange={(e) => {
              handleChange('clientSecret', e.target.value)
            }}
            placeholder="Enter client secret"
          />
        </div>
      )}
    </div>
  )
}
