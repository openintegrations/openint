'use client'

import {ArrowLeft, ArrowRight, RefreshCw} from 'lucide-react'
import React from 'react'
import {Button} from '@openint/shadcn/ui/button'
import {Input} from '@openint/shadcn/ui/input'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form/SchemaForm'
import type {ConnectV1SearchParams} from '@/app/connect/types'
import {zConnectV1SearchParams} from '@/app/connect/types'

export default function MagicLinkPage() {
  const [data, setData] = React.useState<ConnectV1SearchParams>({})

  const iframeUrl = new URL('/connect', window.location.origin)
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      iframeUrl.searchParams.append(key, String(value))
    }
  }
  console.log('iframeUrl', iframeUrl.toString())

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-4 text-3xl">Magic Link</h1>
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
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-lg border shadow-lg">
            <div className="flex items-center gap-2 border-b bg-gray-100 p-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <form className="flex flex-grow gap-2">
                <Input
                  type="text"
                  value={iframeUrl.toString()}
                  placeholder="Enter URL"
                  className="flex-grow"
                />
                <Button type="submit">Go</Button>
              </form>
            </div>
            <div className="aspect-video w-full">
              <iframe
                title="connect embed"
                src={iframeUrl.toString()}
                className="h-full w-full flex-1 border border-none p-4"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
