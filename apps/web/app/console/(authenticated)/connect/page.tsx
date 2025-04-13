import {Suspense} from 'react'
import {ConfigureConnect} from './ConfigureConnect'

function Fallback() {
  return <div>Loading...</div>
}

export default function ConnectPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ConfigureConnect />
    </Suspense>
  )
}
