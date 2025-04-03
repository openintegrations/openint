import {Suspense} from 'react'
import {ConfigureConnect} from '@/blocks/ConfigureConnect'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {ClientApp} from '../client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function ConnectPage(props: PageProps) {
  const {token = ''} = await currentViewer(props)

  return (
    <ClientApp token={token}>
      <Suspense fallback={<Fallback />}>
        <ConfigureConnect />
      </Suspense>
    </ClientApp>
  )
}
