export function prettyConnectorName(connectorName: string) {
  return connectorName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
