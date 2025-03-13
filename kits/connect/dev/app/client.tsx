'use client'

import {GetIFrameProps} from '../../src/common'
import {OpenIntConnectEmbed} from '../../src/embed-react'
import {OpenIntFrontend} from '../../src/popup'

export function OpenIntConnectClient({
  baseUrl,
  params,
}: {
  baseUrl: string
  params: GetIFrameProps['params']
}) {
  OpenIntFrontend.listenConnectEvents((event) => {
    console.log('event3', event)
  })
  return (
    <div className="overflow-hidden rounded-lg border">
      <OpenIntConnectEmbed
        baseUrl={baseUrl}
        params={params}
        width={700}
        height={700}
      />
    </div>
  )
}
