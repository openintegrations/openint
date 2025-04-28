'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {JSONSchemaFormRef} from '../components/schema-form'

import {JSONSchemaForm} from '../components/schema-form'

export interface FormData {
  displayName: string
  disabled: boolean
  config?: Core['connector_config_insert']['config']
  [key: string]: unknown
}

export interface ConnectorConfigFormProps {
  // The connector config data, Initial state of the form.
  connectorConfig?: ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null
  //The selected connector, when we only get connector it means we are creating a new connector config
  connector: Core['connector'] | null
  // The schema of the connector config, this is used to generate the form
  configSchema: Record<string, unknown> | undefined
  changedFieldsRef: React.RefObject<string[]>
  formRef: React.RefObject<JSONSchemaFormRef | null>
  onSubmit?: (data: {formData: FormData}) => void
}

/**
 * ConnectorConfigForm component that displays the configuration form for a specific connector
 */
export function ConnectorConfigForm({
  configSchema,
  connector,
  connectorConfig,
  changedFieldsRef,
  onSubmit,
  formRef,
}: ConnectorConfigFormProps) {
  const initialValues = (
    connectorConfig
      ? {
          ...connectorConfig.config,
          displayName: connectorConfig.display_name ?? '',
          disabled: connectorConfig.disabled ?? false,
        }
      : {}
  ) as FormData

  const formSchema = {
    type: 'object' as const,
    properties: {
      disabled: {
        type: 'boolean' as const,
        title: 'Disabled',
        description:
          'When disabled it will not be used for connection portal. Essentially a reversible soft-delete',
        'ui:field': 'DisabledField',
      },
      displayName: {
        type: 'string' as const,
        title: 'Display Name',
        description: 'A friendly name for this connector configuration',
      },
      ...(configSchema?.['properties'] || {}),
    },
  }

  const formContext = {
    openint_scopes:
      connector?.openint_scopes ?? connectorConfig?.connector?.openint_scopes,
    scopes: connector?.scopes ?? connectorConfig?.connector?.scopes,
    initialData: connectorConfig,
    connector: connector ?? connectorConfig?.connector,
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full flex-col space-y-8 px-8">
          <JSONSchemaForm
            jsonSchema={formSchema}
            formData={initialValues}
            formContext={formContext}
            formRef={formRef}
            changedFieldsRef={changedFieldsRef}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default ConnectorConfigForm
