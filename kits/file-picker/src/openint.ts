import initOpenIntSDK from '@opensdks/sdk-openint'
import {
  ConnectionDetails,
  FilePickerOptions,
  SelectedFile,
  SharepointConnectionDetails,
} from './types'

let cachedConnectionId: string | null = null
let cachedOpenIntSDK: ReturnType<typeof initOpenIntSDK> | null = null

function getOpenIntSDK(token: string) {
  if (!cachedOpenIntSDK) {
    cachedOpenIntSDK = initOpenIntSDK({
      token,
      // baseUrl: 'https://local.openint.dev/api/v0',
      headers: {
        'x-apikey': undefined,
      },
    })
  }
  return cachedOpenIntSDK
}

function parseMagicLink(magicLink: string): {
  endUserToken: string
  connectionId: string
} & Omit<FilePickerOptions, 'onClose' | 'onSelect' | 'isOpen'> {
  const url = new URL(magicLink)
  const params = url.searchParams
  // Mock link with highlighted parameters:
  // https://local.openint.dev/connect/portal?connection_id=mockConnectionId&token=mockToken&theme=dark&multi_select=true&folder_select=true

  const endUserToken = params.get('token') || ''
  const connectionId = params.get('connection_id') || ''

  // Cache the connectionId
  cachedConnectionId = connectionId

  const filePickerOptions: Omit<
    FilePickerOptions,
    'onClose' | 'onSelect' | 'isOpen'
  > = {
    theme: params.get('theme') as 'light' | 'dark' | undefined,
    multiselect: params.get('multi_select') === 'true',
    folderSelect: params.get('folder_select') === 'true',
    colors: {
      accent: params.get('theme_colors.accent') || undefined,
      background: params.get('theme_colors.background') || undefined,
      border: params.get('theme_colors.border') || undefined,
      button: params.get('theme_colors.button') || undefined,
      buttonLight: params.get('theme_colors.button_light') || undefined,
      buttonForeground:
        params.get('theme_colors.button_foreground') || undefined,
      buttonHover: params.get('theme_colors.button_hover') || undefined,
      buttonStroke: params.get('theme_colors.button_stroke') || undefined,
      buttonSecondary: params.get('theme_colors.button_secondary') || undefined,
      buttonSecondaryForeground:
        params.get('theme_colors.button_secondary_foreground') || undefined,
      buttonSecondaryStroke:
        params.get('theme_colors.button_secondary_stroke') || undefined,
      buttonSecondaryHover:
        params.get('theme_colors.button_secondary_hover') || undefined,
      card: params.get('theme_colors.card') || undefined,
      cardForeground: params.get('theme_colors.card_foreground') || undefined,
      foreground: params.get('theme_colors.foreground') || undefined,
      navbar: params.get('theme_colors.navbar') || undefined,
      primary: params.get('theme_colors.primary') || undefined,
      primaryForeground:
        params.get('theme_colors.primary_foreground') || undefined,
      secondary: params.get('theme_colors.secondary') || undefined,
      secondaryForeground:
        params.get('theme_colors.secondary_foreground') || undefined,
      sidebar: params.get('theme_colors.sidebar') || undefined,
      tab: params.get('theme_colors.tab') || undefined,
    },
  }

  return {
    endUserToken,
    connectionId,
    ...filePickerOptions,
  }
}

export async function fetchOpenIntConnectionDetails(
  openIntFilePickerMagicLink: string,
): Promise<ConnectionDetails> {
  const {endUserToken, connectionId} = parseMagicLink(
    openIntFilePickerMagicLink,
  )
  const openint = getOpenIntSDK(endUserToken)

  const {data: connection} = await openint.GET('/core/connection/{id}', {
    params: {
      path: {
        id: connectionId,
      },
    },
  })

  const name = connection.connectorName + ' (' + connection.integrationId + ')'
  const type =
    connection.integrationId === 'int_microsoft_sharepoint'
      ? 'sharepoint'
      : connection.integrationId === 'int_google_drive'
        ? 'googledrive'
        : null

  const errorStr = (msg: string) =>
    'Connection id ' + connectionId + ' of type ' + name + ' ' + msg

  if (!type) {
    throw new Error(errorStr('is not supported'))
  }

  const accessToken = (
    (connection.settings?.['oauth'] as any)?.['credentials'] as any
  )?.['access_token'] as ConnectionDetails['accessToken']

  if (!accessToken) {
    throw new Error(errorStr('does not have an access token'))
  }

  const accessTokenExpiry = (connection.settings?.['credentials'] as any)?.[
    'expired_at'
  ]

  if (accessTokenExpiry && new Date(accessTokenExpiry) < new Date()) {
    throw new Error(errorStr('is expired'))
  }

  const clientId = connection.settings?.['client_id'] as string
  if (!clientId) {
    throw new Error(
      errorStr(
        'does not have a client id. Please delete and re-add the connection.',
      ),
    )
  }

  switch (type) {
    case 'sharepoint': {
      return {
        type: 'sharepoint',
        accessToken: accessToken,
        clientId: clientId,
      } as SharepointConnectionDetails
    }
    // case 'googledrive':
    //     return {
    //         type: "googledrive",
    //         accessToken: "mock-access-token",
    //     } as GoogleDriveConnectionDetails;
    default:
      throw new Error(
        'The connection of type ' +
          connection.connectorName +
          ' (' +
          connection.integrationId +
          ') does not have an implementation',
      )
  }
}

export async function persistSelectedFilesOnConnection(files: SelectedFile[]) {
  if (!cachedOpenIntSDK || !cachedConnectionId) {
    throw new Error(
      'OpenInt SDK not initialized. Please parse a magic link first.',
    )
  }
  const openint = cachedOpenIntSDK

  await openint.PATCH('/core/connection/{id}', {
    params: {
      path: {
        id: cachedConnectionId,
      },
    },
    body: {
      metadata: {
        files,
      },
    },
  })
}
