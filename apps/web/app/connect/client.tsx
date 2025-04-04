'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import {clientConnectors} from '@openint/all-connectors/connectors.client'
import {AppRouterOutput} from '@openint/api-v1'
import {ConnectorConfig} from '@openint/api-v1/models'
import type {ConnectorClient, JSONSchema} from '@openint/cdk'
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
  JSONSchemaFormRef,
  useMutableSearchParams,
} from '@openint/ui-v1'
import {ConnectionCard} from '@openint/ui-v1/domain-components/ConnectionCard'
import {ConnectorConfigCard} from '@openint/ui-v1/domain-components/ConnectorConfigCard'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@openint/ui-v1/trpc'
import {Deferred} from '@openint/util/promise-utils'
import {useTRPC} from '../console/(authenticated)/client'
import {useCommandDefinitionMap} from '../GlobalCommandBarProvider'

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

  const name = connectorConfig.connector_name

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
        id: connectorConfig.id,
        data: {
          connector_name: name,
          input: {},
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
      console.log('ref.current', ref.current)
      const connectRes = await ref.current?.(preConnectRes.data.output, {
        connectorConfigId: connectorConfig.id as `ccfg_${string}`,
        connectionExternalId: undefined,
        integrationExternalId: undefined,
      })
      console.log('connectRes', connectRes)
      const postConnectRes = await postConnect.mutateAsync({
        id: connectorConfig.id,
        data: {
          connector_name: name,
          input: connectRes,
        },
        options: {},
      })
      console.log('postConnectRes', postConnectRes)

      // None of this is working, why!!!
      void queryClient.invalidateQueries({
        queryKey: trpc.listConnections.queryKey({
          connector_name: name,
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
      setSearchParams({tab: 'my-connections'}, {shallow: false})
    } catch (error) {
      console.error('Error connecting', error)
      toast.error('Error connecting', {
        description: `${error}`,
      })
    }
  }, [connectorConfig, preConnectRes])

  let Component =
    ConnectorClientComponents[name as keyof typeof ConnectorClientComponents]

  if (!Component) {
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
          Connect
        </Label>
      </ConnectorConfigCard>
    </>
  )
}

export function MyConnectionsClient(props: {
  connector_name?: string
  initialData?: Promise<AppRouterOutput['listConnections']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))
  const trpc = useTRPC()
  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {connector_name: props.connector_name, expand: ['connector']},
      initialData ? {initialData} : undefined,
    ),
  )

  const definitions = useCommandDefinitionMap()
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
