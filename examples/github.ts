import {Octokit} from 'octokit'

const OPENINT_TOKEN = process.env['OPENINT_TOKEN']

export async function getGithubAccessToken() {
  if (!OPENINT_TOKEN) {
    throw new Error('OPENINT_TOKEN is required')
  }
  const res = await fetch(
    'https://api.openint.dev/v1/connection?connector_names=github&include_secrets=true',
    {headers: {Authorization: `Bearer ${OPENINT_TOKEN}`}},
  )
  const data = await res.json()
  const accessToken = data.items[0].settings.access_token
  if (!accessToken) {
    throw new Error('Github not connected')
  }
  return accessToken
}

export async function getGithubClient() {
  const accessToken = await getGithubAccessToken()
  return new Octokit({auth: accessToken})
}

if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    const client = await getGithubClient()
    const response = await client.request('GET /user')
    console.log(response.data)
  }
  main()
}
