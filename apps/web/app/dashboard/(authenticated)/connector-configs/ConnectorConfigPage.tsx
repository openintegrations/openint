'use client'

import {useUser} from '@clerk/nextjs'
import {Loader2, Lock, Pencil, Plus} from 'lucide-react'
import Image from 'next/image'
import React, {useState} from 'react'
import {zConnectorStage, zVerticalKey} from '@openint/cdk'
import type {RouterOutput} from '@openint/engine-backend'
import {_trpcReact} from '@openint/engine-frontend'
import type {ConnectorMeta} from '@openint/ui'
import {
  ConnectorCard as _ConnectorCard,
  ConnectorConfigCard as _ConnectorConfigCard,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  ConnectorLogo,
  DataTable,
  parseCategory,
} from '@openint/ui'
import CalendarBooking from '@openint/ui/components/CalendarBooking'
import {inPlaceSort, R, titleCase} from '@openint/util'
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
  const connectorConfigsRes = _trpcReact.adminListConnectorConfigs.useQuery()

  // either if whitelisted or already has a connector other than default postgres
  const canAddNewConnectors =
    user?.publicMetadata?.['whitelisted'] === true ||
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
    <div className="max-w-[60%] p-6">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">
        Configured connectors
      </h2>
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

        return (
          <div key={vertical}>
            <h3 className="mb-4 ml-4 text-xl font-semibold tracking-tight">
              {titleCase(vertical)}
            </h3>
            <div className="flex flex-wrap">
              {connectorsWithCTA.map((connector, index) =>
                index < connectorsWithCTA.length - 1 ? (
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
                    className="m-3 size-[150px] border-button bg-button-light hover:cursor-pointer">
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
                      <p className="text-center text-button">
                        Request {parseCategory(vertical)} integration
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
