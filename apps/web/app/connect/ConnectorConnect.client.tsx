'use client'

import type {Core} from '@openint/api-v1/models'
import type {Id} from '@openint/cdk'
import type {ConnectFn} from './ConnectorClientComponents.client'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
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
  /** For reconnecting to an existing connection. How do we ensure it matches the connector config though? */
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

  const name = connectorName

  if (!connector) {
    throw new Error(`Connector missing in ConnectorConnectContainer`)
  }

  // console.log('AddConnectionInner rendering', name, connectorConfig)

  const ref = React.useRef<ConnectFn | undefined>(undefined)

  const trpc = useTRPC()
  // Should load script immediately (via useConnectHook) rather than waiting for suspense query?
  const preConnectRes = useSuspenseQuery(
    trpc.preConnect.queryOptions({
      connector_config_id: connectorConfigId,
      discriminated_data: {
        connector_name: name,
        pre_connect_input: {},
      },
      options: connectionId
        ? {connectionExternalId: extractId(connectionId)[2]}
        : {},
    }),
  )
  const queryClient = useQueryClient()

  const postConnect = useMutation(
    trpc.postConnect.mutationOptions({
      onSuccess: () => {},
      onSettled: () => {},
    }),
  )

  const router = useRouter()

  const handleConnect = React.useCallback(async () => {
    try {
      setIsConnecting(true)
      // console.log('ref.current', ref.current)
      const connectRes = await ref.current?.(preConnectRes.data.connect_input, {
        connectorConfigId: connectorConfigId as `ccfg_${string}`,
        connectionExternalId: undefined,
        integrationExternalId: undefined,
      })
      // console.log('connectRes', connectRes)
      /// todo: always validate schema even if pre/post connect are not
      // implemented
      const postConnectRes = await postConnect.mutateAsync({
        connector_config_id: connectorConfigId,
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

      // TODO: update local cache state with result from postConnect
      toast.success(
        `${postConnectRes.display_name || prettyConnectorName(name)} connected successfully.`,
      )

      const url = new URL(window.location.href)
      url.searchParams.set('view', 'manage')
      router.replace((url.search || `?view=manage`) as never) // FIXME: This typing is problematic
      return postConnectRes
    } catch (error) {
      console.error('Error connecting', error)
      toast.error('Error connecting', {
        description: `${error}`,
      })
      return undefined
    } finally {
      setIsConnecting(false)
    }
    // TODO: This is not exhaustive. WHat do we need to do to fix it here
  }, [connectorConfigId, preConnectRes])

  let Component =
    ConnectorClientComponents[name as keyof typeof ConnectorClientComponents]

  if (!Component && connector?.authType === 'OAUTH2') {
    Component = makeNativeOauthConnectorClientComponent(
      preConnectRes.data.connect_input,
    )
  } else if (!Component) {
    // TODO: handle me, for thigns like oauth connectors
    // console.warn(`Unhandled connector: ${name}`)
    // throw new Error(`Unhandled connector: ${name}`)
    const settingsJsonSchema = connector?.schemas?.connection_settings
    if (settingsJsonSchema) {
      Component = makeManualConnectorClientComponent(settingsJsonSchema)
    } else {
      console.warn(`No Component for connector: ${name}`)
    }
  }
  const isConnecting = _isConnecting || postConnect.isPending

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

      {children({isConnecting, handleConnect})}
    </>
  )
}
