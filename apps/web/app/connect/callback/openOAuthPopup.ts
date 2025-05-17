import {getBaseURLs} from '@openint/env'

export interface OAuthConnectConfig {
  // connectorName: string
  // authType: 'OAUTH2' | 'OAUTH1' | 'OAUTH2CC'
  authorization_url: string // From preConnect
  connectionId?: string
}

export interface OAuthConnectResult {
  code: string
  state: string
}

export interface OAuthError extends Error {
  type: 'popup_closed' | 'auth_error' | 'network_error'
  details?: any
}

export async function openOAuthPopup(
  config: OAuthConnectConfig,
): Promise<OAuthConnectResult | void> {
  console.log('createNativeOauthConnect', config)
  if (!config.authorization_url) {
    throw createOAuthError('auth_error', 'No authorization URL provided')
  }
  let activePopup: Window | null = null

  function closePopup() {
    if (activePopup && !activePopup.closed) {
      activePopup.close()
    }
    activePopup = null
  }

  // Clean up any existing popups
  closePopup()

  function isPopupDead(win: Window | null) {
    if (!win) {
      console.log('Popup is dead: No window handle')
      return true // no handle at all
    }
    if (win.closed) {
      // could be real closed—or COOP lied—
      // fall through to a more reliable test
    }

    try {
      // If it's still on your origin (after redirect back),
      // this succeeds → definitely alive.
      // If it's on the provider's origin, this throws a SecurityError → still alive.
      void win.location.href
      return false
    } catch (err: unknown) {
      // err.name === "SecurityError" or "PermissionDeniedError"
      //   → cross-origin navigation, so still alive
      if (
        err instanceof Error &&
        (err.name === 'SecurityError' || err.name === 'PermissionDeniedError')
      ) {
        // console.log('Popup caught error:', {win, err})
        return false
      }
      // any other error (e.g. "InvalidStateError") means the window is truly closed
      console.log('Popup is dead: Unexpected error', err)
      return true
    }
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Calculate popup dimensions with screen size constraints
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      const width = Math.min(500, screenWidth)
      const height = Math.min(600, screenHeight)
      const left = Math.max(screenWidth / 2 - width / 2, 0)
      const top = Math.max(screenHeight / 2 - height / 2, 0)

      const url =
        getBaseURLs(null).connect +
        '/navigate' +
        '?connector_name=Provider' + // TODO: make dynamic
        '&navigate_to=' +
        btoa(config.authorization_url)

      console.log('Opening OAuth popup window', url)
      // Open popup with more complete window features
      activePopup = window.open(
        url,
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},` +
          `scrollbars=yes,resizable=yes,status=no,toolbar=no,` +
          `location=no,copyhistory=no,menubar=no,directories=no`,
      )

      if (
        !activePopup ||
        activePopup.closed ||
        typeof activePopup.closed == 'undefined'
      ) {
        console.log(
          'Popup was blocked by browser. Please enable pop-ups for this site to use OAuth.',
        )
        // throw createOAuthError(
        //   'popup_closed',
        //   'Pop-up was blocked by browser. Please enable pop-ups for this site to use OAuth.',
        // )
      }

      console.log('Opening OAuth popup window', {
        url: config.authorization_url,
        dimensions: {
          width,
          height,
          left,
          top,
        },
      })

      if (!activePopup) {
        throw createOAuthError(
          'popup_closed',
          'Pop-up was blocked by browser. Please enable pop-ups for this site to use OAuth.',
        )
      }

      // initial delay to allow popup window to load
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Handle popup being closed
      const popupTimer = setInterval(() => {
        if (isPopupDead(activePopup)) {
          clearInterval(popupTimer)
          return
        }

        // Check if popup was closed - this works across domains
        // The 'closed' property is one of the few that can be accessed cross-origin
        // if (activePopup.closed) {
        //   console.log('Popup was closed by user')
        //   clearInterval(popupTimer)
        //   reject(
        //     createOAuthError(
        //       'popup_closed',
        //       'User closed the authentication popup',
        //     ),
        //   )
        //   return
        // }

        try {
          // if its in our domain after 50ms then close the window
          // this may throw if we're blocked by not being in our own domain
          if (isPopupDead(activePopup)) {
            console.log('closing popup as ')
            clearInterval(popupTimer)
            resolve()
            closePopup()
          }
        } catch (e) {
          console.log('error checking popup', e)
          // If even this fails due to COOP, we'll rely solely on the message event
        }
      }, 100)

      console.log('adding message event listener')
    } catch (err) {
      closePopup()
      reject(createOAuthError('network_error', err))
    }
  })
}

function createOAuthError(type: OAuthError['type'], details?: any): OAuthError {
  const error = new Error('OAuth error: ' + type + ' ' + details) as OAuthError
  error.type = type
  error.details = details
  return error
}
