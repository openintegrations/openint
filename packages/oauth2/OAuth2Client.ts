import {toBase64Url} from '@openint/util/string-utils'
import {stringifyQueryParams} from '@openint/util/url-utils'
import {zFunction} from '@openint/util/zod-function-utils'
import type {Z} from '@openint/util/zod-utils'
import {z} from '@openint/util/zod-utils'
import {OAuth2Error} from './OAuth2Error'

/**
 * Utility function to create a code challenge from a code verifier using Web Crypto API
 */
async function createCodeChallenge(codeVerifier: string) {
  // Convert the string to a Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  // Hash the data with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  // Convert the hash to base64url
  return toBase64Url(new Uint8Array(hashBuffer))
}

const zTokenResponse = z.object({
  access_token: z.string(),
  token_type: z.string(),
})

const zOAuth2ClientConfig = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  authorizeURL: z.string(),
  tokenURL: z.string(),
  revokeUrl: z.string().optional(),
  clientAuthLocation: z.enum(['body', 'header']).optional(),
  errorToString: z.function().args(z.unknown()).returns(z.string()).optional(),
})

export type OAuth2ClientConfig = Z.infer<typeof zOAuth2ClientConfig>
export type TokenResponse = Z.infer<typeof zTokenResponse>

/**
 * Consider switching to, but then we'd have to be ESM and deal with external
 * implementation details.
 * https://github.com/badgateway/oauth2-client
 */
export function createOAuth2Client<
  TToken extends TokenResponse = TokenResponse,
>(
  config: OAuth2ClientConfig,
  fetch: (req: Request) => Promise<Response> = globalThis.fetch,
) {
  zOAuth2ClientConfig.parse(config)

  const post = async <T>(
    url: string,
    params: Record<string, unknown>,
  ): Promise<T> => {
    const {clientAuthLocation = 'body'} = config
    const body = stringifyQueryParams({
      ...params,
      ...(clientAuthLocation !== 'header'
        ? {
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }
        : {}),
    })

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    if (clientAuthLocation === 'header') {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${config.clientId}:${config.clientSecret}`,
      ).toString('base64')}`
    }

    const response = await fetch(
      new Request(url, {method: 'POST', headers, body}),
    )

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const error = await response.json().catch(() => null)
      throw new OAuth2Error(
        config.errorToString?.(error) ?? JSON.stringify(error),
        error,
        {
          status: response.status,
          statusText: response.statusText,
          url,
          method: 'POST',
          headers: Object.fromEntries(response.headers.entries()),
        },
      )
    }

    return response.json() as Promise<T>
  }

  const getAuthorizeUrl = zFunction(
    z.object({
      redirect_uri: z.string(),
      scope: z.string().optional(),
      state: z.string().optional(),
      code_verifier: z.string().optional(),
    }),
    async ({code_verifier, ...params}) => {
      const searchParams = {
        ...params,
        response_type: 'code',
        client_id: config.clientId,
        ...(code_verifier && {
          code_challenge: await createCodeChallenge(code_verifier),
          code_challenge_method: 'S256',
        }),
      }
      const url = new URL(config.authorizeURL)
      for (const [key, value] of Object.entries(searchParams)) {
        if (value != null) {
          url.searchParams.append(key, String(value))
        }
      }

      return url.toString()
    },
  )

  const getToken = ({
    code,
    redirectUri: redirect_uri,
    code_verifier,
  }: {
    code: string
    redirectUri: string
    code_verifier?: string
  }) =>
    post<TToken & {refresh_token: string}>(config.tokenURL, {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      code_verifier,
    })

  const refreshToken = (refreshToken: string) =>
    post<TToken & {refresh_token: string}>(config.tokenURL, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

  const revokeToken = (token: string) => {
    if (!config.revokeUrl) {
      throw new Error('Missing revokeUrl. Cannot revoke token')
    }
    return post(config.revokeUrl, {
      token,
    })
  }

  const getTokenWithClientCredentials = (params?: {scope: string}) =>
    post<TToken & {refresh_token: string}>(config.tokenURL, {
      grant_type: 'client_credentials',
      scope: params?.scope,
    })

  return {
    getAuthorizeUrl,
    getToken,
    refreshToken,
    revokeToken,
    getTokenWithClientCredentials,
  }
}
