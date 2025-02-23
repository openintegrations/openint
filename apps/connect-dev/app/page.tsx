'use client'

import {OpenIntConnectEmbed} from '../../../kits/connect/src/embed-react'

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Embed React connect portal</h1>
      <OpenIntConnectEmbed
        baseUrl="http://localhost:4000"
        params={{
          token: process.env['OPENINT_TOKEN'],
          view: 'manage',
          theme: 'dark',
        }}
        height={500}
        width={350}
      />
    </div>
  )
}
