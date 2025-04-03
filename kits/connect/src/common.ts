import {z, type Z} from '@openint/util/zod-utils'

export const zFrameMessage = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('SUCCESS'),
    data: z.object({connectionId: z.string()}), // Need to better type connectionId
  }),
  z.object({
    type: z.literal('ERROR'),
    data: z.object({code: z.string(), message: z.string()}),
  }),
])
export type FrameMessage = Z.infer<typeof zFrameMessage>

export const defaultHost = 'https://app.openint.dev'

export interface GetIFrameProps {
  baseUrl?: string | null
  params?: {
    token?: string
    displayName?: string
    connectionId?: string
    connectorNames?: string
    integrationIds?: string
    view?: 'add' | 'add-deeplink' | 'manage' | 'manage-deeplink'
    theme?: 'light' | 'dark'
  }
}

export const getIFrameUrl = ({
  baseUrl = defaultHost,
  params = {},
}: GetIFrameProps) => {
  const placeholder = 'https://placeholder'
  const url = new URL('/connect/portal', baseUrl ?? placeholder)
  // TODO; move this logic to server to load smartly based on whether the user has connections or not
  if (!params.view) {
    url.searchParams.set('view', 'add')
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })
  return baseUrl ? url.toString() : url.toString().replace(placeholder, '')
}
