import {z} from 'zod'
import {zOAuthConfig, zTokenResponse} from './def'

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
  let filledUrl = url

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
export async function makeTokenRequest(
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
