'use client'

import type {IChangeEvent} from '@rjsf/core'
import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {JSONSchemaFormRef} from '../components/schema-form'

import {useCallback} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
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
    <div className="divide-border/40 divide-y">
      <JSONSchemaForm<Core['connector_config_insert']>
        jsonSchema={formSchema}
        formData={initialValues}
        formContext={formContext}
        formRef={formRef}
        changedFieldsRef={changedFieldsRef}
        onChange={handleFormChange}
        onSubmit={onSubmit}
        className={cn('schema-form-improved', 'px-0')}
      />
      <style jsx global>{`
        .schema-form-improved .form-group {
          @apply border-border/40 flex items-center px-0 py-3;
          border-bottom-width: 0;
        }
        .schema-form-improved .form-group:first-child {
          @apply pt-0;
        }
        .schema-form-improved .form-group:last-child {
          @apply pb-0;
        }
        .schema-form-improved label.control-label {
          @apply text-muted-foreground w-1/3 text-sm font-normal;
        }
        .schema-form-improved .field-description {
          @apply text-muted-foreground my-1 text-xs;
        }
        .schema-form-improved .form-group > div {
          @apply w-2/3;
        }
        .schema-form-improved input,
        .schema-form-improved select {
          @apply bg-background border-input rounded-md border px-3 py-2;
          max-width: 100%;
        }
        .schema-form-improved fieldset {
          @apply m-0 border-none p-0;
        }
        .schema-form-improved fieldset > legend {
          @apply hidden;
        }

        /* Custom field specific styles */
        .schema-form-improved [id$='_disabled-field'] > div {
          @apply flex justify-start;
        }

        /* Switch styling */
        .schema-form-improved .switch-container {
          @apply flex items-center;
        }

        /* OAuth field styling */
        .schema-form-improved [id$='_oauth-field'],
        .schema-form-improved [id$='_credentials-field'] {
          @apply w-full;
        }

        .schema-form-improved [id$='_oauth-field'] > div,
        .schema-form-improved [id$='_credentials-field'] > div {
          @apply w-full;
        }

        /* Fix alignment for OAuth switch */
        .schema-form-improved
          [id$='_oauth-field']
          .w-full.flex.justify-between {
          @apply items-center;
        }

        /* Fix alignment for scopes */
        .schema-form-improved [id*='scopes'] {
          @apply flex-col pt-2;
        }

        .schema-form-improved [id*='scopes'] > label {
          @apply w-full;
        }

        .schema-form-improved [id*='scopes'] > div {
          @apply w-full pt-2;
        }
      `}</style>
    </div>
  )
}

export default ConnectorConfigForm
