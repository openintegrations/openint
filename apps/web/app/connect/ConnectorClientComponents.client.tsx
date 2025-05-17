'use client'

import type {JSONSchemaFormRef} from '@openint/ui-v1'

import dynamic from 'next/dynamic'
import React from 'react'
import {clientConnectors} from '@openint/all-connectors/connectors.client'
import {type ConnectorClient, type JSONSchema} from '@openint/cdk'
import {Button} from '@openint/shadcn/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@openint/shadcn/ui/dialog'
import {JSONSchemaForm} from '@openint/ui-v1'
import {Deferred} from '@openint/util/promise-utils'
import {openOAuthPopup} from './callback/openOAuthPopup'

// MARK: - Connector Client Components

export type ConnectFn = ReturnType<
  NonNullable<ConnectorClient['useConnectHook']>
>

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

export const ConnectorClientComponents = Object.fromEntries(
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
  console.log('[OAuth] Creating component with:', preConnectRes)

  if (!preConnectRes.authorization_url) {
    console.error(
      '[OAuth] Missing authorization_url in connect_input',
      preConnectRes,
    )
  }

  return function NativeOauthConnectorClientComponent({
    onConnectFn,
    connector_name,
  }: {
    connector_name?: string
    onConnectFn: (fn?: ConnectFn) => void
  }) {
    console.log('[OAuth] Component rendering for', connector_name)

    // Create the connect function that opens the OAuth popup
    const connectFn = React.useCallback(() => {
      console.log('[OAuth] Opening OAuth popup with:', preConnectRes)
      return openOAuthPopup(preConnectRes).then((data) => {
        console.log('[OAuth] OAuth flow completed with:', data)
        return {
          ...data,
          code_verifier: preConnectRes.code_verifier,
        }
      })
    }, [])

    // Register the connect function as soon as the component mounts
    React.useEffect(() => {
      console.log('[OAuth] Registering connect function')
      onConnectFn(connectFn)
    }, [onConnectFn, connectFn])

    return null // OAuth doesn't need to render UI
  }
}

export function makeManualConnectorClientComponent(
  settingsJsonSchema: JSONSchema,
) {
  console.log('[Manual] Creating component with schema')

  return function ManualConnectorClientComponent({
    onConnectFn,
    connector_name,
  }: {
    connector_name?: string
    onConnectFn: (fn?: ConnectFn) => void
  }) {
    console.log('[Manual] Component rendering for', connector_name)
    const [open, setOpen] = React.useState(true) // Start with dialog open
    const formRef = React.useRef<JSONSchemaFormRef>(null)
    const deferredRef = React.useRef<Deferred<any> | undefined>(undefined)

    // Create the connect function that shows the dialog
    const connectFn = React.useCallback(() => {
      console.log('[Manual] Showing dialog form')
      setOpen(true)

      // Create a deferred promise that will be resolved when the form is submitted
      const deferred = new Deferred<any>()
      deferredRef.current = deferred
      return deferred.promise
    }, [])

    // Register the connect function as soon as the component mounts
    React.useEffect(() => {
      console.log('[Manual] Registering connect function')
      onConnectFn(connectFn)
    }, [onConnectFn, connectFn])

    return (
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          console.log('[Manual] Dialog open state changing to:', newOpen)
          if (!newOpen && deferredRef.current) {
            // User is closing dialog without submitting
            deferredRef.current.reject(new Error('Dialog closed'))
            deferredRef.current = undefined
          }
          setOpen(newOpen)
        }}>
        <DialogContent
          className="sm:max-w-[500px]"
          // Prevent closing with escape key or clicking outside
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Configure {connector_name}</DialogTitle>
          </DialogHeader>

          <JSONSchemaForm
            formRef={formRef}
            jsonSchema={settingsJsonSchema}
            onSubmit={({formData}) => {
              console.log('[Manual] Form submitted with data:', formData)
              if (deferredRef.current) {
                deferredRef.current.resolve(formData)
                deferredRef.current = undefined
                setOpen(false)
              }
            }}
          />

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('[Manual] Cancel button clicked')
                if (deferredRef.current) {
                  deferredRef.current.reject(new Error('User cancelled'))
                  deferredRef.current = undefined
                }
                setOpen(false)
              }}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => {
                console.log('[Manual] Submit button clicked')
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
