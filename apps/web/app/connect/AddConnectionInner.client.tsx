'use client'

import type {AppRouterOutput} from '@openint/api-v1'
import type {ConnectorConfig} from '@openint/api-v1/routers/connectorConfig.models'
import type {ConnectFn} from './ConnectorClientComponents.client'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import React from 'react'
import {type ConnectorName} from '@openint/api-v1/routers/connector.models'
import {Label, toast} from '@openint/shadcn/ui'
import {ConnectorConfigCard} from '@openint/ui-v1/domain-components/ConnectorConfigCard'
import {useTRPC} from '@/lib-client/TRPCApp'
import {
  ConnectorClientComponents,
  makeManualConnectorClientComponent,
  makeNativeOauthConnectorClientComponent,
} from './ConnectorClientComponents.client'

export type ConnectorConfigForCustomer = Pick<
  ConnectorConfig<'connector'>,
  'id' | 'connector_name' | 'connector'
>

export function AddConnectionInner({
  connectorConfig,
  ...props
}: {
  connectorConfig: ConnectorConfigForCustomer
  onReady?: (ctx: {state: string}, name: string) => void
  initialData?: Promise<AppRouterOutput['preConnect']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))
  const [isConnecting, setIsConnecting] = React.useState(false)

  const name = connectorConfig.connector_name as ConnectorName

  if (!connectorConfig.connector) {
    throw new Error(`Connector missing in AddConnectionInner`)
  }

  // console.log('AddConnectionInner rendering', name, connectorConfig)

  const ref = React.useRef<ConnectFn | undefined>(undefined)

  const trpc = useTRPC()
  // Should load script immediately (via useConnectHook) rather than waiting for suspense query?
  const preConnectRes = useSuspenseQuery(
    trpc.preConnect.queryOptions(
      {
        connector_config_id: connectorConfig.id,
        discriminated_data: {
          connector_name: name,
          pre_connect_input: {},
        },
        options: {},
      },
      initialData ? {initialData} : undefined,
    ),
  )
  // console.log('preConnectRes', preConnectRes)

  const queryClient = useQueryClient()

  const postConnect = useMutation(
    trpc.postConnect.mutationOptions({
      onSuccess: () => {},
      onSettled: () => {},
    }),
  )

  const handleConnect = React.useCallback(async () => {
    try {
      setIsConnecting(true)
      // console.log('ref.current', ref.current)
      const connectRes = await ref.current?.(preConnectRes.data.connect_input, {
        connectorConfigId: connectorConfig.id as `ccfg_${string}`,
        connectionExternalId: undefined,
        integrationExternalId: undefined,
      })
      // console.log('connectRes', connectRes)
      /// todo: always validate schema even if pre/post connect are not
      // implemented
      const postConnectRes = await postConnect.mutateAsync({
        connector_config_id: connectorConfig.id,
        discriminated_data: {
          connector_name: name,
          connect_output: connectRes,
        },
        options: {},
      })

      // console.log('postConnectRes', postConnectRes)

      // Need to invalidate listConnections regardless of params. operating on a prefix basis
      // back up in case refetchQueries doesn't work, query is still marked as stale
      void queryClient.invalidateQueries({
        queryKey: trpc.listConnections.queryKey({}),
      })
      // Immediately trigger refetch to not need to wait until refetchOnMount
      void queryClient.refetchQueries({
        // stale: true, // This is another option
        queryKey: trpc.listConnections.queryKey({}),
      })

      // This is the only way that works for now...
      // TODO: Fix this madness
    } catch (error) {
      console.error('Error connecting', error)
      toast.error('Error connecting', {
        description: `${error}`,
      })
    } finally {
      setIsConnecting(false)
    }
  }, [connectorConfig, preConnectRes])

  let Component =
    ConnectorClientComponents[name as keyof typeof ConnectorClientComponents]

  if (!Component && connectorConfig.connector?.authType === 'OAUTH2') {
    Component = makeNativeOauthConnectorClientComponent(
      preConnectRes.data.connect_input,
    )
  } else if (!Component) {
    // TODO: handle me, for thigns like oauth connectors
    // console.warn(`Unhandled connector: ${name}`)
    // throw new Error(`Unhandled connector: ${name}`)
    const settingsJsonSchema =
      connectorConfig.connector?.schemas?.connection_settings
    if (settingsJsonSchema) {
      Component = makeManualConnectorClientComponent(settingsJsonSchema)
    } else {
      console.warn(`No Component for connector: ${name}`)
    }
  }

  return (
    <>
      {/*
       Very careful to not cause infinite loop here during rendering
       need to make ourselves a pure component
       */}

      {Component && (
        <Component
          key={name}
          connector_name={name}
          // eslint-disable-next-line react-hooks/rules-of-hooks
          onConnectFn={React.useCallback((fn) => {
            ref.current = fn

            // onReady(c, name)
            // setFn(c)
          }, [])}
        />
      )}

      <ConnectorConfigCard
        displayNameLocation="right"
        // TODO: fix this
        connectorConfig={connectorConfig as ConnectorConfig<'connector'>}
        onPress={() => handleConnect()}>
        <Label className="text-muted-foreground pointer-events-none ml-auto text-sm">
          {isConnecting || postConnect.isPending ? 'Connecting...' : 'Connect'}
        </Label>
      </ConnectorConfigCard>
    </>
  )
}
