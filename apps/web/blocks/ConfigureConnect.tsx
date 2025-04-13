'use client'

import type {Z} from '@openint/util/zod-utils'

import React from 'react'
import {connectRouterModels} from '@openint/api-v1/routers/connect.models'
import {ConnectEmbed} from '@openint/connect'
import {getBaseURLs} from '@openint/env'
import {PreviewWindow} from '@openint/ui-v1/components/PreviewWindow'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form'
import {useMutation} from '@/lib-client/trpc.client'
import {createURL} from '@openint/util/url-utils'
import {useTRPC} from '@/lib-client/trpc.client'

// Define the type for the form data based on the schema
type CreateTokenInput = Z.infer<typeof connectRouterModels.createTokenInput>

export function ConfigureConnect() {
  // Initialize with default values from the schema
  const [formData, setFormData] = React.useState<CreateTokenInput>({
    customer_id: 'cust_123' as any, // Using type assertion for the branded type
    validity_in_seconds: 2592000,
    connect_options: {
      connector_names: [],
    },
  })

  const trpc = useTRPC()
  const mutation = useMutation(trpc.createToken.mutationOptions())

  React.useEffect(() => {
    mutation.mutate(formData)
  }, [formData])

  return (
    <div className="flex max-h-full flex-1 gap-4">
      {/* Schema Form on the left */}
      <div className="w-sm flex min-h-0 flex-col p-4 pr-2">
        <h2 className="mb-4 text-xl font-semibold">Configure</h2>
        <ZodSchemaForm
          schema={connectRouterModels.getMagicLinkInput}
          formData={formData}
          onChange={(change) => {
            if (change.formData) {
              setFormData(change.formData)
            }
          }}
        />
      </div>

      {/* Preview Window on the right */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="mb-4 text-xl font-semibold">Preview</h2>
        <PreviewWindow
          // TODO: Refactor connect to return the URL please
          shareUrl={createURL(getBaseURLs(null).connect, {
            searchParams: {token: mutation.data?.token ?? ''},
          })}
          className="flex-1 overflow-scroll">
          {mutation.data?.token && (
            <ConnectEmbed
              className="h-full w-full"
              token={mutation.data?.token}
              baseURL={getBaseURLs(null).connect}
            />
          )}
          {/* <iframe src={mutation.data?.token} className="h-full w-full" /> */}
          {/* <div className="bg-muted/50 flex h-full items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Connect Preview</h1>
              <p className="text-muted-foreground mt-2">
                This is a preview of the connect page with the following
                configuration:
              </p>
              <pre className="mt-4 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-left text-xs">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div> */}
        </PreviewWindow>
      </div>
    </div>
  )
}
