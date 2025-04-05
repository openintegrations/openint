import {pickBy} from 'remeda'
import {stringifyQueryParams} from '../url-utils'

export interface OAuth2ClientConfig<TError = unknown> {
  clientId: string
  clientSecret: string
  authorizeURL: string
  tokenURL: string
  revokeUrl?: string
  /** By default send in `body` as form encoded params, but may also send in header */
  clientAuthLocation?: 'body' | 'header'
  errorToString?: (err: TError) => string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export class OAuth2Client<
  TError = unknown,
  TToken extends TokenResponse = TokenResponse,
> {
  constructor(private readonly config: OAuth2ClientConfig<TError>) {}

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

    return response.json()
  }

  // TODO: Use an actual oauth library
  getAuthorizeUrl(params: {
    redirect_uri: string
    scope?: string
    state?: string
  }) {
    return `${this.config.authorizeURL}?${stringifyQueryParams(
      pickBy(
        {
          response_type: 'code',
          client_id: this.config.clientId,
          ...params,
        },
        (val) => val != null,
      ),
    )}`
  }

  getToken(code: string, redirectUri: string) {
    return this.post<TToken & {refresh_token: string}>(this.config.tokenURL, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
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
