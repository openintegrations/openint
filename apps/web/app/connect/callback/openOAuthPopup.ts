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
): Promise<OAuthConnectResult> {
  console.log('createNativeOauthConnect', config)
  if (!config.authorization_url) {
    throw createOAuthError('auth_error', 'No authorization URL provided')
  }
  let activePopup: Window | null = null
  let activeListener: ((e: MessageEvent) => void) | null = null
  let broadcastChannel: BroadcastChannel | null = null

  function closePopup() {
    if (activePopup && !activePopup.closed) {
      activePopup.close()
    }
    if (activeListener) {
      console.log('Removing message event listener')
      window.removeEventListener('message', activeListener)
    }
    if (broadcastChannel) {
      console.log('Closing broadcast channel')
      broadcastChannel.close()
    }
    activePopup = null
    activeListener = null
    broadcastChannel = null
  }

  // Clean up any existing popups
  closePopup()

  return new Promise((resolve, reject) => {
    try {
      // Create broadcast channel
      broadcastChannel = new BroadcastChannel('oauth-channel')

      // Listen for messages from any tab
      broadcastChannel.addEventListener('message', (event) => {
        if (event.data.type === 'oauth_complete') {
          clearInterval(popupTimer)
          closePopup()
          resolve({
            code: event.data.data.code,
            state: event.data.data.state,
          })
        } else if (event.data.type === 'oauth_error') {
          clearInterval(popupTimer)
          closePopup()
          reject(createOAuthError('auth_error', event.data.data.error))
        }
      })

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
          // It is impossible to know when a pop-up has definitively closed due to browser security policy.
          // In pratice as of 2025-05-11_0243 popup closure detection works with github but reports premature closure
          // linear, likely due to different content-security policies.
          // It is better to have false negative where the pop-up has closed
          // but we don't know about it rather than false negative where it breaks
          // the whole OAuth flow because we assume it has terminated.
          // therefore we are being extremely defensive here and only take into account popup closure
          // while on our own domains.
          // TODO: Add a UX for when oauth is in progress but we don't know whether popup has been closed or not.
          if (activePopup.closed && activePopup.location.href) {
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      activeListener = async (event: MessageEvent) => {
        try {
          console.log('received message', {
            data: event.data,
            origin: event.origin,
            source: event.source === activePopup ? 'popup' : 'other',
          })
          // Verify message is from our popup window
          if (event.source !== activePopup) {
            return
          }

          // Parse the response from the popup
          const response = parseAuthResponse(event.data)

          if (response.error) {
            throw createOAuthError('auth_error', response.error)
          }

          // Validate response has required fields
          if (!response.code || !response.state) {
            console.error('Invalid response from authorization server', event)
            throw createOAuthError(
              'auth_error',
              'Invalid response from authorization server',
            )
          }

          // Clear interval and cleanup
          clearInterval(popupTimer)
          closePopup()

          // Return the authorization response
          resolve({
            code: response.code,
            state: response.state,
          })
        } catch (err) {
          clearInterval(popupTimer)
          closePopup()
          reject(err)
        }
      }

      console.log('adding message event listener')
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
