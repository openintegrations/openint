import {toBase64Url} from '@openint/util/string-utils'

/*
 * This function takes the paramNames map where a user can map were fields like client_id and client_secret are named in particular oauth connector.
 * For example salesforce may call client_id clientKey. In this case, the paramNames would have client_id: clientKey.
 * Following the SF example, this function will return a new object with the client_id field renamed to clientKey.
 * Write tests for this function to in different scenarios ensure that the clientKey is returned with the value initially set for client_id
 */
export function renameObjectKeys(
  object: Record<string, string>,
  keyMapping: Record<string, string>,
) {
  const result: Record<string, string> = {}

  // Process each parameter in the input
  Object.entries(object).forEach(([key, value]) => {
    if (key && keyMapping && key in keyMapping && keyMapping[key]) {
      result[keyMapping[key]] = value
    } else {
      result[key] = value
    }
  })

  return result
}

/**
 * Generates a random code verifier that meets the specifications of RFC-7636.
 * Code verifier must be between 43-128 chars and contain only:
 * - Uppercase letters A-Z
 * - Lowercase letters a-z
 * - Digits 0-9
 * - "-", ".", "_", "~"
 *
 * @see https://www.rfc-editor.org/rfc/rfc7636
 */
export function createCodeVerifier(length = 64) {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  return Array.from(array)
    .map((x) => charset[x % charset.length])
    .join('')
}

/**
 * Utility function to create a code challenge from a code verifier using Web Crypto API
 */
export async function createCodeChallenge(codeVerifier: string) {
  // Convert the string to a Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  // Hash the data with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  // Convert the hash to base64url
  return toBase64Url(new Uint8Array(hashBuffer))
}
