import {z} from 'zod'

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
export type FrameMessage = z.infer<typeof zFrameMessage>

export interface ConnectProps {
  baseUrl?: string
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
export const defaultHost = 'https://connect.openint.dev'

export const createMagicLinkUrl = ({
  baseUrl = defaultHost,
  params = {},
}: ConnectProps) => {
  const url = new URL(baseUrl)
  // TODO; create a new view in the server call default if there's no view and
  // smartly load the right view based on whether the user has connections or not
  if (!params.view) {
    url.searchParams.set('view', 'add')
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}
