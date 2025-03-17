import {z} from 'zod'
import {zOAuthConfig} from './def'

export function prepareScopes(jsonConfig: z.infer<typeof zOAuthConfig>) {
  const scopes = jsonConfig.scopes
  const scopeSeparator = jsonConfig.scope_separator
  return encodeURIComponent(
    scopes.map((s) => s.scope).join(scopeSeparator ?? ' '),
  )
}

/**
 * Fills out variables in a URL string template with values from connector config and connection settings
 *
 * @param url - URL string containing variables in ${variable} format
 * @param connectorConfig - Connector configuration object containing values to substitute
 * @param connectionSettings - Connection settings object containing values to substitute
 * @returns URL string with variables replaced with actual values
 *
 * Variables can reference:
 * - Connector config values using ${connector_config.key}
 * - Connection settings using ${connection_settings.key}
 *
 * Example:
 * Input: "https://api.example.com/${connector_config.version}/users/${connection_settings.user_id}"
 * Output: "https://api.example.com/v1/users/123"
 */

export function fillOutStringTemplateVariables(
  url: string,
  connectorConfig: any,
  connectionSettings: any,
) {
  if (!url) return url
  let filledUrl = url

  // Ensure connectorConfig and connectionSettings are objects
  connectorConfig = connectorConfig || {}
  connectionSettings = connectionSettings || {}

  // Match ${variable} pattern
  const variableRegex = /\${([^}]+)}/g
  const matches = url.match(variableRegex)

  if (!matches) {
    return filledUrl
  }

  matches.forEach((match) => {
    // Extract variable name without ${} wrapper
    const varName = match.slice(2, -1)

    // Check if variable references connector_config
    if (varName.startsWith('connector_config.')) {
      const configKey = varName.split('.')[1]
      const value = connectorConfig[configKey as keyof typeof connectorConfig]
      if (value) {
        filledUrl = filledUrl.replace(match, value)
      }
    }
    // Check if variable references connection_settings
    else if (varName.startsWith('connection_settings.')) {
      const settingKey = varName.split('.')[1]
      const value =
        connectionSettings[settingKey as keyof typeof connectionSettings]
      if (value) {
        filledUrl = filledUrl.replace(match, value)
      }
    }
  })

  return filledUrl
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
