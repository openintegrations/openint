'use client'

import type {ConnectorName, Core} from '@openint/api-v1/models'
import type {Id} from '@openint/cdk/id.types'
import type {JSONSchemaFormRef} from '@openint/ui-v1'

import {skipToken, useQueries, useQueryClient} from '@tanstack/react-query'
import {AlertCircle, Loader2} from 'lucide-react'
import {useRef} from 'react'
import {
  Button,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@openint/shadcn/ui'
import {ConnectorConfigForm} from '@openint/ui-v1'
import {useConfirm} from '@openint/ui-v1/components/ConfirmAlert'
import {useMutation, useTRPC} from '@/lib-client/TRPCApp'

type ConnectorConfigDetailsProps = {
  changedFieldsRef: React.RefObject<string[]>
  successCallback?: () => void
} & (
  | {connectorConfigId: Id['ccfg']; connectorName?: never}
  | {connectorName: ConnectorName; connectorConfigId?: never}
)

export function ConnectorConfigDetails({
  connectorConfigId,
  connectorName,
  changedFieldsRef,
  successCallback,
}: ConnectorConfigDetailsProps) {
  const queryClient = useQueryClient()
  const trpc = useTRPC()
  const confirmAlert = useConfirm()
  const formRef = useRef<JSONSchemaFormRef>(null)

  /*
   * enabled should prevent this from being called if connectorConfigId or connectorName are null but didn't work,
   * The calls were being made even if connectorConfigId or connectorName were null using skipToken instead that
   * works the same as enabled but is typesafe.
   * https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries#typesafe-disabling-of-queries-using-skiptoken
   */
  const [connectorConfig, connector] = useQueries({
    queries: [
      {
        ...trpc.getConnectorConfig.queryOptions(
          connectorConfigId
            ? {
                id: connectorConfigId,
                expand: ['connector', 'connector.schemas', 'connection_count'],
              }
            : skipToken,
        ),
      },
      {
        ...trpc.getConnectorByName.queryOptions(
          connectorName
            ? {
                name: connectorName,
                expand: ['schemas'],
              }
            : skipToken,
        ),
      },
    ],
  })

  const displayName =
    connectorConfig?.data?.connector?.display_name ??
    connector?.data?.display_name

  const onSuccessUpsert = () => {
    toast.success(
      `${displayName} ${connectorConfig?.data ? 'updated' : 'added'} successfully`,
    )
    successCallback?.()
  }

  const createConfig = useMutation(
    trpc.createConnectorConfig.mutationOptions({
      onSuccess: onSuccessUpsert,
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnectorConfigs.queryKey(),
        })
      },
      onError: (error) => {
        toast.error(`Failed to add ${displayName}: ${error}`)
      },
    }),
  )
  const updateConfig = useMutation(
    trpc.updateConnectorConfig.mutationOptions({
      onSuccess: onSuccessUpsert,
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnectorConfigs.queryKey(),
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.getConnectorConfig.queryKey(),
        })
      },
      onError: (error) => {
        toast.error(`Failed to save ${displayName}: ${error}`)
      },
    }),
  )
  const deleteConfig = useMutation(
    trpc.deleteConnectorConfig.mutationOptions({
      onSuccess: () => {
        toast.success(`${displayName} deleted successfully`)
        successCallback?.()
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnectorConfigs.queryKey(),
        })
      },
      onError: (error) => {
        toast.error(`Failed to delete ${displayName}: ${error}`)
      },
    }),
  )

  const handleSave = async (data: {
    formData: Core['connector_config_insert']
  }) => {
    const {
      formData: {display_name, disabled, config = {}, ...rest},
    } = data

    if (connectorConfigId) {
      const hasOauthChanges = changedFieldsRef.current.some(
        (field) => field === 'oauth',
      )
      const updateCcfg = async () =>
        await updateConfig.mutateAsync({
          id: connectorConfigId,
          display_name: display_name ?? undefined,
          disabled: disabled ?? undefined,
          config: {
            ...config,
            ...rest,
          },
        })
      if (hasOauthChanges) {
        const confirmed = await confirmAlert({
          title: 'OAuth Credentials Changed',
          description:
            'You have changed the OAuth credentials. This will require reconnecting any existing connections using these credentials. Are you sure you want to proceed?',
        })
        if (!confirmed) {
          return
        }
      }
      await updateCcfg()
    } else {
      await createConfig.mutateAsync({
        connector_name: connectorName,
        display_name,
        disabled,
        config: {
          ...config,
          ...rest,
        },
      })
    }
  }

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  const handleDelete = async () => {
    if (!connectorConfigId) {
      return
    }

    await deleteConfig.mutateAsync({
      id: connectorConfigId,
    })
  }

  const saveButtonLabel =
    createConfig.isPending || updateConfig.isPending
      ? connectorConfigId
        ? 'Saving...'
        : 'Adding...'
      : connectorConfigId
        ? `Save ${displayName} Connector`
        : `Add ${displayName} Connector`

  const isSaveDisabled = createConfig.isPending || updateConfig.isPending

  const configSchema =
    connector?.data?.schemas?.connector_config ??
    connectorConfig?.data?.connector?.schemas?.connector_config

  if (connectorConfig.isLoading || connector.isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex size-full flex-1 flex-col justify-between">
      {connectorConfig.data ? (
        <ConnectorConfigForm
          connectorConfig={connectorConfig.data}
          configSchema={configSchema}
          changedFieldsRef={changedFieldsRef}
          onSubmit={handleSave}
          formRef={formRef}
        />
      ) : (
        <ConnectorConfigForm
          connector={connector.data}
          configSchema={configSchema}
          changedFieldsRef={changedFieldsRef}
          onSubmit={handleSave}
          formRef={formRef}
        />
      )}
      <div className="bg-background sticky bottom-0 border-t p-4">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            {connectorConfig?.data?.connection_count ? (
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
              disabled={deleteConfig.isPending}>
              {deleteConfig.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
          <Button onClick={handleFormSubmit} disabled={isSaveDisabled}>
            {saveButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
