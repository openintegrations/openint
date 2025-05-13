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

  return new Promise((resolve, reject) => {
    try {
      // Calculate popup dimensions with screen size constraints
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      const width = Math.min(500, screenWidth)
      const height = Math.min(600, screenHeight)
      const left = Math.max(screenWidth / 2 - width / 2, 0)
      const top = Math.max(screenHeight / 2 - height / 2, 0)

      // Open popup with more complete window features
      activePopup = window.open(
        config.authorization_url,
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},` +
          `scrollbars=yes,resizable=yes,status=no,toolbar=no,` +
          `location=no,copyhistory=no,menubar=no,directories=no`,
      )
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

      // Handle popup being closed
      const popupTimer = setInterval(() => {
        if (activePopup === null) {
          clearInterval(popupTimer)
          return
        }

        try {
          // if its in our domain after 50ms then close the window
          // this may throw if we're blocked by not being in our own domain
          if (activePopup.location.href) {
            setTimeout(() => {
              clearInterval(popupTimer)
              resolve()
              closePopup()
            }, 50)
          }
        } catch (e) {
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
