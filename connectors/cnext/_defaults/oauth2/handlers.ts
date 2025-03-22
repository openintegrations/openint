import {z} from 'zod'
import {zOAuthConfig} from './def'
import {mapOauthParams, prepareScopes} from './utils'

export const zTokenResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
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
    return zTokenResponse.parse(await response.json())
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
  if (!oauthConfig.connector_config) {
    throw new Error('No connector_config provided')
  }
  const url = new URL(oauthConfig.authorization_request_url)
  const params = mapOauthParams(
    {
      client_id: oauthConfig.connector_config.client_id,
      client_secret: oauthConfig.connector_config.client_secret,
      redirect_uri: redirectUri,
      response_type: 'code',
      // decoding it as url.toString() encodes it alredy
      scope: decodeURIComponent(prepareScopes(oauthConfig)),
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
  oauth_config: zOAuthConfig,
  code: z.string(),
  state: z.string(),
  redirect_uri: z.string(),
})

export async function defaultTokenExchangeHandler({
  oauth_config,
  redirect_uri,
  code,
  state,
}: z.infer<typeof zTokenExchangeHandlerArgs>): Promise<
  z.infer<typeof zTokenResponse>
> {
  if (!oauth_config.connector_config) {
    throw new Error('No connector_config provided')
  }
  const params = mapOauthParams(
    {
      client_id: oauth_config.connector_config.client_id,
      client_secret: oauth_config.connector_config.client_secret,
      redirect_uri,
      scope: prepareScopes(oauth_config),
      state,
      grant_type: 'authorization_code',
      code,
      ...(oauth_config.params_config.token ?? {}),
    },
    oauth_config.params_config.param_names ?? {},
  )

  return makeTokenRequest(oauth_config.token_request_url, params, 'exchange')
}

export const zTokenRefreshHandlerArgs = z.object({
  oauth_config: zOAuthConfig,
  refresh_token: z.string(),
})

export async function tokenRefreshHandler({
  oauth_config,
  refresh_token,
}: z.infer<typeof zTokenRefreshHandlerArgs>): Promise<
  z.infer<typeof zTokenResponse>
> {
  if (!oauth_config.connector_config) {
    throw new Error('No connector_config provided')
  }
  const params = mapOauthParams(
    {
      client_id: oauth_config.connector_config.client_id,
      client_secret: oauth_config.connector_config.client_secret,
      refresh_token,
      grant_type: 'refresh_token',
      ...(oauth_config.params_config.token ?? {}),
    },
    oauth_config.params_config.param_names ?? {},
  )

  return makeTokenRequest(oauth_config.token_request_url, params, 'refresh')
}
