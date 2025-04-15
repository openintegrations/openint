/**
 * qs supports nested query param, needed by apis such as Stripe.
 * @see https://github.com/sindresorhus/query-string/pull/147
 * TODO: Fully switch from query-string to qs
 */
export {parse as parseQueryParams, stringify as stringifyQueryParams} from 'qs'

/**
 * Also available here https://www.svgbackgrounds.com/tools/svg-to-css/
 */
export function urlFromImage(input: {type: 'svg'; data: string}) {
  return `data:image/svg+xml,${encodeURIComponent(input.data)}`
}

/** Does not handle parents for now... */
export function urlSearchParamsToJson(
  searchParams: URLSearchParams,
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {}
  searchParams.forEach((value, key) => {
    if (key in result) {
      // If key exists, convert to array if needed and append value
      const existing = result[key]
      result[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing as string, value]
    } else {
      result[key] = value
    }
  })
  return result
}

// dubious utilities

/** Via https://stackoverflow.com/a/55142565/692499, How do we get identical behavior as require('node:path').join */
export function joinPath(...optionalParts: Array<string | null | undefined>) {
  const parts = optionalParts.filter((p): p is string => !!p)
  const leading = parts[0]?.startsWith('/') ? '/' : ''
  const trailing = parts[parts.length - 1]?.endsWith('/') ? '/' : ''
  return `${leading}${parts
    .map((p) => p.replace(/\/+$/, '').replace(/^\/+/, ''))
    .filter((p) => !!p) // Removes duplicate `//`
    .join('/')}${trailing}`
}

export function trimTrailingSlash<T extends string | undefined | null>(
  path: T,
): T {
  return path?.replace(/\/+$/, '') as T
}

export function createURL(
  url: string,
  options: {
    searchParams?: Record<string, string | string[]>
  },
) {
  const urlObj = new URL(url)
  Object.entries(options.searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => urlObj.searchParams.append(key, v))
    } else {
      urlObj.searchParams.set(key, value)
    }
  })
  return urlObj.toString()
}
