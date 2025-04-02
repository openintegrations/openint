'use client'

import React from 'react'
import {customerRouterModels} from '@openint/api-v1/routers/customer.models'
import {PreviewWindow} from '@openint/ui-v1/components/PreviewWindow'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form'
import {Z} from '@openint/util/zod-utils'

// Define the type for the form data based on the schema
type CreateMagicLinkInput = Z.infer<
  typeof customerRouterModels.createMagicLinkInput
>

export function ConnectPreview() {
  // Initialize with default values from the schema
  const [formData, setFormData] = React.useState<CreateMagicLinkInput>({
    customer_id: 'cust_123' as any, // Using type assertion for the branded type
    validity_in_seconds: 2592000,
  })

  const previewUrl = React.useMemo(() => {
    const url = new URL('/connect', window.location.origin)
    for (const [key, value] of Object.entries(formData.client_options ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, value.toString())
      }
    }

    return url.toString()
  }, [formData])

  return (
    <div className="flex max-h-full flex-1 gap-4">
      {/* Schema Form on the left */}
      <div className="w-sm flex max-h-full min-h-0 flex-col p-4">
        <h2 className="mb-4 text-xl font-semibold">Configure</h2>
        <div className="overflow-scroll">
          <ZodSchemaForm
            schema={customerRouterModels.createMagicLinkInput}
            formData={formData}
            onChange={(change) => {
              if (change.formData) {
                setFormData(change.formData)
              }
            }}
          />
        </div>
      </div>

      {/* Preview Window on the right */}
      <div className="flex flex-1 flex-col overflow-auto p-4">
        <h2 className="mb-4 text-xl font-semibold">Preview</h2>
        <PreviewWindow url={previewUrl} className="flex-1">
          <iframe src={previewUrl} className="h-full w-full" />
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
