'use client'

import {useAuth} from '@clerk/nextjs'
import {QueryClientProvider} from '@tanstack/react-query'
import {ThemeProvider} from 'next-themes'
import {usePathname} from 'next/navigation'
import React, {useEffect} from 'react'
import {getViewerId, zViewerFromUnverifiedJwtToken} from '@openint/cdk'
import {TRPCProvider} from '@openint/engine-frontend'
import {Toaster} from '@openint/ui'
import {__DEBUG__} from '@/../app-config/constants'
import {browserAnalytics} from '@/lib-client/analytics-browser'
import {createQueryClient} from '../lib-client/react-query-client'
import {EventPoller} from './EventPoller'
import type {AsyncStatus} from './viewer-context'
import {ViewerContext} from './viewer-context'

export function ClientRootWithClerk(props: {
  children: React.ReactNode
  /** Viewer will be inferred from this... */
  initialAccessToken?: string | null
}) {
  const auth = useAuth()
  const status: AsyncStatus = auth.isLoaded ? 'loading' : 'success'

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(globalThis as any).auth = auth

  return (
    <ClientRoot
      {...props}
      accessToken={props.initialAccessToken}
      trpcAccessToken={null} // Workaround for token expired error
      authStatus={status}
    />
  )
}

export function ClientRoot({
  authStatus: status,
  accessToken,
  children,
  trpcAccessToken,
}: {
  children: React.ReactNode
  /** Viewer will be inferred from this... */
  accessToken?: string | null
  /**
   * temporary solution to token expired error.. As authorization header
   * prevents clerk from using cookie auth
   * @see https://clerk.com/docs/request-authentication/cross-origin
   */
  trpcAccessToken?: string | null
  authStatus: AsyncStatus
}) {
  const pathname = usePathname()

  console.log('[ClientRoot] rendering initialToken?', accessToken != null)

  const viewer = React.useMemo(
    () => zViewerFromUnverifiedJwtToken.parse(accessToken),
    [accessToken],
  )

  // NOTE: Recreate query client does not seem to do the trick... so we explicitly invalidate
  const {current: queryClient} = React.useRef(createQueryClient())
  useEffect(() => {
    console.log('invalidate all queries')
    void queryClient.invalidateQueries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getViewerId(viewer)])

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(globalThis as any).accessToken = accessToken

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(globalThis as any).viewer = viewer
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(globalThis as any).queryClient = queryClient

  useEffect(() => {
    if (process.env['NEXT_PUBLIC_POSTHOG_WRITEKEY']) {
      browserAnalytics.init(process.env['NEXT_PUBLIC_POSTHOG_WRITEKEY']!)
    }
  }, [])

  useEffect(() => {
    if (status === 'success') {
      browserAnalytics.identify(getViewerId(viewer), {
        email: undefined,
      })
    }
    if (pathname) {
      browserAnalytics.track({
        // @ts-expect-error only this useEffect should track navigation
        name: 'pageview',
        data: {
          current_url: window.origin + pathname,
          path: pathname,
        },
      })
    }
  }, [pathname, status])
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider
        debug={__DEBUG__}
        queryClient={queryClient}
        accessToken={
          trpcAccessToken !== undefined ? trpcAccessToken : accessToken
        }>
        <ViewerContext.Provider
          value={React.useMemo(
            () => ({accessToken, status, viewer}),
            [accessToken, status, viewer],
          )}>
          {/* Default theme needs to be light otherwise if set to system
            1) Darkmode does not work properly yet, esp on integrations page
            2) tailwind seems to have issue including .dark color scheme  https://github.com/shadcn/ui/issues/515
             */}
          <ThemeProvider attribute="class" enableSystem defaultTheme="light">
            <EventPoller accessToken={accessToken} />
            {children}
            <Toaster />
          </ThemeProvider>
        </ViewerContext.Provider>
      </TRPCProvider>
    </QueryClientProvider>
  )
}
