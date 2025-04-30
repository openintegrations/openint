'use client'

import type {IChangeEvent} from '@rjsf/core'
import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {JSONSchemaFormRef} from '../components/schema-form'

import {useCallback} from 'react'
import {JSONSchemaForm} from '../components/schema-form'

export type ConnectorConfigFormProps = {
  /*
   * The schema of the connector config, this is used to generate the form
   */
  configSchema: Record<string, unknown> | undefined
  /*
   * Changed fields ref.
   */
  changedFieldsRef: React.RefObject<string[]>
  /*
   * formRef for JSONSchemaForm
   */
  formRef: React.RefObject<JSONSchemaFormRef | null>
  /*
   * onSubmit for JSONSchemaForm
   */
  onSubmit?: (data: {formData: Core['connector_config_insert']}) => void
  /*
   * onChange callback for when the form changes
   */
  onChange?: () => void
} & (
  | {
      connectorConfig: ConnectorConfig<
        'connector' | 'integrations' | 'connection_count'
      >
      connector?: never
    }
  | {
      connector: Core['connector']
      connectorConfig?: never
    }
)

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
  onChange,
}: ConnectorConfigFormProps) {
  const initialValues = (
    connectorConfig
      ? {
          ...connectorConfig.config,
          display_name: connectorConfig.display_name ?? '',
          disabled: connectorConfig.disabled ?? false,
        }
      : {}
  ) as Core['connector_config_insert']

  /**
   * TODO: This is a temporary form schema, we need to move this to the connector config models.
   * In the connector schemas we only have connector_config for this form, but we need to add the rest
   * to the connector config models.
   */
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
      display_name: {
        type: 'string' as const,
        title: 'Display Name',
        description: 'A friendly name for this connector configuration',
      },
      ...(configSchema?.['properties'] || {}),
    },
  }

  const openint_scopes =
    connector?.openint_scopes ??
    connectorConfig?.connector?.openint_scopes ??
    []

  const scopes = connector?.scopes ?? connectorConfig?.connector?.scopes ?? []

  const formContext = {
    openint_scopes,
    scopes,
    initialData: connectorConfig,
    connector: connector ?? connectorConfig?.connector,
  }

  // Track user interaction with the form
  const handleFormChange = useCallback(
    (_data: IChangeEvent<any>, id?: string) => {
      // Only call onChange when there's actual user interaction
      if (id !== undefined) {
        if (onChange) {
          onChange()
        }
      }
    },
    [onChange],
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <div className="flex h-full flex-col space-y-8 px-8">
          <JSONSchemaForm<Core['connector_config_insert']>
            jsonSchema={formSchema}
            formData={initialValues}
            formContext={formContext}
            formRef={formRef}
            changedFieldsRef={changedFieldsRef}
            onChange={handleFormChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default ConnectorConfigForm
