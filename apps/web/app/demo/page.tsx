'use client'

import 'next/image'
// tailwind.css file will be built separately
// eslint-disable-next-line import/no-unresolved
import '../tailwind-v3.css'
import {useSearchParams} from 'next/navigation'
import {Suspense} from 'react'
import {OpenIntConnectEmbed} from '@openint/connect'

function DemoInner() {
  const params = useSearchParams()
  const token = params?.get('token')
  return (
    <div className="flex h-screen w-screen flex-col">
      {token ? (
        <OpenIntConnectEmbed
          className="flex-1"
          params={{token}}
          baseUrl={null}
        />
      ) : (
        <p>
          Please pass a valid OpenInt connect token in the url as query param
          `?token=`
        </p>
      )}
    </div>
  )
}

export default function Demo() {
  return (
    <Suspense>
      <DemoInner />
    </Suspense>
  )
}
