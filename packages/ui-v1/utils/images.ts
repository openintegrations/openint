/** @deprecated. Serever should already return the correct URL */
export function getConnectorLogoUrl(connectorName: string) {
  return `/_assets/logo-${connectorName}.svg`
}
