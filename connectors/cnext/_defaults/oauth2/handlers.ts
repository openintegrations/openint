import {z} from 'zod'
import {zOAuthConfig} from './def'
import {mapOauthParams} from './server'
import {fillOutStringTemplateVariables, prepareScopes} from './utils'

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
  oauth_config: zOAuthConfig,
  redirect_uri: z.string(),
  connection_id: z.string(),
})

export async function authorizeHandler({
  oauth_config,
  redirect_uri,
  connection_id,
}: z.infer<typeof zAuthorizeHandlerArgs>): Promise<{
  authorization_url: string
}> {
  if (!connection_id) {
    throw new Error('No connection_id provided')
  }
  const url = new URL(
    fillOutStringTemplateVariables(
      oauth_config.authorization_request_url,
      oauth_config.connector_config,
      oauth_config.connection_settings,
    ),
  )
  const params = mapOauthParams(
    {
      client_id: oauth_config.connector_config.client_id,
      client_secret: oauth_config.connector_config.client_secret,
      redirect_uri,
      response_type: 'code',
      // decoding it as url.toString() encodes it alredy
      scope: decodeURIComponent(prepareScopes(oauth_config)),
      state: Buffer.from(connection_id).toString('base64'),
      ...(oauth_config.params_config.authorize ?? {}),
    },
    oauth_config.params_config.param_names ?? {},
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

export async function tokenExchangeHandler({
  oauth_config,
  redirect_uri,
  code,
  state,
}: z.infer<typeof zTokenExchangeHandlerArgs>): Promise<
  z.infer<typeof zTokenResponse>
> {
  // TODO (@pellicceama): For every value in params apply template literal substitution
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

  const url = fillOutStringTemplateVariables(
    oauth_config.token_request_url,
    oauth_config.connector_config,
    oauth_config.connection_settings,
  )
  return makeTokenRequest(url, params, 'exchange')
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

  const url = fillOutStringTemplateVariables(
    oauth_config.token_request_url,
    oauth_config.connector_config,
    oauth_config.connection_settings,
  )
  return makeTokenRequest(url, params, 'refresh')
}
