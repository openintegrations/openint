'use client'

import React from 'react'
import {connectRouterModels} from '@openint/api-v1/routers/connect.models'
import {PreviewWindow} from '@openint/ui-v1/components/PreviewWindow'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form'
import {useSuspenseQuery} from '@openint/ui-v1/trpc'
import {Z} from '@openint/util/zod-utils'
import {useTRPC} from '@/app/console/(authenticated)/trpc'

// Define the type for the form data based on the schema
type GetMagicLinkInput = Z.infer<typeof connectRouterModels.getMagicLinkInput>

export function ConfigureConnect() {
  // Initialize with default values from the schema
  const [formData, setFormData] = React.useState<GetMagicLinkInput>({
    customer_id: 'cust_123' as any, // Using type assertion for the branded type
    validity_in_seconds: 2592000,
  })

  const trpc = useTRPC()
  const res = useSuspenseQuery(trpc.getMagicLink.queryOptions(formData))

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
          url={res.data.magic_link_url}
          className="flex-1 overflow-scroll">
          <iframe src={res.data.magic_link_url} className="h-full w-full" />
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
