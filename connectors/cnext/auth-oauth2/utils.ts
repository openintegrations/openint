import {type Z} from '@openint/util/zod-utils'
import type {zOAuthConfig} from './def'

export function prepareScopes(
  scopes: string[],
  jsonConfig: Z.infer<typeof zOAuthConfig>,
) {
  const scopeSeparator = jsonConfig.scope_separator ?? ' '

  if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
    return ''
  }
  return scopes.join(encodeURIComponent(scopeSeparator))
}

/*
 * This function takes the paramNames map where a user can map were fields like client_id and client_secret are named in particular oauth connector.
 * For example salesforce may call client_id clientKey. In this case, the paramNames would have client_id: clientKey.
 * Following the SF example, this function will return a new object with the client_id field renamed to clientKey.
 * Write tests for this function to in different scenarios ensure that the clientKey is returned with the value initially set for client_id
 */
export function mapOauthParams(
  params: Record<string, string>,
  paramNames: Record<string, string>,
) {
  const result: Record<string, string> = {}

  // Process each parameter in the input
  Object.entries(params).forEach(([key, value]) => {
    if (key && paramNames && key in paramNames && paramNames[key]) {
      result[paramNames[key]] = value
    } else {
      result[key] = value
    }
  })

  return result
}
