import initOpenIntSDK from '@opensdks/sdk-openint'
import {Client} from './client'

export default async function Home() {
  // This would be where you do your server-side operations
  // For example, fetching the connection details from your backend
  // const magicLink =
  //   "https://local.openint.dev/connect/portal?connection_id=mockConnectionId&token=mockToken&theme=dark&multi_select=true&folder_select=true";

  // sharepoint in https://openint-git-main-openint-dev.vercel.app/dashboard/connections
  const connectionId = 'conn_microsoft_01JJFFFE5B5WD4JCXQ4P5031F0'

  const openint = initOpenIntSDK({
    apiKey: process.env['OPENINT_API_KEY'] ?? '',
    baseUrl: 'https://local.openint.dev/api/v0',
    // TODO: Check why required
    headers: {
      'x-apikey': process.env['OPENINT_API_KEY'] ?? '',
    },
  })

  const magicLink = await openint.POST('/connect/file-picker', {
    body: {
      connectionId,
    },
  })

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">
        UnifiedFilePicker Development Server
      </h1>
      <Client magicLink={magicLink.data.url} />
    </div>
  )
}
