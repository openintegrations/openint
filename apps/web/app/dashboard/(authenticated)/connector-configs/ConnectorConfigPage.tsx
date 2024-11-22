'use client'

import {Loader2, Lock} from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import {zConnectorStage, zVerticalKey} from '@openint/cdk'
import type {RouterOutput} from '@openint/engine-backend'
import {_trpcReact} from '@openint/engine-frontend'
import type {ConnectorMeta} from '@openint/ui'
import {
  ConnectorCard as _ConnectorCard,
  ConnectorConfigCard as _ConnectorConfigCard,
  Badge,
  cn,
  ConnectorLogo,
  DataTable,
  LoadingText,
  parseCategory,
} from '@openint/ui'
import {inPlaceSort, R, titleCase} from '@openint/util'
import {ConnectorConfigSheet} from './ConnectorConfigSheet'

export type ConnectorConfig = RouterOutput['adminListConnectorConfigs'][number]

export default function ConnectorConfigsPage({
  showCTAs = true,
}: {
  showCTAs?: boolean
}) {
  const connectorConfigsRes = _trpcReact.adminListConnectorConfigs.useQuery()
  const catalog = _trpcReact.listConnectorMetas.useQuery()
  if (!connectorConfigsRes.data || !catalog.data) {
    return <LoadingText className="block p-4" />
  }

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
                  <ConnectorConfigSheet
                    connectorConfig={row.original}
                    connectorName={connector.name}
                  />
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
                    (connector.stage === 'alpha' ? (
                      <div
                        className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 text-button"
                        onClick={() =>
                          window.open(
                            `mailto:support@openint.dev?subject=Request%20access%20to%20${connector.displayName}%20connectors&body=My%20use%20case%20is...`,
                          )
                        }>
                        <Lock />
                        <p className="text-sm font-semibold">Request access</p>
                      </div>
                    ) : (
                      <ConnectorConfigSheet connectorName={connector.name} />
                    ))}
                </ConnectorCard>
              ))}
            </div>
          </div>
        )
      })}
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
