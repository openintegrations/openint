'use client'

import React from 'react'
import {ZodSchemaForm} from '@openint/ui-v1/components/schema-form/SchemaForm'
import {extendZodWithOpenApi, z} from '@openint/util'


extendZodWithOpenApi(z)

export default function MagicLinkPage() {
  const schema = z.object({
    connector_name: z
      .string()
      .optional()
      .describe(
        'The name of the connector configuration to use. Default to all otherwise',
      ),
    tab: z.enum(['my-connections', 'add-connection']).optional().openapi({
      title: 'Default Tab',
      description:
        'The default tab to show when the magic link is opened. Defaults to "my-connections"',
    }),
  })
  const [data, setData] = React.useState<z.infer<typeof schema>>({})

  const iframeUrl = new URL('/connect-v1', window.location.origin)
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      iframeUrl.searchParams.append(key, String(value))
    }
  }
  console.log('iframeUrl', iframeUrl.toString())

  return (
    <div className="flex h-full flex-col">
      <h1>Magic Link</h1>
      <ZodSchemaForm
        schema={schema}
        onChange={(change) => {
          // console.log('change', change)
          setData(change.formData ?? {})
        }}
      />

      <iframe
        title="connect embed"
        src={iframeUrl.toString()}
        className="flex-1"
      />
    </div>
  )
}
