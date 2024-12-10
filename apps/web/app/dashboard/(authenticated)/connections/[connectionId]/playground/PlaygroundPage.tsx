'use client'

import '@stoplight/elements/styles.min.css'
import {API as StoplightElements} from '@stoplight/elements'
import React from 'react'
// this pollutes the global CSS space

import type {Id, OpenApiSpec} from '@openint/cdk'
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink} from '@openint/ui'

export function PlaygroundPage({
  apikey,
  connectionId,
  oas,
}: {
  connectionId: Id['conn']
  apikey: string
  oas: OpenApiSpec
}) {
  React.useEffect(() => {
    const customFetch: typeof fetch = async (input, init) => {
      console.log('will make request', input, init)
      // Remove the baseUrl component from path
      let path = input as string
      for (const server of oas.servers ?? []) {
        path = path.replace(server.url, '')
      }
      return fetch('/api/proxy' + path, {
        ...init,
        headers: {
          ...init?.headers,
          // Make it even more custom
          'x-apikey': apikey,
          'x-connection-id': connectionId,
        },
      })
    }
    ;(globalThis as any)._stoplight_fetch = customFetch
  }, [apikey, oas.servers, connectionId])
  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className="elements-container h-full">
      <Breadcrumb className="p-4">
        <BreadcrumbItem>
          {/* We need typed routes... https://github.com/shadcn/ui/pull/133 */}
          <BreadcrumbLink href="/dashboard/connections">
            Connections
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{connectionId}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            // TODO: Get typecheck to catch bad routes
            href={`/dashboard/connections/${connectionId}/playground`}>
            Playground
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <StoplightElements
        apiDescriptionDocument={oas as object}
        router="hash"
        // We have to use this because adding search to pathPath does not work
        // as it gets escaped... with include policy the proxy will use the
        // cookie to authenticate us before passing it on
        tryItCredentialsPolicy="include"
      />
    </div>
  )
}
