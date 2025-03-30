import {Suspense} from 'react'
import type {Viewer} from '@openint/cdk'
import {extractId} from '@openint/cdk'
import {TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import {z} from '@openint/util'
import {parsePageProps, type PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../console/(authenticated)/client'
import {GlobalCommandBarProvider} from '../GlobalCommandBarProvider'
import {AddConnectionInner, MyConnectionsClient} from './client'
import {TabsClient} from './Tabs.client'

function Fallback() {
  return <div>Loading...</div>
}

// TODO: Figure out why zod schema is not working when we have it in a separate file...

const zConnectV1SearchParams = z.object({
  connector_name: z
    .enum(['plaid', 'greenhouse'])
    .optional()
    .describe(
      'The name of the connector configuration to use. Default to all otherwise',
    ),
  tab: z.enum(['my-connections', 'add-connection']).optional().openapi({
    title: 'Default Tab',
    description:
      'The default tab to show when the magic link is opened. Defaults to "my-connections"',
  }),
  '--primary': z.string().optional(),
  '--background': z.string().optional(),
  '--foreground': z.string().optional(),
  '--card': z.string().optional(),
  '--card-foreground': z.string().optional(),
})

export default async function Page(
  pageProps: PageProps<never, {tab?: string; connector_name?: string}>,
) {
  const {viewer, token} = await currentViewer(pageProps)

  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: zConnectV1SearchParams,
  })

  const themeVariables = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([key]) => key.startsWith('--')) // Only include theme variables
      .map(([key, value]) => [key, value]),
  )

  const api = createAPICaller(viewer)

  return (
    <div>
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

      <pre className="bg-background">
        <code>{JSON.stringify(viewer, null, 2)}</code>
      </pre>
      <ClientApp token={token!}>
        <GlobalCommandBarProvider>
          {/* <TabsClient defaultValue={(await props.searchParams).tab ?? 'my-connections'}> */}

          <TabsClient defaultValue="my-connections" paramKey="tab">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-connections">My connections</TabsTrigger>
              <TabsTrigger value="add-connection">Add connection</TabsTrigger>
            </TabsList>
            <TabsContent value="my-connections" className="p-4">
              <Suspense fallback={<Fallback />}>
                <MyConnectionsClient
                  // TODO: How to avoid the duplicate construction of input parameters?
                  connector_name={searchParams.connector_name}
                  initialData={api.listConnections({
                    connector_name: searchParams.connector_name,
                    expand: ['connector'],
                  })}
                />
              </Suspense>
            </TabsContent>
            <TabsContent value="add-connection" className="p-4">
              <Suspense fallback={<Fallback />}>
                <AddConnections
                  viewer={viewer}
                  connector_name={searchParams.connector_name}
                />
              </Suspense>
            </TabsContent>
          </TabsClient>
        </GlobalCommandBarProvider>
      </ClientApp>
    </div>
  )
}

/** This needs to happen server side for preConnect to work */
async function AddConnections({
  viewer,
  connector_name,
}: {
  viewer: Viewer
  connector_name?: string
}) {
  const api = createAPICaller(viewer)

  const res = await api.listConnectorConfigs({
    connector_name,
  })

  return (
    <>
      {res.items.map((ccfg) => (
        <Suspense key={ccfg.id} fallback={<Fallback />}>
          <div key={ccfg.id} className="p-4">
            <h1 className="text-3xl">Add {ccfg.id} connection</h1>
            <AddConnectionServer connectorConfigId={ccfg.id} viewer={viewer} />
          </div>
        </Suspense>
      ))}
    </>
  )
}

function AddConnectionServer({
  viewer,
  connectorConfigId,
}: {
  viewer: Viewer
  connectorConfigId: string
}) {
  const api = createAPICaller(viewer)
  const name = extractId(connectorConfigId as `ccfg_${string}`)[1]
  const res = api.preConnect({
    id: connectorConfigId,
    data: {connector_name: name, input: {}},
    options: {},
  })

  return (
    <AddConnectionInner
      connectorConfigId={connectorConfigId}
      initialData={res}
    />
  )
}
