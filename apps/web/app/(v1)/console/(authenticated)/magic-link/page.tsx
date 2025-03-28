'use client'

import React from 'react'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form/SchemaForm'
import type {ConnectV1SearchParams} from '@/app/(v1)/connect-v1/types'
import {zConnectV1SearchParams} from '@/app/(v1)/connect-v1/types'

export default function MagicLinkPage() {
  const [data, setData] = React.useState<ConnectV1SearchParams>({})

  const iframeUrl = new URL('/connect-v1', window.location.origin)
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      iframeUrl.searchParams.append(key, String(value))
    }
  }
  console.log('iframeUrl', iframeUrl.toString())

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-3xl mb-4">Magic Link</h1>
      <div className="flex flex-1 gap-4">
        <div>
          <h2 className="text-2xl">Configure</h2>
          <ZodSchemaForm
            className="w-sm"
            schema={zConnectV1SearchParams}
            onChange={(change) => {
              // console.log('change', change)
              setData(change.formData ?? {})
            }}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <h2 className="text-2xl">Preview</h2>
          <iframe
            title="connect embed"
            src={iframeUrl.toString()}
            className="flex-1 border p-4"
          />
        </div>
      </div>
    </div>
  )
}
