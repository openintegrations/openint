'use client'

import {Loader2, Search} from 'lucide-react'
import {useSearchParams} from 'next/navigation'
import {useCallback, useEffect, useState} from 'react'
import type {Id} from '@openint/cdk'
import {Button, cn, Input, parseCategory, Separator} from '../lib/ui-components'
import {CheckboxFilter} from '@openint/ui/components/CheckboxFilter'
import {FilterBadges} from '@openint/ui/components/FilterBadges'
import {IntegrationCard} from '@openint/ui/domain-components/IntegrationCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'
import type {ConnectEventType} from '../hocs/WithConnectorConnect'
import {WithConnectorConnect} from '../hocs/WithConnectorConnect'
import {_trpcReact} from '../providers/TRPCProvider'

export function IntegrationSearch({
  className,
  connectorConfigs,
  onEvent,
}: {
  className?: string
  /** TODO: Make this optional so it is easier to use it as a standalone component */
  connectorConfigs: ConnectorConfig[]
  onEvent?: (event: {
    integration: {
      connectorConfigId: string
      id: string
    }
    type: ConnectEventType
  }) => void
}) {
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  // Main state after applying filters.
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])

  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? ''
  const integrationIds = searchParams.get('integrationIds')
  const connectorNames = searchParams.get('connectorNames')

  const integrationIdList = integrationIds?.split(',') ?? []
  const connectorNameList = connectorNames?.split(',') ?? []

  const debouncedSetSearch = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchText(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const cleanup = debouncedSetSearch(searchText)
    return cleanup
  }, [searchText, debouncedSetSearch])

  const listIntegrationsRes = _trpcReact.listConfiguredIntegrations.useQuery({
    connector_config_ids: connectorConfigs.map((ccfg) => ccfg.id),
    search_text: debouncedSearchText,
    integrationIds: integrationIdList,
    connectorNames: connectorNameList,
  })
  const ints = listIntegrationsRes.data?.items.map((int) => ({
    ...int,
    ccfg: connectorConfigs.find((ccfg) => ccfg.id === int.connector_config_id)!,
  }))

  const categories = Array.from(
    new Set(connectorConfigs.flatMap((ccfg) => ccfg.verticals)),
  )

  // State for the checkbox filter
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
    categories.reduce(
      (acc, option) => {
        acc[option] = false
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  const onClearFilter = () => {
    setCategoryFilter([])
    setCheckedState(
      categories.reduce(
        (acc, option) => ({...acc, [option]: false}),
        {} as Record<string, boolean>,
      ),
    )
  }

  const onCheckboxChange = (id: string) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }))
  }

  const intsByCategory = ints?.reduce(
    (acc, int) => {
      ;(int.verticals ?? int.ccfg.verticals).forEach((vertical) => {
        if (categoryFilter.length === 0 || categoryFilter.includes(vertical)) {
          acc[vertical] = (acc[vertical] || []).concat(int)
        }
      })
      return acc
    },
    {} as Record<string, typeof ints>,
  )

  const onApplyFilter = (selected: string[]) => {
    setCategoryFilter(selected)
  }

  const isDeeplinkView = view.split('-')[1] === 'deeplink'
  const isFullIntegrationId =
    integrationIdList.length === 1 && integrationIdList[0]?.includes('int_')
  const hasRelatedIntegration = Boolean(
    connectorNameList.length === 1 &&
      ((connectorNameList[0] &&
        isFullIntegrationId &&
        integrationIdList[0]?.includes(connectorNameList[0])) ||
        (ints && ints.length === 1 && ints[0]?.ccfg.integrations.length === 0)),
  )

  const hasDeeplink = isDeeplinkView && hasRelatedIntegration

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Search integrations - Fixed header */}
      <div
        className={`sticky top-0 z-10 border-b bg-popover pt-2 ${
          (ints?.length ?? 0) < 8 ? 'hidden md:block' : ''
        }`}>
        <div className="flex flex-row gap-2 px-6 pb-2">
          <div className="relative w-[450px]">
            <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search or pick a connector for your setup"
              className="truncate pl-8 text-foreground"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
          </div>
          {categories.length > 1 && (
            <CheckboxFilter
              options={categories}
              onApply={onApplyFilter}
              checkedState={checkedState}
              onCheckboxChange={onCheckboxChange}
              onClearFilter={onClearFilter}
            />
          )}
        </div>
        <FilterBadges
          filters={categoryFilter}
          onClick={(filter) => {
            setCategoryFilter(categoryFilter.filter((f) => f !== filter))
            setCheckedState((prevState) => ({
              ...prevState,
              [filter]: false,
            }))
          }}
        />
      </div>
      {/* Search results - Scrollable content */}
      <div className="relative flex-1 overflow-y-auto p-2">
        {listIntegrationsRes.isLoading ? (
          <div className="flex h-full min-h-[500px] items-center justify-center">
            <Loader2 className="size-7 animate-spin text-button" />
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {(ints && ints.length > 0) ||
            Object.keys(intsByCategory ?? {}).length > 0 ? (
              Object.entries(intsByCategory ?? {}).map(
                ([category, categoryInts]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {parseCategory(category)}
                    </h3>
                    <div className="hidden w-full flex-row flex-wrap gap-4 md:flex md:w-[60%]">
                      {categoryInts.map((int) => (
                        <WithConnectorConnect
                          key={int.id}
                          connectorConfig={{
                            id: int.connector_config_id,
                            connector: int.ccfg.connector,
                          }}
                          integration={{id: int.id as Id['int']}}
                          onEvent={(e) => {
                            onEvent?.({
                              type: e.type,
                              integration: {
                                connectorConfigId: int.connector_config_id,
                                id: int.id,
                              },
                            })
                          }}>
                          {({openConnect, loading}) => (
                            <IntegrationCard
                              onClick={openConnect}
                              logo={
                                int.logo_url ?? int.ccfg.connector.logoUrl ?? ''
                              }
                              name={int.ccfg.displayName ?? int.name}
                              hasDeeplink={hasDeeplink}
                              isLoading={loading}
                            />
                          )}
                        </WithConnectorConnect>
                      ))}
                    </div>
                    <div className="flex w-full flex-col gap-2 md:hidden">
                      {categoryInts.map((int, index) => (
                        <WithConnectorConnect
                          key={int.id}
                          connectorConfig={{
                            id: int.connector_config_id,
                            connector: int.ccfg.connector,
                          }}
                          integration={{id: int.id as Id['int']}}
                          onEvent={(e) => {
                            onEvent?.({
                              type: e.type,
                              integration: {
                                connectorConfigId: int.connector_config_id,
                                id: int.id,
                              },
                            })
                          }}>
                          {({openConnect}) => (
                            <>
                              <div className="flex w-full flex-row items-center justify-between gap-2">
                                <div className="flex flex-row items-center gap-2">
                                  <img
                                    src={
                                      int.logo_url ??
                                      int.ccfg.connector.logoUrl ??
                                      ''
                                    }
                                    alt={`${int.name} logo`}
                                    className="h-12 w-12 rounded-xl"
                                  />
                                  <p className="m-0 text-center text-sm font-semibold hover:text-button">
                                    {int.name}
                                  </p>
                                </div>
                                <Button onClick={openConnect} size="sm">
                                  Add
                                </Button>
                              </div>
                              {index < categoryInts.length - 1 && <Separator />}
                            </>
                          )}
                        </WithConnectorConnect>
                      ))}
                    </div>
                  </div>
                ),
              )
            ) : (
              <div>
                <p className="font-normal text-foreground">
                  No available connectors, please check that you have configured
                  connectors available or review your filter values.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
