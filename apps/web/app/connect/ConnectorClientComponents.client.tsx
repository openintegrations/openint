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

export function makeManualConnectorClientComponent(
  settingsJsonSchema: JSONSchema,
) {
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
        {/* Leave z-20 here to ensure it shows when ConnectOpWrapper blurs the background */}
        <DialogContent className="z-20">
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
