import {
  BrowserAuthError,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser'
import {combine} from '@pnp/core'

let app: PublicClientApplication | null = null

export async function getSharepointToken(
  command: any,
  clientId: string,
): Promise<string> {
  const msalParams = {
    auth: {
      // figure out how to get the tenant id from the sites?
      authority: `https://login.microsoftonline.com/common`,
      clientId,
      redirectUri: window.location.origin,
    },
  }

  if (!app) {
    // console.log('Creating new PublicClientApplication instance');
    app = new PublicClientApplication(msalParams)
    await app.initialize()
  }

  const authParams = {
    scopes: [`${combine(command.resource, '.default')}`],
  }

  try {
    // console.log('Attempting silent token acquisition');
    const response = await app.acquireTokenSilent(authParams)
    // console.log('Silent token acquisition successful');
    return response.accessToken
  } catch (error) {
    // console.log('Silent token acquisition failed', { error });

    if (
      error instanceof InteractionRequiredAuthError ||
      (error instanceof BrowserAuthError &&
        error.errorCode == 'no_account_error')
    ) {
      try {
        // console.log('Attempting popup token acquisition');
        const response = await app.acquireTokenPopup(authParams)
        // console.log('Popup token acquisition successful');
        return response.accessToken
      } catch (popupError) {
        console.error('Popup token acquisition failed', {error: popupError})
        throw popupError
      }
    }
    console.error('Token acquisition failed with unknown error', {error})
    throw error
  }
}
