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
  cn,
  ConnectorLogo,
  DataTable,
  parseCategory,
} from '@openint/ui'
import CalendarBooking from '@openint/ui/components/CalendarBooking'
import {inPlaceSort, R, titleCase} from '@openint/util'
import {ConnectorConfigSheet} from './ConnectorConfigSheet'

export type ConnectorConfig = RouterOutput['adminListConnectorConfigs'][number]

export default function ConnectorConfigsPage({
  showCTAs = true,
}: {
  showCTAs?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [connectorName, setConnectorName] = useState<string>('')
  const [connectorConfig, setConnectorConfig] = useState<
    Omit<ConnectorConfig, 'connectorName'> | undefined
  >(undefined)
  const {user} = useUser()
  const isWhitelisted = user?.publicMetadata?.['whitelisted'] === true
  const connectorConfigsRes = _trpcReact.adminListConnectorConfigs.useQuery()
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

  return (
    <div className="max-w-[60%] p-6">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">
        Configured connectors
      </h2>
      {connectorConfigsRes.isFetching && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {connectorConfigsRes.data ? (
        <DataTable
          query={connectorConfigsRes}
          filter={filter}
          onRowClick={(row) => {
            setConnectorName(row.connectorName)
            setConnectorConfig(row)
            setOpen(true)
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
                      setConnectorName(row.original.connectorName)
                      setConnectorConfig(row.original)
                      setOpen(true)
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
        return (
          <div key={vertical}>
            <h3 className="mb-4 ml-4 text-xl font-semibold tracking-tight">
              {titleCase(vertical)}
            </h3>
            <div className="flex flex-wrap">
              {connectors.map((connector) => (
                <ConnectorCard
                  key={`${vertical}-${connector.name}`}
                  connector={connector}>
                  {showCTAs &&
                    (connector.stage === 'alpha' || !isWhitelisted ? (
                      <div
                        className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-button"
                        onClick={() => setOpenCalendar(true)}>
                        <Lock />
                        <p className="text-sm font-semibold">Request access</p>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-button',
                        )}
                        onClick={() => {
                          setConnectorName(connector.name)
                          setConnectorConfig(undefined)
                          setOpen(true)
                        }}>
                        <Plus />
                        <p className="text-sm font-semibold">Add</p>
                      </div>
                    ))}
                </ConnectorCard>
              ))}
            </div>
          </div>
        )
      })}
      <ConnectorConfigSheet
        connectorName={connectorName}
        connectorConfig={connectorConfig}
        open={open}
        setOpen={setOpen}
      />
      <CalendarBooking
        description="Grab some time with our founder to help you get the best out of OpenInt"
        header="Book a Free Discovery Meeting"
        isVisible={openCalendar}
        onClose={() => setOpenCalendar(false)}
        onDismiss={() => setOpenCalendar(false)}
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
