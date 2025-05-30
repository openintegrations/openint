import type {Z} from '@openint/util/zod-utils'

import {safeJSONParseObject} from '@openint/util/json-utils'
import {stringifyQueryParams} from '@openint/util/url-utils'
import {zFunction} from '@openint/util/zod-function-utils'
import {z} from '@openint/util/zod-utils'
import {OAuth2Error} from './OAuth2Error'
import {createCodeChallenge, renameObjectKeys} from './utils.client'

const zTokenResponse = z
  .object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
    // TODO: Figure out how to handle scope
    scope: z.string().optional(),
  })
  // token response may respond additional fields that we want to capture in the raw field
  .passthrough()
export type TokenResponse = Z.infer<typeof zTokenResponse>

const zOAuth2ClientConfig = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  authorizeURL: z.string(),
  tokenURL: z.string(),
  revokeUrl: z.string().optional(),
  introspectUrl: z.string().optional(),
  clientAuthLocation: z.enum(['body', 'header']).optional(),
  errorToString: z.function().args(z.unknown()).returns(z.string()).optional(),
  /** renameObjectKeys to the names used by the oauth provider */
  paramKeyMapping: z.record(z.string(), z.string()).optional(),
  /** Do we need to support other delimiters? */
  scopeDelimiter: z
    // .enum([' ', ',', ';'])
    .string()
    .optional()
    .describe('Delimiter for scopes, defaults to space'),
})
export type OAuth2ClientConfig = Z.infer<typeof zOAuth2ClientConfig>

/**
 * Schema for token introspection response according to RFC 7662
 * https://datatracker.ietf.org/doc/html/rfc7662#section-2.2
 */
const zTokenIntrospectionResponse = z.object({
  active: z.boolean(),
  scope: z.string().optional(),
  client_id: z.string().optional(),
  username: z.string().optional(),
  token_type: z.string().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  sub: z.string().optional(),
  aud: z.array(z.string()).optional(),
  iss: z.string().optional(),
  jti: z.string().optional(),
  nbf: z.number().optional(),
})
export type TokenIntrospectionResponse = Z.infer<
  typeof zTokenIntrospectionResponse
>

/**
 * Consider switching to, but then we'd have to be ESM and deal with external
 * implementation details.
 * https://github.com/badgateway/oauth2-client
 */
export function createOAuth2Client(
  _config: OAuth2ClientConfig,
  fetch: (req: Request) => Promise<Response> = globalThis.fetch,
) {
  const config = Object.freeze(zOAuth2ClientConfig.parse(_config))

  /**
   * workaround for old scope being string... We should migrate config.oauth.scope then fix this
   */
  const joinScopes = zFunction(
    z.union([z.array(z.string()), z.string()]),
    (scopes) => {
      if (typeof scopes === 'string') {
        return scopes
      }
      return scopes
        .filter(Boolean)
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0)
        .join(config.scopeDelimiter ?? ' ')
    },
  )

  const post = async <T>(
    url: string,
    params: Record<string, unknown>,
  ): Promise<T> => {
    const {clientAuthLocation = 'body'} = config
    const fullParams = {
      ...params,
      ...(clientAuthLocation !== 'header'
        ? {
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }
        : {}),
    }
    const resolvedParams = renameObjectKeys(
      fullParams,
      config.paramKeyMapping ?? {},
    )
    const body = stringifyQueryParams(resolvedParams)

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    if (clientAuthLocation === 'header') {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${config.clientId}:${config.clientSecret}`,
      ).toString('base64')}`
    }

    try {
      const response = await fetch(
        new Request(url, {method: 'POST', headers, body}),
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => null)
        const errorJSON = safeJSONParseObject(errorText)
        const errPayload = {
          status: response.status,
          status_text: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          ...(errorJSON ?? {error_text: errorText}),
          request_url: url,
          request_body: body,
        }
        throw new OAuth2Error(
          config.errorToString?.(errPayload) ?? JSON.stringify(errPayload),
          errPayload,
          {
            status: response.status,
            statusText: response.statusText,
            method: 'POST',
            headers: Object.fromEntries(response.headers.entries()),
            url,
          },
        )
      }

      // First try JSON parsing
      const text = await response.text()
      const json = safeJSONParseObject(text)
      if (json) {
        return json as T
      }

      // Then try parsing as URL-encoded form data
      try {
        const formData = new URLSearchParams(text)
        const result: Record<string, string | number> = {}

        // Convert numeric values where appropriate
        formData.forEach((value, key) => {
          result[key] = /^\d+$/.test(value) ? parseInt(value, 10) : value
        })

        return result as unknown as T
        // eslint-disable-next-line no-empty
      } catch {}

      // If all else fails, throw error
      throw new Error(
        `Failed to parse oauth post response: ${text.substring(0, 100)}...`,
      )
    } catch (error) {
      if (error instanceof OAuth2Error) {
        throw error
      }

      const errPayload = {
        error_message: error instanceof Error ? error.message : String(error),
        error_name: error instanceof Error ? error.name : 'Unknown Error',
        request_url: url,
        request_body: body,
      }

      throw new OAuth2Error(
        config.errorToString?.(errPayload) ?? JSON.stringify(errPayload),
        errPayload,
        {
          status: 500, // Default error status for network/unexpected errors
          statusText: 'Internal Error',
          method: 'POST',
          headers: Object.fromEntries(Object.entries(headers)),
          url,
        },
      )
    }
  }

  const getAuthorizeUrl = zFunction(
    z.object({
      redirect_uri: z.string(),
      scopes: z.array(z.string()).optional(),
      state: z.string().optional(),
      code_challenge: z
        .object({
          verifier: z.string(),
          method: z.enum(['S256', 'plain']),
        })
        .optional(),

      additional_params: z.record(z.string(), z.string()).optional(),
    }),
    async ({code_challenge, scopes, additional_params, ...rest}) => {
      let searchParams = renameObjectKeys(
        {
          ...rest,
          response_type: 'code',
          client_id: config.clientId,
          ...(scopes && scopes.length > 0 && {scope: joinScopes(scopes)}),
          ...(code_challenge && {
            code_challenge:
              code_challenge.method === 'S256'
                ? await createCodeChallenge(code_challenge.verifier)
                : code_challenge.verifier,
            code_challenge_method: code_challenge.method,
          }),
        },
        config.paramKeyMapping ?? {},
      )
      // apply additional params after any possible renaming
      searchParams = {
        ...searchParams,
        ...additional_params,
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

  const exchangeCodeForToken = zFunction(
    z.object({
      code: z.string(),
      redirect_uri: z.string(),
      code_verifier: z.string().optional(),
      additional_params: z.record(z.string(), z.string()).optional(),
    }),
    // zFunction does not support promise properly just yet...
    // So we need to do a manual parse
    ({code, redirect_uri, code_verifier, additional_params}) =>
      post(config.tokenURL, {
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
        ...additional_params,
      }).then((data) => zTokenResponse.parse(data)),
  )

  const refreshToken = zFunction(
    z.object({
      refresh_token: z.string(),
      additional_params: z.record(z.string(), z.string()).optional(),
    }),
    ({refresh_token, additional_params}) =>
      post(config.tokenURL, {
        grant_type: 'refresh_token',
        refresh_token,
        ...additional_params,
      }).then((data) => zTokenResponse.parse(data)),
  )

  const revokeToken = zFunction(
    z.object({
      token: z.string(),
      // Not sure if this is part of oauth2 spec yet...
      token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
      additional_params: z.record(z.string(), z.string()).optional(),
    }),
    ({token, token_type_hint, additional_params}) => {
      if (!config.revokeUrl) {
        throw new Error('Missing revokeUrl. Cannot revoke token')
      }
      return post(config.revokeUrl, {
        token,
        ...(token_type_hint && {token_type_hint}),
        ...additional_params,
      })
    },
  )

  const getTokenWithClientCredentials = zFunction(
    z.object({
      scopes: z.array(z.string()).optional(),
    }),
    ({scopes}) =>
      post<TokenResponse & {refresh_token: string}>(config.tokenURL, {
        grant_type: 'client_credentials',
        ...(scopes?.length && {scope: joinScopes(scopes)}),
      }).then((data) => zTokenResponse.parse(data)),
  )

  const introspectToken = zFunction(
    z.object({
      token: z.string(),
      token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
      additional_params: z.record(z.string(), z.string()).optional(),
    }),
    ({token, token_type_hint, additional_params}) => {
      if (!config.introspectUrl) {
        throw new Error('Missing introspectUrl. Cannot introspect token')
      }
      return post<TokenIntrospectionResponse>(config.introspectUrl, {
        token,
        ...(token_type_hint && {token_type_hint}),
        ...additional_params,
      }).then((data) => zTokenIntrospectionResponse.parse(data))
    },
  )

  return {
    get config() {
      return config
    },
    joinScopes,
    getAuthorizeUrl,
    exchangeCodeForToken,
    refreshToken,
    revokeToken,
    getTokenWithClientCredentials,
    introspectToken,
  }
}
