'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {JSONSchemaFormRef} from '../components/schema-form'

import {advancedFieldsSchema, disabledSchema} from '@openint/api-v1/models'
import {zodToOas31Schema} from '@openint/util/schema'
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
}: ConnectorConfigFormProps) {
  const initialValues = (
    connectorConfig
      ? {
          ...connectorConfig.config,
          advanced_fields: {
            display_name: connectorConfig.display_name ?? '',
          },
          disabled: connectorConfig.disabled ?? false,
        }
      : {}
  ) as Core['connector_config_insert']

  const disabledField = zodToOas31Schema(disabledSchema)
  const advancedFields = zodToOas31Schema(advancedFieldsSchema)

  /**
   * TODO: This is a temporary form schema, we need to move this to the connector config models.
   * In the connector schemas we only have connector_config for this form, but we need to add the rest
   * to the connector config models.
   */
  const formSchema = {
    type: 'object' as const,
    properties: {
      ...disabledField.properties,
      ...(configSchema?.['properties'] || {}),
      ...(advancedFields?.properties || {}),
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <div className="flex h-full flex-col space-y-8 px-8 pb-24">
          <JSONSchemaForm<Core['connector_config_insert']>
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
