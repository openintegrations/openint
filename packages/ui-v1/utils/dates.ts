export function formatIsoDateString(isoDateString: string) {
  return new Date(isoDateString)
    .toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    .replace(',', '')
}
