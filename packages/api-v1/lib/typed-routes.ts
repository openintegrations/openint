import type {paths} from '../__generated__/openapi.types'

import {getBaseURLs} from '@openint/env'
import {joinPath} from '@openint/util/url-utils'

export type APIV1Route = keyof paths

export function getApiV1URL(route: APIV1Route) {
  return joinPath(getBaseURLs(null).api, 'v1', route)
}
