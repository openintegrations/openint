import {fetchOpenIntConnectionDetails} from './openint'
import {AuthObject, ConnectionDetails} from './types'

export async function fetchConnectionDetails(
  auth: AuthObject,
): Promise<ConnectionDetails> {
  if (auth.openIntFilePickerMagicLink) {
    return fetchOpenIntConnectionDetails(auth.openIntFilePickerMagicLink)
  } else if (auth.sharepoint) {
    return {
      type: 'sharepoint',
      accessToken: auth.sharepoint.accessToken,
      clientId: auth.sharepoint.clientId,
    }
  } else if (auth.googleDrive) {
    return {
      type: 'googledrive',
      accessToken: auth.googleDrive.accessToken,
      clientId: auth.googleDrive.clientId,
    }
  } else {
    throw new Error('Invalid authentication parameters')
  }
}
