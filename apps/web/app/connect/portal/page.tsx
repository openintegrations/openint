// import {clerkClient} from '@clerk/nextjs/server'
// import Image from 'next/image'
// import nextDynamic from 'next/dynamic'
import {kAccessToken} from '@openint/app-config/constants'
import {getViewerId} from '@openint/cdk'
import {zConnectPageParams} from '@openint/engine-backend/router/customerRouter'
import {AGConnectionPortal, ConnectionPortal} from '@openint/engine-frontend'
import {ClientRoot} from '@/components/ClientRoot'
import {ColorConfig} from '@/components/ColorConfig'
import {SuperHydrate} from '@/components/SuperHydrate'
import {createServerComponentHelpers} from '@/lib-server/server-component-helpers'

export const metadata = {
  title: 'OpenInt Connection Management Portal',
}

/**
 * Workaround for searchParams being empty on production. Will ahve to check
 * @see https://github.com/vercel/next.js/issues/43077#issuecomment-1383742153
 */
export const dynamic = 'force-dynamic'

// Should we allow page to optionally load without token for performance then add token async
// Perhaps it would even be an advantage to have the page simply be static?
// Though that would result in waterfall loading of integrations

// Workaround for hydration issues by completely disabling SSR for now...
// except it does not work because next/dynamic only works on client components
// https://stackoverflow.com/a/57173209/69249`9
// const DynamicConnectionPortal = nextDynamic(
//   () => Promise.resolve(ConnectionPortal),
//   {ssr: false},
// )

/**
 * Embed this fully featured page to allow customers to fully manage their own resources
 * Include checking sync status, adding, removing, and reauthenticating their connections
 */
export default async function PortalPage({
  //  https://beta.nextjs.org/docs/api-reference/file-conventions/page#searchparams-optional
  searchParams,
}: {
  // Search params in Next.js are only accessible in PageComponent and no accessible in layout component, too bad
  // @see https://github.com/vercel/next.js/issues/43704
  searchParams: Record<string, string | string[] | undefined>
}) {
  const {token} = zConnectPageParams.parse(searchParams)
  const {getDehydratedState, viewer} = await createServerComponentHelpers({
    searchParams: {[kAccessToken]: token},
  })
  if (viewer.role !== 'customer') {
    return (
      <div>Authenticated user only. Your role is {getViewerId(viewer)}</div>
    )
  }

  const isAgMode =
    // orgs in openint clerk app
    viewer.orgId === 'org_2nJZrA4Dk8i3wszhm6PsP3M2Vwy' ||
    viewer.orgId === 'org_2lcCCimyICKI8cpPNQt195h5zrP' ||
    viewer.orgId === 'org_2ms9FdeczlbrDIHJLcwGdpv3dTx' ||
    // orgs in ag app
    viewer.orgId === 'org_2pBMOEKROMpNR7zckHtah4ebxAk' ||
    viewer.orgId === 'org_2pBM0RSOqs5QzZi40A73hZ5aTjD'

  return (
    <ClientRoot accessToken={viewer.accessToken} authStatus="success">
      <SuperHydrate dehydratedState={getDehydratedState()}>
        <ColorConfig orgId={viewer.orgId} />
        {isAgMode ? <AGConnectionPortal /> : <ConnectionPortal />}
      </SuperHydrate>
    </ClientRoot>
  )
}
