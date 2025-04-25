'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'

import {AlertCircle} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {
  Button,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@openint/shadcn/ui'
import {useConfirm} from '../components/ConfirmAlert'
import {getChangedFields, JSONSchemaForm} from '../components/schema-form'

export interface FormData {
  displayName: string
  disabled: boolean
  config?: Core['connector_config_insert']['config']
  [key: string]: unknown
}

export interface ConnectorConfigFormProps {
  /**
   * The connector config data, Initial state of the form.
   **/
  connectorConfig?: ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null

  /**
   * The selected connector, when we only get connector it means we are creating a new connector config
   */
  connector: Core['connector'] | null

  configSchema: Record<string, unknown> | undefined

  /**
   * Callback for when the delete button is clicked
   */
  onDelete?: () => void

  /**
   * Callback for when the save button is clicked
   */
  onSave: (data: FormData) => Promise<void>

  /**
   * Flag to indicate if the delete button should be disabled
   */
  isDeleteDisabled?: boolean

  /**
   * Flag to indicate if the save button should be disabled
   */
  isSaveDisabled?: boolean

  /**
   * Label for the save button
   */
  saveButtonLabel: string

  /**
   * Flag to indicate if the delete operation is pending
   */
  isDeletePending?: boolean

  /**
   * changed field names
   */
  changedFields: string[]

  /**
   * changed fields setter
   */
  setChangedFields: (fields: string[]) => void
}

/**
 * ConnectorConfigForm component that displays the configuration form for a specific connector
 */
export function ConnectorConfigForm({
  configSchema,
  connector,
  connectorConfig,
  onDelete,
  onSave,
  isDeleteDisabled = false,
  isSaveDisabled = false,
  saveButtonLabel,
  isDeletePending = false,
  changedFields,
  setChangedFields,
}: ConnectorConfigFormProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [formState, setFormState] = useState<FormData | null>(null)
  const confirmAlert = useConfirm()

  const compareFormState = useCallback(() => {
    if (formState) {
      const baseValues = connectorConfig
        ? {
            disabled: connectorConfig.disabled,
            displayName: connectorConfig.display_name,
            ...connectorConfig.config,
          }
        : null
      return getChangedFields(formState, baseValues)
    }
    return []
  }, [connectorConfig, formState])

  useEffect(() => {
    const newChangedFields = compareFormState()
    console.log('newChangedFields', newChangedFields)
    setChangedFields(newChangedFields)
  }, [compareFormState])

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
    openint_scopes: connector?.openint_scopes ?? [],
    scopes: connector?.scopes ?? [],
    initialData: connectorConfig,
    connector,
  }

  const handleFormChange = useCallback(
    (data: {formData?: FormData}) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (data.formData) {
          setFormState(data.formData)
          const newChangedFields = getChangedFields(
            data.formData,
            connectorConfig
              ? {
                  disabled: connectorConfig.disabled,
                  displayName: connectorConfig.display_name,
                  ...connectorConfig.config,
                }
              : {
                  disabled: false,
                  displayName: '',
                },
          )
          setChangedFields(newChangedFields)
        }
      }, 300)
    },
    [connectorConfig],
  )

  const handleSave = useCallback(async () => {
    const saveData = async () => {
      if (formState) {
        try {
          await onSave(formState)
          toast.success(
            `${connector?.name} ${connectorConfig ? 'updated' : 'added'} successfully`,
          )
        } catch (error) {
          toast.error(
            `Failed to save connector: ${error instanceof Error ? error.message : error}`,
          )
        }
      }
    }
    const handleConfirmReconnect = async () => {
      if (changedFields.length === 0 || !connector || !formState) return

      await saveData()
      setChangedFields([])
    }
    const hasOauthChanges = changedFields.some((field) => field === 'oauth')
    if (connectorConfig && hasOauthChanges) {
      await confirmAlert({
        title: 'OAuth Credentials Changed',
        description:
          'You have changed the OAuth credentials. This will require reconnecting any existing connections using these credentials. Are you sure you want to proceed?',
        onConfirm: async () => {
          await handleConfirmReconnect()
        },
      })
      return
    }

    await saveData()
    setChangedFields([])
  }, [
    changedFields,
    confirmAlert,
    connector,
    connectorConfig,
    formState,
    onSave,
    setChangedFields,
  ])

  const handleDelete = useCallback(async () => {
    if (!connectorConfig || !onDelete) return

    try {
      await onDelete()
      toast.success(`${connectorConfig?.connector_name} deleted successfully`)
    } catch (error) {
      toast.error(
        `Failed to delete connector ${connectorConfig?.connector_name}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }, [connectorConfig, onDelete])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full flex-col space-y-8 px-8">
          <JSONSchemaForm
            jsonSchema={formSchema}
            formData={initialValues}
            formContext={formContext}
            onChange={handleFormChange}
          />
        </div>
      </div>
      {connector && (
        <div className="mt-auto border-t p-4">
          <div className="flex w-full flex-row justify-between">
            <div className="flex flex-row items-center gap-2">
              {connectorConfig?.connection_count ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="text-destructive size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Cannot delete connector config because it has active
                    connections, delete the connections before deleting the
                    connector config.
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleteDisabled}>
                {isDeletePending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaveDisabled || changedFields.length === 0}>
              {saveButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectorConfigForm
