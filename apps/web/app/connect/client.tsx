'use client'

import type {AppRouterOutput} from '@openint/api-v1'
import type {ConnectorConfig} from '@openint/api-v1/routers/connectorConfig.models'
import type {JSONSchemaFormRef} from '@openint/ui-v1'

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import React from 'react'
import {clientConnectors} from '@openint/all-connectors/connectors.client'
import {type ConnectorName} from '@openint/api-v1/routers/connector.models'
import {type ConnectorClient, type JSONSchema} from '@openint/cdk'
import {Button, Label, toast} from '@openint/shadcn/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@openint/shadcn/ui/dialog'
import {
  CommandPopover,
  DataTileView,
  JSONSchemaForm,
  Spinner,
  useMutableSearchParams,
} from '@openint/ui-v1'
import {ConnectionCard} from '@openint/ui-v1/domain-components/ConnectionCard'
import {ConnectorConfigCard} from '@openint/ui-v1/domain-components/ConnectorConfigCard'
import {Deferred} from '@openint/util/promise-utils'
import {useTRPC} from '@/lib-client/ClientApp'
import {useCommandDefinitionMap} from '../../lib-client/GlobalCommandBarProvider'
import {openOAuthPopup} from './callback/openOAuthPopup'

// MARK: - Connector Client Components

type ConnectFn = ReturnType<NonNullable<ConnectorClient['useConnectHook']>>

function wrapConnectorClientModule(
  mod: ConnectorClient | {default: ConnectorClient},
) {
  const client: ConnectorClient =
    'useConnectHook' in mod ? mod : 'default' in mod ? mod.default : mod

  return React.memo(function ModuleWrapper(props: {
    connector_name?: string
    onConnectFn: (fn?: ConnectFn) => void
  }) {
    console.log('ModuleWrapper rendering', props.connector_name, client)
    const connectFn = client.useConnectHook?.({openDialog: () => {}})
    const {onConnectFn} = props

    React.useEffect(() => {
      if (connectFn) {
        onConnectFn(connectFn)
      }
    }, [onConnectFn, connectFn])

    return null
  })
}

const ConnectorClientComponents = Object.fromEntries(
  Object.entries(clientConnectors).map(([name, importModule]) => [
    name,
    dynamic(() => importModule().then((m) => wrapConnectorClientModule(m)), {
      loading: () => <div>...Loading {name}...</div>,
    }),
  ]),
)

export function makeNativeOauthConnectorClientComponent(preConnectRes: {
  authorization_url: string
  code_verifier?: string
}) {
  // createNativeOauthConnect(preConnectRes)

  return function NativeOauthConnectorClientComponent({
    onConnectFn,
  }: {
    connector_name?: string
    onConnectFn: (fn?: ConnectFn) => void
  }) {
    const connectFn = React.useCallback(
      () =>
        openOAuthPopup(preConnectRes).then((data) => ({
          ...data,
          code_verifier: preConnectRes.code_verifier,
        })),
      [],
    )
    React.useEffect(() => {
      onConnectFn(connectFn)
    }, [onConnectFn, connectFn])

    return null
  }
}

function makeManualConnectorClientComponent(settingsJsonSchema: JSONSchema) {
  return function ManualConnectorClientComponent({
    onConnectFn,
    connector_name,
  }: {
    connector_name?: string
    onConnectFn: (fn?: ConnectFn) => void
  }) {
    const [open, setOpen] = React.useState(false)
    const formRef = React.useRef<JSONSchemaFormRef>(null)

    const deferredRef = React.useRef<Deferred<any> | undefined>(undefined)
    const connectFn = React.useCallback(
      (() => {
        setOpen(true)
        // wait for user to submit form
        const deferred = new Deferred<any>()
        deferredRef.current = deferred
        return deferred.promise
      }) satisfies ConnectFn,
      [],
    )
    React.useEffect(() => {
      onConnectFn(connectFn)
    }, [onConnectFn, connectFn])

    return (
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen && deferredRef.current) {
            deferredRef.current.reject(new Error('Dialog closed'))
            deferredRef.current = undefined
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {connector_name}</DialogTitle>
          </DialogHeader>
          <JSONSchemaForm
            ref={formRef}
            jsonSchema={settingsJsonSchema}
            onSubmit={({formData}) => {
              deferredRef.current?.resolve(formData)
              deferredRef.current = undefined
              setOpen(false)
            }}
          />
          <DialogFooter>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              onClick={() => {
                formRef.current?.submit()
              }}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
}

// MARK: -

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

  console.log('AddConnectionInner rendering', name, connectorConfig)

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
  console.log('preConnectRes', preConnectRes)

  const queryClient = useQueryClient()

  const postConnect = useMutation(
    trpc.postConnect.mutationOptions({
      onSuccess: () => {},
      onSettled: () => {},
    }),
  )

  const [, setSearchParams] = useMutableSearchParams()

  const handleConnect = React.useCallback(async () => {
    try {
      setIsConnecting(true)
      console.log('ref.current', ref.current)
      const connectRes = await ref.current?.(preConnectRes.data.connect_input, {
        connectorConfigId: connectorConfig.id as `ccfg_${string}`,
        connectionExternalId: undefined,
        integrationExternalId: undefined,
      })
      console.log('connectRes', connectRes)
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

      console.log('postConnectRes', postConnectRes)

      // None of this is working, why!!!
      void queryClient.invalidateQueries({
        queryKey: trpc.listConnections.queryKey({
          connector_names: [name],
          expand: ['connector'],
        }),
      })
      void queryClient.invalidateQueries({
        queryKey: trpc.listConnections.queryKey({
          expand: ['connector'],
        }),
      })
      void queryClient.invalidateQueries()
      // Really terrible
      toast.success('Connection created', {
        description: `Connection ${postConnectRes.id} created`,
      })
      // This is the only way that works for now...
      // TODO: Fix this madness
      setSearchParams({view: 'manage'}, {shallow: false})
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

export function MyConnectionsClient(props: {
  connector_names?: ConnectorName[]
  initialData?: AppRouterOutput['listConnections']
}) {
  const [_, setSearchParams] = useMutableSearchParams()
  const [isLoading, setIsLoading] = React.useState(true)
  const trpc = useTRPC()

  React.useEffect(() => {
    setIsLoading(false)
  }, [])

  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {
        connector_names: props.connector_names?.length
          ? props.connector_names
          : undefined,
        expand: ['connector'],
      },
      props.initialData ? {initialData: props.initialData} : undefined,
    ),
  )

  const definitions = useCommandDefinitionMap()

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!res.data?.items?.length || res.data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-muted-foreground">
          You have no configured integrations.
        </p>
        <Button
          variant="default"
          onClick={() => setSearchParams({view: 'add'}, {shallow: true})}>
          Add your first integration
        </Button>
      </div>
    )
  }

  return (
    <DataTileView
      data={res.data.items}
      columns={[]}
      getItemId={(conn) => conn.id}
      renderItem={(conn) => (
        <ConnectionCard connection={conn} className="relative">
          <CommandPopover
            className="absolute right-2 top-2"
            hideGroupHeadings
            initialParams={{
              connection_id: conn.id,
            }}
            ctx={{}}
            definitions={definitions}
          />
        </ConnectionCard>
      )}
    />
  )
}
