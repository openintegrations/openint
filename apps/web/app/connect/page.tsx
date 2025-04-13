import type {Id, Viewer} from '@openint/cdk'
import type {PageProps} from '@/lib-common/next-utils'
import type {ConnectorConfigForCustomer} from './client'

import {ChevronLeftIcon} from 'lucide-react'
import Image from 'next/image'
import {cache, Suspense} from 'react'
import {zConnectOptions} from '@openint/api-v1/routers/connect.models'
import {type ConnectorName} from '@openint/api-v1/routers/connector.models'
import {asOrgIfCustomer} from '@openint/cdk'
import {getClerkOrganization} from '@openint/console-auth/server'
import {isProduction} from '@openint/env'
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
import {TRPCApp} from '@/lib-client/TRPCApp'
import {Link} from '@/lib-common/Link'
import {parsePageProps} from '@/lib-common/next-utils'
import {
  currentViewer,
  currentViewerFromPageProps,
} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {GlobalCommandBarProvider} from '../../lib-client/GlobalCommandBarProvider'
import {AddConnectionInner, MyConnectionsClient} from './client'
import {TabsClient} from './Tabs.client'

function Fallback() {
  return <div>Loading...</div>
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

export default async function Page(
  pageProps: PageProps<never, {view?: string; connector_name?: string}>,
) {
  const {viewer, token, payload} = isProduction
    ? await currentViewerFromPageProps(pageProps)
    : await currentViewer(pageProps)

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

  const api = createAPICaller(viewer)
  const viewerConnections = await api.listConnections({
    connector_names: searchParams.connector_names,
    expand: ['connector'],
  })
  return (
    <TRPCApp token={token}>
      <GlobalCommandBarProvider>
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
        <div className="flex h-screen w-full">
          {/* Left Banner - Hidden on mobile and tablets, shown only on lg+ screens */}
          <div className="bg-primary/10 hidden lg:flex lg:w-[450px]">
            <div className="flex flex-col items-start p-8">
              <Suspense
                fallback={
                  <div className="h-[50px] w-[50px] animate-pulse rounded-full bg-gray-200" />
                }>
                <OrganizationImage orgId={viewer.orgId} className="lg:pt-6" />
              </Suspense>

              <h1 className="mb-4 mt-16 text-2xl font-bold">
                Connect Your Services
              </h1>
              <p className="text-muted-foreground">
                Integrate your favorite tools and services with our platform.
                Manage all your connections in one place.
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
            defaultValue={viewerConnections.items.length > 0 ? 'manage' : 'add'}
            paramKey="view"
            className="flex-1 p-4 lg:pt-12">
            <div className="mx-auto w-full max-w-4xl">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Manage Integrations</TabsTrigger>
                <TabsTrigger value="add">Add New Integration</TabsTrigger>
              </TabsList>
              <TabsContent value="manage" className="pt-2">
                <Suspense fallback={<Fallback />}>
                  <MyConnectionsClient
                    connector_names={searchParams.connector_names}
                    initialData={viewerConnections}
                  />
                </Suspense>
              </TabsContent>
              <TabsContent value="add" className="pt-2">
                <Suspense fallback={<Fallback />}>
                  <AddConnections
                    viewer={viewer}
                    connector_names={searchParams.connector_names}
                  />
                </Suspense>
              </TabsContent>
            </div>
          </TabsClient>
        </div>
      </GlobalCommandBarProvider>
    </TRPCApp>
  )
}

/** This needs to happen server side for preConnect to work */
async function AddConnections({
  viewer,
  connector_names,
}: {
  viewer: Viewer
  connector_names?: ConnectorName[]
}) {
  // We need to elevate the role to org  to list connector config here
  // Alternative we'd have to modify RLS rules to allow this
  const api = createAPICaller(asOrgIfCustomer(viewer))

  const res = await api.listConnectorConfigs({
    connector_names,
    expand: ['connector.schemas'], // TODO: FIXME to use an array instead of a string
  })

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
  // TODO: DO -> in case there are ccfgs but the user already has connected one of them
  // THEN -> Check if that ccfg allows multiple of those connections and if so enable them to add it
  // FINALLY -> if at the end of this its not possible to crease new connections show a user friendly message
  // "You have configured all enabled integrations. If you'd like to enable new ones please contact the {organizationName} support team"

  return (
    <div className="flex flex-col gap-4">
      {res.items.map((ccfg) => (
        <Suspense key={ccfg.id} fallback={<Fallback />}>
          <AddConnectionServer
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
        </Suspense>
      ))}
    </div>
  )
}

function AddConnectionServer({
  viewer,
  connectorConfig,
}: {
  viewer: Viewer
  connectorConfig: ConnectorConfigForCustomer
}) {
  const api = createAPICaller(viewer)
  const name = connectorConfig.connector_name
  const res = api.preConnect({
    connector_config_id: connectorConfig.id,
    discriminated_data: {connector_name: name, pre_connect_input: {}},
    options: {},
  })

  return (
    <AddConnectionInner connectorConfig={connectorConfig} initialData={res} />
  )
}
