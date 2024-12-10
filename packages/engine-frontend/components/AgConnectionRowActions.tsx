'use client'

import {RefreshCw} from 'lucide-react'
import type {RouterOutput} from '@openint/engine-backend'
import {useToast, type UIProps} from '@openint/ui'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'
import {
  WithConnectorConnect,
  type ConnectEventType,
} from '../hocs/WithConnectorConnect'
import {useOptionalOpenIntConnectContext} from '../providers/OpenIntConnectProvider'
import {_trpcReact} from '../providers/TRPCProvider'

type Connection = RouterOutput['listConnections'][number]

/**
 * TODO: Add loading indicator when mutations are happening as a result of
 * selecting dropdown menu action
 */
export function AgConnectionRowActions(
  props: UIProps & {
    connectorConfig: ConnectorConfig
    connection: Connection
    onEvent?: (event: {type: ConnectEventType}) => void
  },
) {
  const {toast} = useToast()

  const {debug} = useOptionalOpenIntConnectContext()

  // Add me when we introduce displayName field
  // const updateConnection = trpcReact.updateConnection.useMutation({
  //   onSuccess: () => {
  //     setOpen(false)
  //     toast({title: 'Connection updated', variant: 'success'})
  //   },
  //   onError: (err) => {
  //     toast({
  //       title: 'Failed to save resource',
  //       description: `${err.message}`,
  //       variant: 'destructive',
  //     })
  //   },
  // })

  const ctx = _trpcReact.useContext()
  const deleteConnection = _trpcReact.deleteConnection.useMutation({
    onSuccess: () => {
      toast({title: 'Connection deleted', variant: 'success'})
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete connection',
        description: `${err.message}`,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      ctx.listConnections.invalidate()
    },
  })
  const syncConnection = _trpcReact.dispatch.useMutation({
    onSuccess: () => {
      toast({title: 'Sync requested', variant: 'success'})
    },
    onError: (err) => {
      toast({
        title: 'Failed to start sync',
        description: `${err.message}`,
        variant: 'destructive',
      })
    },
  })
  // Is there a way to build the variables into useMutation already?
  const syncConnectionMutate = () =>
    syncConnection.mutate({
      name: 'sync/connection-requested',
      data: {connectionId: props.connection.id},
    })

  // TODO: Turn this into a menu powered by the command abstraction?
  return (
    // Not necessarily happy that we have to wrap the whole thing here inside
    // WithProviderConnect but also don't know of a better option
    <WithConnectorConnect {...props}>
      {() => (
        <div className="flex flex-row items-center space-x-2">
          {debug && (
            <button
              type="button"
              onClick={(e) => {
                syncConnectionMutate()
                e.preventDefault()
              }}
              className="border-stroke enabled:active:bg-background-mid enabled:active:border-1 focus:border-1 enabled:hover:bg-background-mid disabled:bg-background-mid disabled:border-stroke disabled:text-black-light group inline-flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-lg border bg-white px-3 py-2 hover:border-[#8192FF] disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw className="text-black-light h-5 w-5" />
              <p className="text-sm tracking-[-0.01em] text-[#8192FF] antialiased">
                Update
              </p>
            </button>
          )}
          <button
            type="button"
            onClick={() => deleteConnection.mutate({id: props.connection.id})}
            className="border-stroke enabled:active:bg-background-mid enabled:active:border-1 focus:border-1 enabled:hover:bg-background-mid disabled:bg-background-mid disabled:border-stroke disabled:text-black-light group inline-flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-lg border bg-white px-3 py-2 hover:border-[#8192FF] disabled:cursor-not-allowed disabled:opacity-50">
            <RefreshCw className="text-black-light h-5 w-5" />
            <p className="text-sm tracking-[-0.01em] text-[#8192FF] antialiased">
              Disconnect
            </p>
          </button>
        </div>
      )}
    </WithConnectorConnect>
  )
}
