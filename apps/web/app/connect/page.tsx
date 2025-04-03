import {Suspense} from 'react'
import {connectClientOptions} from '@openint/api-v1/routers/customer.models'
import {asOrgIfCustomer, type Viewer} from '@openint/cdk'
import {TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import {parsePageProps, type PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
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
  const {viewer, token} = await currentViewer(pageProps)

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
    <div className="p-4">
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
      <ClientApp token={token!}>
        <GlobalCommandBarProvider>
          {/* <TabsClient defaultValue={(await props.searchParams).tab ?? 'my-connections'}> */}

          <TabsClient defaultValue="add" paramKey="view">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage connections</TabsTrigger>
              <TabsTrigger value="add">Add connection</TabsTrigger>
            </TabsList>
            <TabsContent value="manage" className="pt-2">
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
            <TabsContent value="add" className="pt-2">
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
  // We need to elevate the role to org  to list connector config here
  // Alternative we'd have to modify RLS rules to allow this
  const api = createAPICaller(asOrgIfCustomer(viewer))

  const res = await api.listConnectorConfigs({
    connector_name,
    expand: 'connector', // TODO: FIXME to use an array instead of a string
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
