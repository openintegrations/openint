export interface OAuthConnectConfig {
  connectorName: string
  authType: 'OAUTH2' | 'OAUTH1' | 'OAUTH2CC'
  authorizationUrl: string // From preConnect
  connectionId?: string
}

export interface OAuthConnectResult {
  code: string
  state: string
  connectionId: string
}

export interface OAuthError extends Error {
  type: 'popup_closed' | 'auth_error' | 'network_error'
  details?: any
}

export default async function createNativeOauthConnect(
  config: OAuthConnectConfig,
): Promise<OAuthConnectResult> {
  let activePopup: Window | null = null
  let activeListener: ((e: MessageEvent) => void) | null = null

  function closePopup() {
    if (activePopup && !activePopup.closed) {
      activePopup.close()
    }
    if (activeListener) {
      window.removeEventListener('message', activeListener)
    }
    activePopup = null
    activeListener = null
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
        config.authorizationUrl,
        'oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},` +
          `scrollbars=yes,resizable=yes,status=no,toolbar=no,` +
          `location=no,copyhistory=no,menubar=no,directories=no`,
      )

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
          if (activePopup.opener === null) {
            clearInterval(popupTimer)
            reject(createOAuthError('popup_closed', 'Popup was closed'))
            closePopup()
            return
          }
        } catch (e) {
          // If even this fails due to COOP, we'll rely solely on the message event
        }
      }, 100)

      // Listen for messages from popup
      activeListener = async (event: MessageEvent) => {
        try {
          // console.log('received message', {
          //   data: event.data,
          //   origin: event.origin,
          //   source: event.source === activePopup ? 'popup' : 'other',
          // })
          // Verify message is from our popup window
          if (event.source !== activePopup) {
            return
          }

          // console.log('activeListener', event.data)
          // Parse the response from the popup
          const response = parseAuthResponse(event.data)

          if (response.error) {
            throw createOAuthError('auth_error', response.error)
          }

          // Validate response has required fields
          if (!response.code || !response.state) {
            throw createOAuthError(
              'auth_error',
              'Invalid response from authorization server',
            )
          }

          // Clear interval and cleanup
          clearInterval(popupTimer)
          closePopup()

          const parsedConnectionId = decodeURIComponent(
            window.atob(response.state.replace(/-/g, '+').replace(/_/g, '/')),
          )

          if (
            !parsedConnectionId.startsWith('conn_') ||
            (config.connectionId && parsedConnectionId !== config.connectionId)
          ) {
            // note: should this be here?
            throw createOAuthError(
              'auth_error',
              `Invalid connection id: raw=${response.state} parsed=${parsedConnectionId} config=${config.connectionId}`,
            )
          }

          // console.log('resolving oauth promise', {
          //   code: response.code,
          //   state: response.state,
          //   connectionId: parsedConnectionId,
          // })
          // Return the authorization response
          resolve({
            code: response.code,
            state: response.state,
            connectionId: parsedConnectionId,
          })
        } catch (err) {
          clearInterval(popupTimer)
          closePopup()
          reject(err)
        }
      }

      window.addEventListener('message', activeListener)
    } catch (err) {
      closePopup()
      reject(createOAuthError('network_error', err))
    }
  })
}

// Helper Functions
function parseAuthResponse(data: any): {
  code?: string
  state?: string
  error?: string
} {
  // If data is already an object with code and state, return it
  if (data && typeof data === 'object' && 'code' in data && 'state' in data) {
    return data
  }

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      // Handle URL-encoded responses
      const params = new URLSearchParams(data)
      return Object.fromEntries(params.entries())
    }
  }

  // Check for error
  if (data.error) {
    return {error: data.error}
  }

  // Return authorization response
  return {
    code: data.code,
    state: data.state,
  }
}

function createOAuthError(type: OAuthError['type'], details?: any): OAuthError {
  const error = new Error('OAuth error: ' + type + ' ' + details) as OAuthError
  error.type = type
  error.details = details
  return error
}
