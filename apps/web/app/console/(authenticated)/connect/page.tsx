import {Suspense} from 'react'
import {ConfigureConnect} from './page.client'

function Fallback() {
  return <div>Loading...</div>
}

export default function ConsoleConnectPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ConfigureConnect />
    </Suspense>
  )
}
