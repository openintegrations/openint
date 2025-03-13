import {OpenIntConnectClient} from './client'

const BASE_URL = 'https://local.openint.dev/api/v0'
async function getConnectToken() {
  // Replace SDK initialization and API calls with fetch
  const headers = {
    'Content-Type': 'application/json',
    'x-apikey': process.env['NEXT_PUBLIC_OPENINT_API_KEY'] ?? '',
    'x-connection-customer-id': 'END_USER_ID',
  }

  console.log('headers', headers)

  const tokenResponse = await fetch(`${BASE_URL}/connect/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({customerId: 'END_USER_ID'}),
  })
    .then((res) => res.json())
    .catch((error: Error) => {
      console.error('Error fetching token:', error)
      return {token: null}
    })
  console.log('tokenResponse', tokenResponse)
  return {token: tokenResponse?.token ?? null}
}

export default async function Home() {
  const {token} = await getConnectToken()

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">OpenInt Connect Demo</h1>
      <OpenIntConnectClient
        baseUrl={BASE_URL.split('/api/v0')[0] + ''}
        params={{
          token,
        }}
      />
    </main>
  )
}
