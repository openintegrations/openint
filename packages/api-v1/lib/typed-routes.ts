import type {paths} from '../__generated__/openapi.types'

import {resolveRoute} from '@openint/env'
import {joinPath} from '@openint/util/url-utils'

export type APIV1Route = keyof paths

/** This needs aboslute URL */
export function getAbsoluteApiV1URL(route: APIV1Route) {
  // return joinPath(getBaseURLs(null).api, 'v1', route)
  return new URL(...resolveRoute(joinPath('/api/v1/', route), null)).toString()
}
