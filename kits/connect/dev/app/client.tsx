'use client'

import {OpenIntConnectEmbed} from '../../src/embed-react'

interface OpenIntConnectClientProps {
  token: string
  baseUrl: string
}

export function OpenIntConnectClient({
  token,
  baseUrl,
}: OpenIntConnectClientProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <OpenIntConnectEmbed
        baseUrl={baseUrl}
        params={{
          theme: 'light',
          token,
        }}
      />
    </div>
  )
}
