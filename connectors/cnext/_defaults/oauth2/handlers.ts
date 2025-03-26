import {z} from 'zod'
import {zOAuthConfig} from './def'
import {mapOauthParams, prepareScopes} from './utils'

export const zTokenResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
  expires_at: z.string(), // not in the protocol, we calculate this separately
})

async function makeTokenRequest(
  url: string,
  params: Record<string, string>,
  flowType: 'exchange' | 'refresh',
  // note: we may want to add bodyFormat: form or json
): Promise<z.infer<typeof zTokenResponse>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(params),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Token ${flowType} failed: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  try {
    const json = await response.json()
    return zTokenResponse.parse({
      ...json,
      token_type: json.token_type?.toLowerCase() ?? 'bearer',
      scope: json.scope ?? params['scope'],
      expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid oauth2 ${flowType} token response format: ${error.message}`,
      )
    }
    throw error
  }
}

export const zAuthorizeHandlerArgs = z.object({
  oauthConfig: zOAuthConfig,
  redirectUri: z.string(),
  connectionId: z.string(),
})

export async function authorizeHandler({
  oauthConfig,
  redirectUri,
  connectionId,
}: z.infer<typeof zAuthorizeHandlerArgs>): Promise<{
  authorization_url: string
}> {
  if (!connectionId) {
    throw new Error('No connection_id provided')
  }
  if (!oauthConfig.connector_config?.client_id) {
    throw new Error('No client_id provided')
  }
  if (!oauthConfig.connector_config) {
    console.warn(
      `AuthorizeHandler called with oauthConfig ${JSON.stringify(oauthConfig)}`,
    )
    throw new Error('No connector_config provided')
  }
  const url = new URL(oauthConfig.authorization_request_url)
  console.warn(
    `AuthorizeHandler called with oauthConfig ${JSON.stringify(oauthConfig)}`,
  )
  const params = mapOauthParams(
    {
      client_id: oauthConfig.connector_config.client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      // decoding it as url.toString() encodes it already
      scope: decodeURIComponent(
        prepareScopes(oauthConfig.connector_config.scopes ?? [], oauthConfig),
      ),
      state: Buffer.from(connectionId).toString('base64'),
      ...(oauthConfig.params_config.authorize ?? {}),
    },
    oauthConfig.params_config.param_names ?? {},
  )

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value as string)
  })

  // putting it as %20 for spaces instead of the default encoding of url.toString() which is +
  return {authorization_url: url.toString().replace(/\+/g, '%20')}
}

export const zTokenExchangeHandlerArgs = z.object({
  oauthConfig: zOAuthConfig,
  code: z.string(),
  state: z.string(),
  redirectUri: z.string(),
})

export async function defaultTokenExchangeHandler({
  oauthConfig,
  redirectUri,
  code,
  state,
}: z.infer<typeof zTokenExchangeHandlerArgs>): Promise<
  z.infer<typeof zTokenResponse>
> {
  if (!oauthConfig.connector_config) {
    throw new Error('No connector_config provided')
  }
  if (!oauthConfig.connector_config?.client_id) {
    throw new Error('No client_id provided')
  }
  if (!oauthConfig.connector_config?.client_secret) {
    throw new Error('No client_secret provided')
  }

  const params = mapOauthParams(
    {
      client_id: oauthConfig.connector_config.client_id,
      client_secret: oauthConfig.connector_config.client_secret,
      redirectUri,
      scope: prepareScopes(
        oauthConfig.connector_config.scopes ?? [],
        oauthConfig,
      ),
      state,
      grant_type: 'authorization_code',
      code,
      ...(oauthConfig.params_config.token ?? {}),
    },
    oauthConfig.params_config.param_names ?? {},
  )

  return makeTokenRequest(oauthConfig.token_request_url, params, 'exchange')
}

export const zTokenRefreshHandlerArgs = z.object({
  oAuthConfig: zOAuthConfig,
  refreshToken: z.string(),
})

export async function tokenRefreshHandler({
  oAuthConfig,
  refreshToken,
}: z.infer<typeof zTokenRefreshHandlerArgs>): Promise<
  z.infer<typeof zTokenResponse>
> {
  if (!oAuthConfig.connector_config) {
    throw new Error('No connector_config provided')
  }
  if (!oAuthConfig.connector_config?.client_id) {
    throw new Error('No client_id provided')
  }
  if (!oAuthConfig.connector_config?.client_secret) {
    throw new Error('No client_secret provided')
  }
  const params = mapOauthParams(
    {
      client_id: oAuthConfig.connector_config.client_id,
      client_secret: oAuthConfig.connector_config.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      ...(oAuthConfig.params_config.token ?? {}),
    },
    oAuthConfig.params_config.param_names ?? {},
  )

  return makeTokenRequest(oAuthConfig.token_request_url, params, 'refresh')
}
