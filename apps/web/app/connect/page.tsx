import {ChevronLeftIcon} from 'lucide-react'
import Link from 'next/link'
import {Suspense} from 'react'
import {connectClientOptions} from '@openint/api-v1/routers/connect.models'
import {type ConnectorName} from '@openint/api-v1/routers/connector.models'
import {asOrgIfCustomer, type Viewer} from '@openint/cdk'
import {isProduction} from '@openint/env'
import {Button} from '@openint/shadcn/ui'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@openint/shadcn/ui/card'
import {TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import {parsePageProps, type PageProps} from '@/lib-common/next-utils'
import {
  currentViewer,
  currentViewerFromPageProps,
} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../console/(authenticated)/client'
import {GlobalCommandBarProvider} from '../GlobalCommandBarProvider'
import {
  AddConnectionInner,
  ConnectorConfigForCustomer,
  MyConnectionsClient,
} from './client'
import {TabsClient} from './Tabs.client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(
  pageProps: PageProps<never, {view?: string; connector_name?: string}>,
) {
  const {viewer, token} = isProduction
    ? // in production we only want to take a token parameter
      await currentViewerFromPageProps(pageProps)
    : // In dev we can work with Clerk cookies to know the 'viewer'
      await currentViewer(pageProps)

  if (viewer.role === 'anon') {
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
              {/* We do this as in production the renderer may be connect.openint.dev */}
              <Link
                href={
                  isProduction ? 'https://console.openint.dev' : '/console'
                }>
                Go to OpenInt Console
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: connectClientOptions,
  })

  const themeVariables = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([key]) => key.startsWith('--')) // Only include theme variables
      .map(([key, value]) => [key, value]),
  )

  const api = createAPICaller(viewer)

  return (
    <ClientApp token={token!}>
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
              },
              null,
              2,
            )}
          </pre>
        )}
        <div className="flex h-screen w-full">
          {/* Left Banner - Hidden on mobile, shown on md+ screens */}
          <div className="bg-primary/10 hidden md:flex md:w-[320px] lg:w-[550px]">
            <div className="flex flex-col items-start p-8">
              {/* TODO: Add organization logo here */}
              <div className="h-48" />
              <h1 className="mb-4 text-2xl font-bold">Connect Your Services</h1>
              <p className="text-muted-foreground">
                Integrate your favorite tools and services with our platform.
                Manage all your connections in one place.
              </p>
              {/* Add back butt */}
              <Button asChild variant="ghost" className="mt-8">
                <Link href="/console" className="flex items-center gap-2">
                  <ChevronLeftIcon className="h-4 w-4" />
                  Back to Console
                </Link>
              </Button>
              <div className="text-muted-foreground mt-auto flex items-center gap-2 self-end text-sm">
                <span>Powered by</span>
                <span className="font-semibold">OpenInt</span>
              </div>
            </div>
          </div>

          {/* Main Content Area - Full width on mobile, flex-1 on larger screens */}

          <TabsClient
            defaultValue="my-connections"
            paramKey="tab"
            className="max-w-3xl flex-1 p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage connections</TabsTrigger>
              <TabsTrigger value="add">Add connection</TabsTrigger>
            </TabsList>
            <TabsContent value="manage" className="pt-2">
              <Suspense fallback={<Fallback />}>
                <MyConnectionsClient
                  connector_name={searchParams.connector_name}
                  initialData={api.listConnections({
                    connector_name: searchParams.connector_name,
                    expand: ['connector'],
                  })}
                />
              </Suspense>
            </TabsContent>
            <TabsContent value="add" className="pt-2">
              <Suspense fallback={<Fallback />}>
                <AddConnections
                  viewer={viewer}
                  connector_name={searchParams.connector_name}
                />
              </Suspense>
            </TabsContent>
          </TabsClient>
        </div>
      </GlobalCommandBarProvider>
    </ClientApp>
  )
}

/** This needs to happen server side for preConnect to work */
async function AddConnections({
  viewer,
  connector_name,
}: {
  viewer: Viewer
  connector_name?: ConnectorName
}) {
  // We need to elevate the role to org  to list connector config here
  // Alternative we'd have to modify RLS rules to allow this
  const api = createAPICaller(asOrgIfCustomer(viewer))

  const res = await api.listConnectorConfigs({
    connector_name,
    expand: ['connector.schemas'], // TODO: FIXME to use an array instead of a string
  })

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
    id: connectorConfig.id,
    data: {connector_name: name, input: {}},
    options: {},
  })

  return (
    <AddConnectionInner connectorConfig={connectorConfig} initialData={res} />
  )
}
