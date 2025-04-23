import type {Id, Viewer} from '@openint/cdk'
import type {PageProps} from '@/lib-common/next-utils'
import type {ConnectorConfigForCustomer} from './AddConnection.client'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {ChevronLeftIcon} from 'lucide-react'
import Image from 'next/image'
import {cache, Suspense} from 'react'
import {ConnectionExpanded} from '@openint/api-v1/models'
import {zConnectOptions} from '@openint/api-v1/trpc/routers/connect.models'
import {type ConnectorName} from '@openint/api-v1/trpc/routers/connector.models'
import {asOrgIfCustomer} from '@openint/cdk'
import {getClerkOrganization} from '@openint/console-auth/server'
import {cn} from '@openint/shadcn/lib/utils'
import {Button} from '@openint/shadcn/ui'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@openint/shadcn/ui/card'
import {TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import {LoadingSpinner} from '@openint/ui-v1'
import {GlobalCommandBarProvider} from '@/lib-client/GlobalCommandBarProvider'
import {TRPCApp} from '@/lib-client/TRPCApp'
import {Link, resolveLinkPath} from '@/lib-common/Link'
import {parsePageProps} from '@/lib-common/next-utils'
import {createQueryClient} from '@/lib-common/trpc.common'
import {
  getServerComponentContext,
  serverComponentContextForViewer,
} from '@/lib-server/trpc.server'
import {AddConnectionCard} from './AddConnection.client'
import {ConnectContextProvider} from './ConnectContextProvider'
import {ConnectOpWrapper} from './ConnectOpWrapper'
import {MyConnectionsClient} from './MyConnections.client'
import {TabsClient} from './page.client'

export default async function ConnectPage(
  pageProps: PageProps<never, {view?: string; connector_name?: string}>,
) {
  const {
    queryClient,
    trpc,
    tokenPayload: payload,
    token,
    viewer,
  } = await getServerComponentContext(pageProps)

  if (viewer.role === 'anon' || !viewer.orgId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              Please use a magic link provided to you to manage your
              integrations.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/console">Go to OpenInt Console</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: zConnectOptions,
  })

  // now override any searchParams from options in the token.connect_options object as those are signed
  if (
    payload?.connect_options &&
    Object.keys(payload.connect_options).length > 0
  ) {
    for (const [key, value] of Object.entries(payload.connect_options)) {
      searchParams[key as keyof typeof searchParams] = value as any
    }
  }

  // NOTE: we are not currently setting these but leaving these in the code for now
  // to make it easier to add them in the future
  const themeVariables = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([key]) => key.startsWith('--')) // Only include theme variables
      .map(([key, value]) => [key, value]),
  )

  const viewerConnections = await queryClient.fetchQuery(
    trpc.listConnections.queryOptions({
      connector_names: searchParams.connector_names,
      expand: ['connector'],
    }),
  )

  // TODO: Splitting the layout out of here.
  // Given that layout.tsx cannot access params, perhaps we should put token as a path segment?
  return (
    <TRPCApp token={token}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <GlobalCommandBarProvider>
          <ConnectContextProvider>
            <style
              dangerouslySetInnerHTML={{
                __html: `
          :root {
            ${Object.entries(themeVariables)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n')}
          }
        `,
              }}
            />
            {searchParams.debug && (
              <pre>
                {JSON.stringify(
                  {
                    viewer,
                    searchParams,
                    token,
                  },
                  null,
                  2,
                )}
              </pre>
            )}
            <ConnectOpWrapper>
              <div className="flex min-h-screen w-full">
                {/* Left Banner - Hidden on mobile and tablets, shown only on lg+ screens */}
                <div className="bg-primary/10 hidden lg:flex lg:w-[450px]">
                  <div className="flex flex-col items-start p-8">
                    <Suspense
                      fallback={
                        <div className="h-[50px] w-[50px] animate-pulse rounded-full bg-gray-200" />
                      }>
                      <OrganizationImage
                        orgId={viewer.orgId}
                        className="lg:pt-6"
                      />
                    </Suspense>

                    <h1 className="mb-4 mt-16 text-2xl font-bold">
                      Connect Your Services
                    </h1>
                    <p className="text-muted-foreground">
                      Integrate your favorite tools and services with our
                      platform. Manage all your connections in one place.
                    </p>
                    <Button variant="ghost" className="mt-8">
                      <Link href="/console" className="flex items-center gap-2">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to{' '}
                        <Suspense fallback="OpenInt Console">
                          <OrganizationName orgId={viewer.orgId} />
                        </Suspense>
                      </Link>
                    </Button>

                    <div className="text-muted-foreground mt-auto flex items-center gap-0.5 self-end text-sm">
                      <span>Powered by</span>
                      {/* TODO: in future take to a specific landing page for that customer saying XX uses OpenInt to power their integrations */}
                      <a
                        href="https://openint.dev?ref=connect"
                        target="_blank"
                        rel="noopener"
                        className="font-semibold">
                        OpenInt
                      </a>
                    </div>
                  </div>
                </div>

                {/* Main Content Area - Full width on mobile, flex-1 on larger screens */}

                <TabsClient
                  defaultValue={
                    viewerConnections.items.length > 0 ? 'manage' : 'add'
                  }
                  paramKey="view"
                  className="flex-1 p-4 lg:pt-12">
                  <div className="mx-auto w-full max-w-4xl">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="manage">
                        Manage Integrations
                      </TabsTrigger>
                      <TabsTrigger value="add">Add New Integration</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manage" className="pt-6">
                      <Suspense fallback={<LoadingSpinner />}>
                        <MyConnectionsClient
                          connector_names={searchParams.connector_names}
                        />
                      </Suspense>
                    </TabsContent>
                    <TabsContent value="add" className="pt-6">
                      <Suspense fallback={<LoadingSpinner />}>
                        <AddConnections
                          viewer={viewer}
                          connector_names={searchParams.connector_names}
                          existingConnections={viewerConnections.items}
                        />
                      </Suspense>
                    </TabsContent>
                  </div>
                </TabsClient>
              </div>
            </ConnectOpWrapper>
          </ConnectContextProvider>
        </GlobalCommandBarProvider>
      </HydrationBoundary>
    </TRPCApp>
  )
}

/** This needs to happen server side for preConnect to work */
async function AddConnections({
  viewer,
  connector_names,
  existingConnections,
}: {
  viewer: Viewer
  connector_names?: ConnectorName[]
  existingConnections: ConnectionExpanded[]
}) {
  // We need to elevate the role to org  to list connector config here
  // Alternative we'd have to modify RLS rules to allow this
  const {trpc, queryClient} = serverComponentContextForViewer(
    asOrgIfCustomer(viewer),
  )

  const res = await queryClient.fetchQuery(
    trpc.listConnectorConfigs.queryOptions({
      connector_names,
      expand: ['connector.schemas'],
    }),
  )

  if (!res?.items?.length || res.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-muted-foreground">
          There are no connectors configured for this organization.
        </p>
        <Button asChild variant="default">
          <Link href="/console" target="_blank">
            Go to OpenInt Console
          </Link>
        </Button>
      </div>
    )
  }

  const availableToConnect = res.items.filter(
    (ccfg) =>
      // Allow custom connectors to be added multiple times
      ccfg.connector?.authType === 'CUSTOM' ||
      // For non-custom connectors, only include if they don't already exist
      (!existingConnections.some(
        (conn) => conn.connector_config_id === ccfg.id,
      ) &&
        ccfg.connector?.authType),
  )

  if (!availableToConnect?.length || availableToConnect.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-muted-foreground">
          You have already connected all available integrations.
        </p>
        <Button asChild variant="default">
          {/* TODO: Make this more type safe */}
          <Link href={resolveLinkPath('/connect') + '?view=manage'}>
            Manage Integrations
          </Link>
        </Button>
      </div>
    )
  }
  // TODO: DO -> in case there are ccfgs but the user already has connected one of them
  // THEN -> Check if that ccfg allows multiple of those connections and if so enable them to add it
  // FINALLY -> if at the end of this its not possible to crease new connections show a user friendly message
  // "You have configured all enabled integrations. If you'd like to enable new ones please contact the {organizationName} support team"

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<LoadingSpinner />}>
        {availableToConnect.map((ccfg) => (
          <AddConnectionCardPrefetch
            key={ccfg.id}
            connectorConfig={{
              // NOTE: Be extremely careful that sensitive data is not exposed here
              // TODO: Consider using row level security make asOrgIfCustomer unnecessary
              id: ccfg.id,
              connector_name: ccfg.connector_name,
              connector: ccfg.connector,
            }}
            viewer={viewer}
          />
        ))}
      </Suspense>
    </div>
  )
}

function AddConnectionCardPrefetch({
  viewer,
  connectorConfig,
}: {
  viewer: Viewer
  connectorConfig: ConnectorConfigForCustomer
}) {
  const {trpc} = serverComponentContextForViewer(viewer)
  // create a fresh query client to avoid having to send down more cache
  const queryClient = createQueryClient()

  const name = connectorConfig.connector_name
  void queryClient.prefetchQuery(
    trpc.preConnect.queryOptions({
      connector_config_id: connectorConfig.id,
      discriminated_data: {connector_name: name, pre_connect_input: {}},
      options: {},
    }),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AddConnectionCard connectorConfig={connectorConfig} />
    </HydrationBoundary>
  )
}

const getOrganizationInfo = cache(async (orgId: Id['org'] | null) =>
  orgId ? await getClerkOrganization(orgId) : {name: 'OpenInt', imageUrl: ''},
)

async function OrganizationImage({
  orgId,
  className,
}: {
  orgId: string | null
  className?: string
}) {
  if (!orgId) return null
  const {imageUrl, name} = await getOrganizationInfo(orgId as Id['org'])

  if (!imageUrl) return null

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src={imageUrl}
        alt={name || 'Organization Logo'}
        width={25}
        height={25}
      />
      <span className="ml-2">{name || 'Organization Name'}</span>
    </div>
  )
}

async function OrganizationName({orgId}: {orgId: string | null}) {
  if (!orgId) return 'OpenInt Console'
  const {name} = await getOrganizationInfo(orgId as Id['org'])
  return <>{name || 'OpenInt Console'}</>
}
