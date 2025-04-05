import crypto from 'node:crypto'
import {pickBy} from 'remeda'
import {stringifyQueryParams} from '../url-utils'
import type {Z} from '../zod-utils'
import {z} from '../zod-utils'

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

export class OAuth2Client<
  TError = unknown,
  TToken extends TokenResponse = TokenResponse,
> {
  constructor(private readonly config: OAuth2ClientConfig) {
    zOAuth2ClientConfig.parse(config)
  }

  private async post<T>(
    url: string,
    params: Record<string, unknown>,
  ): Promise<T> {
    const {clientAuthLocation = 'body'} = this.config
    const body = stringifyQueryParams({
      ...params,
      ...(clientAuthLocation !== 'header'
        ? {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
          }
        : {}),
    })

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    if (clientAuthLocation === 'header') {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64')}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const error = await response.json().catch(() => null)
      throw new OAuth2Error<TError>(
        this.config.errorToString?.(error as TError) ?? JSON.stringify(error),
        error as TError,
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

  // TODO: Use an actual oauth library
  getAuthorizeUrl(params: {
    redirect_uri: string
    scope?: string
    state?: string
    code_verifier?: string
  }) {
    const codeChallenge = params.code_verifier
      ? Buffer.from(
          crypto.createHash('sha256').update(params.code_verifier).digest(),
        ).toString('base64url')
      : undefined

    return `${this.config.authorizeURL}?${stringifyQueryParams(
      pickBy(
        {
          response_type: 'code',
          client_id: this.config.clientId,
          ...params,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallenge ? 'S256' : undefined,
        },
        (val) => val != null,
      ),
    )}`
  }

  getToken({
    code,
    redirectUri: redirect_uri,
    code_verifier,
  }: {
    code: string
    redirectUri: string
    code_verifier?: string
  }) {
    return this.post<TToken & {refresh_token: string}>(this.config.tokenURL, {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      code_verifier,
    })
  }

  refreshToken(refreshToken: string) {
    // Not sure if `refresh_token` always exists. Does for QBO.
    return this.post<TToken & {refresh_token: string}>(this.config.tokenURL, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
  }

  revokeToken(token: string) {
    if (!this.config.revokeUrl) {
      throw new Error('Missing revokeUrl. Cannot revoke token')
    }
    return this.post(this.config.revokeUrl, {
      token,
    })
  }

  getTokenWithClientCredentials(params?: {scope: string}) {
    return this.post<TToken & {refresh_token: string}>(this.config.tokenURL, {
      grant_type: 'client_credentials',
      scope: params?.scope,
    })
  }
}

export class OAuth2Error<T = unknown> extends Error {
  override name = 'OAuth2Error'

  constructor(
    // prettier-ignore
    public override readonly message: string,
    public readonly data: T,
    public readonly request: {
      status: number
      statusText: string
      url: string
      method: string
      headers: Record<string, string>
    },
  ) {
    super(message)
    Object.setPrototypeOf(this, OAuth2Error.prototype)
  }
}
