import {toBase64Url} from '@openint/util/string-utils'
import {isZodError, z, type Z} from '@openint/util/zod-utils'
import {oauth2Schemas, zOAuthConfig} from './def'
import {renameObjectKeys, prepareScopes} from './utils'

export async function makeTokenRequest(
  url: string,
  params: Record<string, string>,
  flowType: 'exchange' | 'refresh',
  // note: we may want to add bodyFormat: form or json as an option
  fetch: (req: Request) => Promise<Response> = globalThis.fetch,
): Promise<
  Z.infer<typeof oauth2Schemas.connection_settings.shape.oauth.shape.credentials>
> {
  const response = await fetch(
    new Request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(params),
    }),
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Token ${flowType} failed: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  try {
    const json = await response.json()
    return oauth2Schemas.connection_settings.shape.oauth.shape.credentials.parse(
      {
        ...json,
        client_id: params['client_id'],
        scope: json.scope ?? params['scope'],
        token_type: json.token_type?.toLowerCase(),
        expires_at:
          json.expires_in && json.expires_in > 0
            ? new Date(Date.now() + json.expires_in * 1000).toISOString()
            : undefined,
        raw: json,
      },
    )
  } catch (error) {
    if (isZodError(error)) {
      throw new Error(
        `Invalid oauth2 ${flowType} token response format: ${error.message}`,
      )
    }
    throw error
  }
}

export function validateOAuthCredentials(
  oauthConfig: Z.infer<typeof zOAuthConfig>,
  requiredFields: Array<'client_id' | 'client_secret'> = [
    'client_id',
    'client_secret',
  ],
): void {
  if (!oauthConfig.connector_config) {
    throw new Error('No connector_config provided')
  }

  for (const field of requiredFields) {
    if (!oauthConfig.connector_config?.oauth?.[field]) {
      console.error(
        `No ${field} provided in connector_config.oauth for ${oauthConfig.connector_config.name}`,
      )
      throw new Error(`No ${field} provided`)
    }
  }
}

export const zAuthorizeHandlerArgs = z.object({
  oauthConfig: zOAuthConfig,
  redirectUri: z.string(),
  connectionId: z.string(),
})

async function createCodeChallenge(codeVerifier: string) {
  // Convert the string to a Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  // Hash the data with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  // Convert the hash to base64url
  return toBase64Url(new Uint8Array(hashBuffer))
}

/** Code verifier must follow the specifications of RFC-7636. We
 * should add a function to generate a random code verifier that meets the spec */
const codeVerifier = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'

export async function authorizeHandler({
  oauthConfig,
  redirectUri,
  connectionId,
}: Z.infer<typeof zAuthorizeHandlerArgs>): Promise<{
  authorization_url: string
}> {
  if (!connectionId) {
    throw new Error('No connection_id provided')
  }

  validateOAuthCredentials(oauthConfig)

  const url = new URL(oauthConfig.authorization_request_url)

  const params = renameObjectKeys(
    {
      client_id: oauthConfig.connector_config.oauth.client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      // decoding it as url.toString() encodes it already
      scope: decodeURIComponent(
        prepareScopes(
          oauthConfig.connector_config.oauth.scopes ?? [],
          oauthConfig,
        ),
      ),
      // TODO: Make this configurable
      code_challenge: await createCodeChallenge(codeVerifier),
      code_challenge_method: 'S256',
      // TODO: create a separate state ID in the database instead of using connectionId
      // state: Buffer.from(connectionId).toString('base64'),
      state: connectionId,
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
  fetch,
}: Z.infer<typeof zTokenExchangeHandlerArgs> & {
  fetch?: (req: Request) => Promise<Response>
}): Promise<
  Z.infer<typeof oauth2Schemas.connection_settings.shape.oauth.shape.credentials>
> {
  validateOAuthCredentials(oauthConfig)

  const params = renameObjectKeys(
    {
      client_id: oauthConfig.connector_config.oauth.client_id,
      client_secret: oauthConfig.connector_config.oauth.client_secret,
      redirect_uri: redirectUri,
      scope: prepareScopes(
        oauthConfig.connector_config.oauth.scopes ?? [],
        oauthConfig,
      ),
      state,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      code,
      ...(oauthConfig.params_config.token ?? {}),
    },
    oauthConfig.params_config.param_names ?? {},
  )
  console.log('token exchange params', params, 'fetch', fetch)

  return makeTokenRequest(
    oauthConfig.token_request_url,
    params,
    'exchange',
    fetch,
  )
}

export const zTokenRefreshHandlerArgs = z.object({
  oauthConfig: zOAuthConfig,
  refreshToken: z.string(),
})

export async function tokenRefreshHandler({
  oauthConfig,
  refreshToken,
}: Z.infer<typeof zTokenRefreshHandlerArgs>): Promise<
  Z.infer<typeof oauth2Schemas.connection_settings.shape.oauth.shape.credentials>
> {
  validateOAuthCredentials(oauthConfig)

  const params = renameObjectKeys(
    {
      client_id: oauthConfig.connector_config.oauth.client_id,
      client_secret: oauthConfig.connector_config.oauth.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      ...(oauthConfig.params_config.token ?? {}),
    },
    oauthConfig.params_config.param_names ?? {},
  )

  return makeTokenRequest(oauthConfig.token_request_url, params, 'refresh')
}
