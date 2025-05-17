'use client'

import type {Core} from '@openint/api-v1/models'
import type {Id} from '@openint/cdk'
import type {ConnectFn} from './ConnectorClientComponents.client'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useRouter} from 'next/navigation'
import React from 'react'
import {type ConnectorName} from '@openint/api-v1/trpc/routers/connector.models'
import {extractId} from '@openint/cdk'
import {toast} from '@openint/shadcn/ui'
import {prettyConnectorName} from '@openint/ui-v1/utils'
import {useTRPC} from '@/lib-client/TRPCApp'
import {useConnectContext} from './ConnectContextProvider'
import {
  ConnectorClientComponents,
  makeManualConnectorClientComponent,
  makeNativeOauthConnectorClientComponent,
} from './ConnectorClientComponents.client'

export function ConnectorConnectContainer({
  connectorName,
  connector,
  connectorConfigId,
  connectionId,
  children,
}: {
  connectorName: ConnectorName
  connector: Core['connector']
  connectorConfigId: Id['ccfg']
  connectionId?: Id['conn']
  children: (props: {
    isConnecting: boolean
    handleConnect: () => unknown
  }) => React.ReactNode
}) {
  const {isConnecting: _isConnecting, setIsConnecting} = useConnectContext()
  const [connectionState, setConnectionState] = React.useState<{
    isActive: boolean
    connectData: any
  }>({isActive: false, connectData: null})
  const name = connectorName
  const connectFnRef = React.useRef<ConnectFn | null>(null)

  // TRPC setup
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  // Post-connect mutation
  const postConnect = useMutation(
    trpc.postConnect.mutationOptions({
      onSuccess: () => {},
      onSettled: () => {},
    }),
  )

  // Handle connector completion
  const handleConnectorResult = React.useCallback(
    async (connectOutput: any) => {
      try {
        console.log(
          `[ConnectorConnect] Processing connection result for ${name}:`,
          connectOutput,
        )

        // For OAuth2 connectors, we skip the post connect mutation
        // (it's handled elsewhere in the callback flow)
        const postConnectRes =
          connector?.auth_type === 'OAUTH2'
            ? {display_name: prettyConnectorName(name)}
            : await postConnect.mutateAsync({
                connector_config_id: connectorConfigId,
                discriminated_data: {
                  connector_name: name,
                  connect_output: connectOutput,
                },
                options: {},
              })

        // Show success message
        toast.success(
          `${postConnectRes?.display_name || prettyConnectorName(name)} connected successfully.`,
        )

        // Navigate to manage view
        const url = new URL(window.location.href)
        url.searchParams.set('view', 'manage')
        router.replace((url.search || `?view=manage`) as never)

        return postConnectRes
      } catch (error) {
        console.error(`[ConnectorConnect] Error processing connection:`, error)
        toast.error('Error connecting', {description: `${error}`})
        return undefined
      } finally {
        // Reset connection state regardless of outcome
        setConnectionState({isActive: false, connectData: null})
        setIsConnecting(false)
      }
    },
    [
      connectorConfigId,
      name,
      connector?.auth_type,
      postConnect,
      queryClient,
      router,
      trpc,
      setIsConnecting,
    ],
  )

  // Start the connection process
  const handleConnect = React.useCallback(async () => {
    console.log(`[ConnectorConnect] Starting connection for ${name}`)
    setIsConnecting(true)

    try {
      // 1. Fetch the pre-connect data
      console.log(`[ConnectorConnect] Fetching pre-connect data for ${name}`)
      const preConnectData = await queryClient.fetchQuery(
        trpc.preConnect.queryOptions({
          connector_config_id: connectorConfigId,
          discriminated_data: {
            connector_name: name,
            pre_connect_input: {
              connector_config_id: connectorConfigId,
            },
          },
          options: connectionId
            ? {connectionExternalId: extractId(connectionId)[2]}
            : {},
        }),
      )

      // 2. Set connection state to active with the fetched data
      setConnectionState({
        isActive: true,
        connectData: preConnectData,
      })

      // 3. The ConnectorComponent will be rendered and will call its connect function
      // 4. The connect function will call handleConnectorResult when complete
    } catch (error) {
      console.error(`[ConnectorConnect] Error starting connection:`, error)
      toast.error('Error preparing connection', {description: `${error}`})
      setIsConnecting(false)
      setConnectionState({isActive: false, connectData: null})
    }
  }, [
    connectorConfigId,
    name,
    connectionId,
    queryClient,
    trpc,
    setIsConnecting,
  ])

  // Function that connector components call to register their connect function
  const registerConnectFn = React.useCallback(
    (fn: ConnectFn | undefined) => {
      if (fn) {
        console.log(`[ConnectorConnect] Connector registered connect function`)
        connectFnRef.current = fn

        // If we have connection data, automatically trigger the connect function
        if (connectionState.isActive && connectionState.connectData) {
          console.log(`[ConnectorConnect] Auto-triggering connect function`)
          Promise.resolve().then(async () => {
            try {
              const result = await fn(
                connectionState.connectData.connect_input,
                {
                  connectorConfigId,
                  connectionExternalId: undefined,
                  integrationExternalId: undefined,
                },
              )

              if (result) {
                await handleConnectorResult(result)
              } else {
                console.log(
                  `[ConnectorConnect] Connect function returned no result`,
                )
              }
            } catch (error) {
              console.error(
                `[ConnectorConnect] Error in connect function:`,
                error,
              )
              setIsConnecting(false)
              setConnectionState({isActive: false, connectData: null})
            }
          })
        }
      }
    },
    [
      connectionState,
      connectorConfigId,
      handleConnectorResult,
      setIsConnecting,
    ],
  )

  // Determine which component to render based on connection state and connector type
  let ConnectorComponent = null
  if (connectionState.isActive && connectionState.connectData) {
    // Look up in predefined components first
    ConnectorComponent =
      ConnectorClientComponents[
        name as keyof typeof ConnectorClientComponents
      ] || null

    // If not found, create appropriate component based on connector type
    if (!ConnectorComponent) {
      if (connector?.auth_type === 'OAUTH2') {
        ConnectorComponent = makeNativeOauthConnectorClientComponent(
          connectionState.connectData.connect_input,
        )
      } else if (connector?.schemas?.connection_settings) {
        ConnectorComponent = makeManualConnectorClientComponent(
          connector.schemas.connection_settings,
        )
      }
    }
  }

  const isConnecting = _isConnecting || postConnect.isPending

  return (
    <>
      {/* Only render connector component when active */}
      {connectionState.isActive && ConnectorComponent && (
        <ConnectorComponent
          key={name}
          connector_name={name}
          onConnectFn={registerConnectFn}
        />
      )}

      {/* Always render children with connection state */}
      {children({isConnecting, handleConnect})}
    </>
  )
}
