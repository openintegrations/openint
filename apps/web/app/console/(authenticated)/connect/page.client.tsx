'use client'

import type {Z} from '@openint/util/zod-utils'

import {useTRPC} from '@/lib-client/TRPCApp'
import {connectRouterModels} from '@openint/api-v1/trpc/routers/connect.models'
import {CustomerId} from '@openint/cdk'
import {ConnectEmbed} from '@openint/connect'
import {getBaseURLs} from '@openint/env'
import {Spinner} from '@openint/ui-v1'
import {PreviewWindow} from '@openint/ui-v1/components/PreviewWindow'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form'
import {createURL} from '@openint/util/url-utils'
import {useQuery} from '@tanstack/react-query'
import React from 'react'

// Define the type for the form data based on the schema
type CreateTokenInput = Z.infer<typeof connectRouterModels.createTokenInput>

export function ConfigureConnect() {
  // Initialize with default values from the schema
  const [formData, setFormData] = React.useState<CreateTokenInput>({
    customer_id: 'cust_123' as CustomerId,
    validity_in_seconds: 2592000,
    connect_options: {
      connector_names: [],
    },
  })

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
        <ConnectEmbedPreview createTokenInput={formData} />
      </div>
    </div>
  )
}

export function ConnectEmbedPreview(props: {
  createTokenInput: CreateTokenInput
}) {
  const trpc = useTRPC()
  // No reason to use useSuspenseQuery here because it's actually a bit more stragiht
  // forward to useQuery to manage the loading and error state more explicit
  const tokenRes = useQuery(
    trpc.createToken.queryOptions(props.createTokenInput),
  )

  return (
    <PreviewWindow
      // TODO: Refactor connect to return the URL please
      shareUrl={createURL(
        getBaseURLs(null).connect,
        tokenRes.data
          ? {searchParams: {token: tokenRes.data?.token ?? ''}}
          : {},
      )}
      className="flex-1 overflow-scroll">
      {tokenRes.status === 'pending' ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <Spinner />
        </div>
      ) : tokenRes.status === 'error' ? (
        // TODO: Show a better error message
        <div>Error {tokenRes.error.message}</div>
      ) : (
        <ConnectEmbed
          className="h-full w-full"
          token={tokenRes.data.token}
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
  )
}
