'use client'

import {useOrganization, useUser} from '@clerk/nextjs'
import {Loader2, Lock, Pencil, Plus} from 'lucide-react'
import Image from 'next/image'
import React, {useState} from 'react'
import {isProd} from '@openint/app-config/constants'
import {zConnectorStage, zVerticalKey} from '@openint/cdk'
import type {RouterOutput} from '@openint/engine-backend'
import {_trpcReact} from '@openint/engine-frontend'
import type {ConnectorMeta} from '@openint/ui'
import {
  ConnectorCard as _ConnectorCard,
  ConnectorConfigCard as _ConnectorConfigCard,
  ConnectorLogo,
} from '@openint/ui/domain-components'
import {
  Badge,
  Button,
  Card,
  CardContent,
} from '@openint/shadcn/ui'
import {DataTable} from '@openint/ui/components'
import {cn, parseCategory} from '@openint/ui/utils'
import CalendarBooking from '@openint/ui/components/CalendarBooking'
import {inPlaceSort, R, titleCase} from '@openint/util'
import useRefetchOnSwitch from '../useRefetchOnSwitch'
import {ConnectorConfigSheet} from './ConnectorConfigSheet'

const CTA_LINK = 'ap-openint/request-integration'
const CTA_DESCRIPTION =
  'Request any integration. Pay $1k, and within 72 hours, one of our partners will build support for it on OpenInt.'
const CTA_HEADER = 'Request Integration Service'
const DEFAULT_DESCRIPTION =
  'Grab some time with our founder to help you get the best out of OpenInt'
const DEFAULT_HEADER = 'Book a Free Discovery Meeting'

export type ConnectorConfig = RouterOutput['adminListConnectorConfigs'][number]

export default function ConnectorConfigsPage({
  showCTAs = true,
}: {
  showCTAs?: boolean
}) {
  const [openCalendar, setOpenCalendar] = useState(false)
  const [calProps, setCalProps] = useState<
    | {
        description: string
        header: string
        link?: string
      }
    | undefined
  >(undefined)
  const [sheetState, setSheetState] = useState<{
    open: boolean
    connectorName?: string
    connectorConfig?: Omit<ConnectorConfig, 'connectorName'>
  }>({
    open: false,
  })
  const {user} = useUser()
  const {organization} = useOrganization()

  const orgPublicMetadata = organization?.publicMetadata
  const isWhitelisted = orgPublicMetadata?.['whitelisted'] === true

  const connectorConfigsRes = _trpcReact.adminListConnectorConfigs.useQuery()

  useRefetchOnSwitch(connectorConfigsRes.refetch)

  // either if whitelisted or already has a connector other than default postgres
  const canAddNewConnectors =
    !isProd ||
    isWhitelisted ||
    connectorConfigsRes.data?.some(
      (c) => c.connectorName !== 'default_postgres',
    )
  const catalog = _trpcReact.listConnectorMetas.useQuery()
  if (!connectorConfigsRes.data || !catalog.data) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-button" />
      </div>
    )
  }

  const filter = (c: ConnectorConfig) =>
    c.displayName !== 'Default Postgres Connector for sync'

  const closeCalendar = () => {
    setOpenCalendar(false)
    setCalProps(undefined)
  }

  const handleOpenSheet = (
    name: string,
    config?: Omit<ConnectorConfig, 'connectorName'>,
  ) => {
    setSheetState({
      open: true,
      connectorName: name,
      connectorConfig: config,
    })
  }

  return (
    <div className="max-w-[70%] p-6">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">
        Configured connectors
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Manage and edit your existing integrations here to ensure your workflows
        run smoothly.
      </p>
      {connectorConfigsRes.data ? (
        <DataTable
          query={connectorConfigsRes}
          filter={filter}
          onRowClick={(row) => {
            handleOpenSheet(row.connectorName, row)
          }}
          columns={[
            {
              id: 'connectorName',
              accessorKey: 'connectorName',
              cell: ({row}) => {
                const connector = catalog.data[row.original.connectorName]

                return (
                  <div className="flex items-center gap-4">
                    <ConnectorLogo
                      connector={
                        catalog.data[
                          row.original.connectorName
                        ] as ConnectorMeta
                      }
                      className="size-12"
                    />
                    {row.original.displayName ? (
                      <div className="flex flex-row gap-2">
                        <p className="font-semibold">
                          {`${row.original.displayName}`}
                        </p>
                        <p>{`(${titleCase(row.original.connectorName)})`}</p>
                      </div>
                    ) : (
                      <p>{titleCase(row.original.connectorName)}</p>
                    )}
                    {connector && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          connector.stage === 'ga' && 'bg-green-200',
                          connector.stage === 'beta' && 'bg-blue-200',
                          connector.stage === 'alpha' && 'bg-pink-50',
                        )}>
                        {parseCategory(connector.stage)}
                      </Badge>
                    )}
                  </div>
                )
              },
            },
            {
              id: 'disable',
              accessorKey: 'Status',
              cell: ({row}) => (
                <p className={cn(row.original.disabled && 'opacity-60')}>
                  {row.original.disabled ? 'Disabled' : 'Enabled'}
                </p>
              ),
            },
            {accessorKey: 'envName'},
            {
              id: 'action',
              accessorKey: 'action',
              cell: ({row}) => {
                const connector = catalog.data[row.original.connectorName]
                if (!connector) return null
                return (
                  <Button
                    variant="secondary"
                    className="size-sm flex items-center gap-2"
                    onClick={() => {
                      handleOpenSheet(row.original.connectorName, row.original)
                    }}>
                    <Pencil className="h-5 w-5 text-black" />
                    <span className="text-black">Edit</span>
                  </Button>
                )
              },
            },
          ]}
        />
      ) : (
        <div>No connectors configured</div>
      )}
      {/* Spacer */}
      <div className="mt-4" />
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">
        Available connectors
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Select an integration from the list below to add it to your App.
      </p>
      {zVerticalKey.options.map((vertical) => {
        const stageByIndex = R.mapToObj.indexed(
          zConnectorStage.options,
          (o, i) => [o, i],
        )
        const connectors = inPlaceSort(
          Object.values(catalog.data).filter(
            (p) => p.verticals.includes(vertical) && p.stage !== 'hidden',
          ),
        ).desc((p) => stageByIndex[p.stage])
        if (!connectors.length) {
          return null
        }
        const connectorsWithCTA = [
          ...connectors,
          {
            __typename: 'connector',
            name: 'request-access',
            displayName: `Request ${vertical} integration`,
            stage: 'alpha',
            platforms: [],
            verticals: [vertical],
            sourceStreams: [],
            supportedModes: ['source'],
            hasPreConnect: false,
            hasUseConnectHook: false,
            schemas: {},
          } as unknown as ConnectorMeta,
        ]

        connectorsWithCTA.forEach((connector, i) => {
          if (!connector) {
            console.warn(
              `connector ${i} is undefined in vertical ${vertical}`,
              connectorsWithCTA,
            )
          }
        })

        return (
          <div key={vertical}>
            <h3 className="ml-4 text-xl font-semibold tracking-tight">
              {titleCase(vertical)}
            </h3>
            <div className="mb-4 flex flex-wrap">
              {connectorsWithCTA.map((connector, index) =>
                index < connectorsWithCTA.length - 1 && connector ? (
                  <ConnectorCard
                    key={`${vertical}-${connector.name}`}
                    connector={connector}>
                    {showCTAs &&
                      (connector.stage === 'alpha' || !canAddNewConnectors ? (
                        <div
                          className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-button"
                          onClick={() => setOpenCalendar(true)}>
                          <Lock />
                          <p className="text-sm font-semibold">
                            Request access
                          </p>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-button',
                          )}
                          onClick={() => {
                            handleOpenSheet(connector.name, undefined)
                          }}>
                          <Plus />
                          <p className="text-sm font-semibold">Add</p>
                        </div>
                      ))}
                  </ConnectorCard>
                ) : (
                  <Card
                    key={`${vertical}-request-access`}
                    className="group m-3 size-[150px] cursor-pointer border border-border bg-gray-100 transition-colors duration-150 hover:bg-gray-50">
                    <CardContent
                      className="flex size-full flex-1 flex-col items-center justify-center pt-4"
                      onClick={() => {
                        setCalProps({
                          description: CTA_DESCRIPTION,
                          header: CTA_HEADER,
                          link: CTA_LINK,
                        })
                        setOpenCalendar(true)
                      }}>
                      <p className="text-center text-sm font-semibold text-gray-600 transition-colors duration-150 group-hover:text-gray-400">
                        Request {parseCategory(vertical)} Integration
                      </p>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </div>
        )
      })}
      {sheetState.open && sheetState.connectorName && (
        <ConnectorConfigSheet
          connectorName={sheetState.connectorName}
          connectorConfig={sheetState.connectorConfig}
          open={sheetState.open}
          setOpen={(open) => setSheetState((prev) => ({...prev, open}))}
          refetch={connectorConfigsRes.refetch}
        />
      )}
      {isProd && (
        <CalendarBooking
          description={calProps?.description ?? DEFAULT_DESCRIPTION}
          header={calProps?.header ?? DEFAULT_HEADER}
          isVisible={openCalendar}
          onClose={closeCalendar}
          onDismiss={closeCalendar}
          email={
            user?.emailAddresses?.length
              ? user?.emailAddresses?.[0]?.emailAddress
              : undefined
          }
          name={
            user?.firstName && user?.lastName
              ? `${user?.firstName} ${user?.lastName}`
              : undefined
          }
        />
      )}
    </div>
  )
}

const ConnectorCard = (props: React.ComponentProps<typeof _ConnectorCard>) => (
  <_ConnectorCard
    Image={Image as any}
    showStageBadge
    className="cursor-pointer"
    {...props}
  />
)
