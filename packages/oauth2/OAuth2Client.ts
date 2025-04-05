import crypto from 'node:crypto'
import {R} from '@openint/util/remeda'
import {stringifyQueryParams} from '@openint/util/url-utils'
import type {Z} from '@openint/util/zod-utils'
import {z} from '@openint/util/zod-utils'
import {OAuth2Error} from './OAuth2Error'

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

  const getAuthorizeUrl = (params: {
    redirect_uri: string
    scope?: string
    state?: string
    code_verifier?: string
  }) => {
    const codeChallenge = params.code_verifier
      ? Buffer.from(
          crypto.createHash('sha256').update(params.code_verifier).digest(),
        ).toString('base64url')
      : undefined

    return `${config.authorizeURL}?${stringifyQueryParams(
      R.pickBy(
        {
          response_type: 'code',
          client_id: config.clientId,
          ...params,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallenge ? 'S256' : undefined,
        },
        (val) => val != null,
      ),
    )}`
  }

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
