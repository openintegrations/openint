'use client'

import type {ConnectionExpanded, Core} from '@openint/api-v1/models'
import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useEffect, useMemo, useState} from 'react'
import {Sheet, SheetContent, SheetTitle} from '@openint/shadcn/ui/sheet'
import {
  CommandPopover,
  ConnectionStatusBadge,
  ConnectionTableCell,
  CopyID,
  useStateFromSearchParams,
} from '@openint/ui-v1'
import {DataTable} from '@openint/ui-v1/components/DataTable'
import {formatIsoDateString, timeSince} from '@openint/ui-v1/utils'
import {useCommandDefinitionMap} from '@/lib-client/GlobalCommandBarProvider'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

/** TODO: move into ui-v1 */
const columns: Array<ColumnDef<ConnectionExpanded>> = [
  {
    accessorKey: 'id',
    cell: ({row}) => {
      const connection = row.original
      return <ConnectionTableCell connection={connection} />
    },
  },
  {
    accessorKey: 'status',
    cell: ({row}) => {
      const connection = row.original
      return <ConnectionStatusBadge status={connection.status} />
    },
  },

  {
    header: 'Connector',
    accessorKey: 'connector.name',
  },
  {
    accessorKey: 'customer_id',
    header: 'Customer',
    cell: ({row}) => (
      <CopyID value={row.original.customer_id!} size="compact" width="auto" />
    ),
  },
  {
    header: 'Created At',
    accessorKey: 'created_at',
  },
  {
    header: 'Updated At',
    accessorKey: 'updated_at',
  },
]

const DATA_PER_PAGE = 20

export function ConnectionsPage() {
  const trpc = useTRPC()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<
    Core['connection_select'] | null
  >(null)
  // const tableRef = useRef<ReactTable<ConnectionExpanded>>(null)
  // const pageIndex  = tableRef.current?.getState().pagination.pageIndex
  // const setPageIndex = (pageIndex: number) => {
  //   tableRef.current?.setPageIndex(pageIndex)
  // }
  // const [_pageIndex, _setPageIndex] = useStateFromSearchParams('page', {
  //   defaultValue: '0',
  //   shallow: true,
  // })
  // Perhaps data table should sync itself with the search params of the page optionally if controlled by a param
  // for future though...
  const [pageIndex, setPageIndex] = useState(0)
  const [query, setQuery] = useStateFromSearchParams('q', {
    shallow: true,
    defaultValue: '' as string,
  })

  useEffect(() => {
    // Reset page index when search params query changes
    setPageIndex(0)
  }, [query])

  const connectionData = useSuspenseQuery(
    trpc.listConnections.queryOptions({
      expand: ['connector'],
      limit: DATA_PER_PAGE,
      offset: pageIndex * DATA_PER_PAGE,
      search_query: query,
    }),
  )

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }

  const definitions = useCommandDefinitionMap()
  const handleRowClick = (connection: Core['connection_select']) => {
    setSelectedConnection(connection)
    setSheetOpen(true)
  }

  const columnsWithActions = useMemo(
    () => [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({row}) => (
          <CommandPopover
            hideGroupHeadings
            initialParams={{
              connection_id: row.original.id,
            }}
            ctx={{}}
            definitions={definitions}
          />
        ),
      } as ColumnDef<ConnectionExpanded>,
    ],
    [definitions],
  )

  return (
    <>
      <div>
        <DataTable<ConnectionExpanded, string | number | string[]>
          data={connectionData.data}
          columns={columnsWithActions}
          onRowClick={handleRowClick}
          onPageChange={handlePageChange}
          isLoading={connectionData.isFetching || connectionData.isLoading}>
          <DataTable.Header>
            {/* Use this approach for paginated search, DataTable.SearchInput works for client-side search */}
            {/* <SearchInput initialValue={query} onChange={setQuery} /> */}
            <DataTable.SearchInput query={query} onQueryChange={setQuery} />
            <DataTable.ColumnVisibilityToggle />
          </DataTable.Header>
          <DataTable.Table />
          <DataTable.Footer>
            <DataTable.Pagination />
          </DataTable.Footer>
        </DataTable>
      </div>

      {/* TODO: Extract into ConnectionSheet and move into ui-v1 */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setSelectedConnection(null)
        }}>
        <SheetContent
          side="right"
          className="w-full p-0 backdrop-blur-xl sm:max-w-[550px]">
          <div className="flex h-full flex-col">
            <div className="border-b p-5">
              <SheetTitle className="text-xl font-semibold tracking-tight">
                Connection Details
              </SheetTitle>
            </div>

            {selectedConnection && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-5 p-5">
                  {/* Basic Connection Info */}
                  <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                    <div className="border-border/40 bg-muted/30 border-b px-5 py-3">
                      <h3 className="text-sm font-medium tracking-tight">
                        Connection Information
                      </h3>
                    </div>
                    <div className="divide-border/40 divide-y">
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Connector Name
                        </h4>
                        <div className="w-2/3">
                          <p className="text-sm font-medium">
                            {selectedConnection.connector_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Connection ID
                        </h4>
                        <div className="w-2/3">
                          <CopyID
                            value={selectedConnection.id}
                            width="100%"
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Config ID
                        </h4>
                        <div className="w-2/3">
                          <CopyID
                            value={selectedConnection.connector_config_id || ''}
                            width="100%"
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Customer ID
                        </h4>
                        <div className="w-2/3">
                          <CopyID
                            value={selectedConnection.customer_id || ''}
                            width="100%"
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Created
                        </h4>
                        <div className="flex w-2/3 items-center justify-between">
                          <p className="text-sm font-medium">
                            {formatIsoDateString(selectedConnection.created_at)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {timeSince(selectedConnection.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Last Updated
                        </h4>
                        <div className="flex w-2/3 items-center justify-between">
                          <p className="text-sm font-medium">
                            {formatIsoDateString(selectedConnection.updated_at)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {timeSince(selectedConnection.updated_at)}
                          </p>
                        </div>
                      </div>
                      {selectedConnection.settings?.oauth?.last_fetched_at && (
                        <div className="flex px-5 py-3">
                          <h4 className="text-muted-foreground w-1/3 text-sm">
                            Last Fetched
                          </h4>
                          <div className="flex w-2/3 items-center justify-between">
                            <p className="text-sm font-medium">
                              {formatIsoDateString(
                                selectedConnection.settings.oauth
                                  .last_fetched_at,
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {timeSince(
                                selectedConnection.settings.oauth
                                  .last_fetched_at,
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* OAuth Credentials */}
                  {selectedConnection.settings?.oauth?.credentials && (
                    <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                      <div className="border-border/40 bg-muted/30 border-b px-5 py-3">
                        <h3 className="text-sm font-medium tracking-tight">
                          Authorization
                        </h3>
                      </div>
                      <div className="divide-border/40 divide-y">
                        <div className="flex px-5 py-3">
                          <h4 className="text-muted-foreground w-1/3 text-sm">
                            Access Token
                          </h4>
                          <div className="w-2/3">
                            <CopyID
                              value={
                                selectedConnection.settings.oauth.credentials
                                  .access_token
                              }
                              width="100%"
                              size="medium"
                            />
                          </div>
                        </div>

                        <div className="flex px-5 py-3">
                          <h4 className="text-muted-foreground w-1/3 text-sm">
                            Refresh Token
                          </h4>
                          <div className="w-2/3">
                            <CopyID
                              value={
                                selectedConnection.settings.oauth.credentials
                                  .refresh_token
                              }
                              width="100%"
                              size="medium"
                            />
                          </div>
                        </div>

                        <div className="px-5 py-3">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <h4 className="text-muted-foreground mb-1 text-sm">
                                Token Type
                              </h4>
                              <p className="text-sm font-medium">
                                {
                                  selectedConnection.settings.oauth.credentials
                                    .token_type
                                }
                              </p>
                            </div>
                            <div>
                              <h4 className="text-muted-foreground mb-1 text-sm">
                                Expires In
                              </h4>
                              <p className="text-sm font-medium">
                                {
                                  selectedConnection.settings.oauth.credentials
                                    .expires_in
                                }
                                s
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 py-3">
                          <h4 className="text-muted-foreground mb-1 text-sm">
                            Scope
                          </h4>
                          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
                            {selectedConnection.settings.oauth.credentials.scope
                              .split(' ')
                              .map((scope: string) => (
                                <span
                                  key={scope}
                                  className="border-border/60 bg-muted/30 inline-flex items-center rounded-md border px-2 py-0.5 text-xs"
                                  title={scope}>
                                  <span className="truncate">{scope}</span>
                                </span>
                              ))}
                          </div>
                        </div>

                        <div className="px-5 py-3">
                          <h4 className="text-muted-foreground mb-1 text-sm">
                            Expires At
                          </h4>
                          <p className="text-sm font-medium">
                            {new Date(
                              selectedConnection.settings.oauth.credentials.expires_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Raw Response */}
                  {selectedConnection.settings?.oauth?.credentials?.raw && (
                    <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                      <div className="border-border/40 bg-muted/30 flex items-center justify-between border-b px-5 py-3">
                        <h3 className="text-sm font-medium tracking-tight">
                          Raw Token Response
                        </h3>
                        <CopyID
                          value={JSON.stringify(
                            selectedConnection.settings.oauth.credentials.raw,
                            null,
                            2,
                          )}
                          size="justicon"
                        />
                      </div>
                      <div className="bg-foreground relative max-h-96 overflow-auto">
                        <div className="bg-primary/30 absolute left-0 top-0 h-[2px] w-full"></div>
                        <pre className="text-background p-4 font-mono text-xs leading-relaxed">
                          {JSON.stringify(
                            selectedConnection.settings.oauth.credentials.raw,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
