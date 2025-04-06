
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
