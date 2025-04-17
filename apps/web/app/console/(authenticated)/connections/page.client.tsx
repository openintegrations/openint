'use client'

import type {ConnectionExpanded, Core} from '@openint/api-v1/models'
import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useMemo, useState} from 'react'
import {Button} from '@openint/shadcn/ui'
import {Sheet, SheetContent, SheetTitle} from '@openint/shadcn/ui/sheet'
import {
  CommandPopover,
  ConnectionStatusBadge,
  ConnectionTableCell,
  CopyID,
} from '@openint/ui-v1'
import {DataTable} from '@openint/ui-v1/components/DataTable'
import {formatIsoDateString} from '@openint/ui-v1/utils'
import {useCommandDefinitionMap} from '@/lib-client/GlobalCommandBarProvider'
import {useMutation, useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

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

export function ConnectionsPage() {
  const trpc = useTRPC()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<
    Core['connection_select'] | null
  >(null)
  const [pageIndex, setPageIndex] = useState(0)

  const connectionData = useSuspenseQuery(
    trpc.listConnections.queryOptions({
      expand: ['connector'],
      limit: 10,
      offset: pageIndex * 10,
    }),
  )

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }

  const deleteConn = useMutation(
    trpc.deleteConnection.mutationOptions({
      onSuccess: async () => {
        await connectionData.refetch()
      },
      onError: (error) => {
        // TODO: @rodri77 - Add a toast to the UI.
        console.error(error)
      },
    }),
  )

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
    [deleteConn],
  )

  return (
    <>
      <div>
        <DataTable<ConnectionExpanded, string | number | string[]>
          data={connectionData.data}
          columns={columnsWithActions}
          // Disable row click for now as it interferes with the command popover
          onRowClick={false ? handleRowClick : undefined}
          onPageChange={handlePageChange}
          isLoading={connectionData.isFetching || connectionData.isLoading}>
          <DataTable.Header>
            <DataTable.SearchInput />
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
        <SheetContent side="right" className="w-full p-0 sm:max-w-[600px]">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <SheetTitle className="text-xl font-semibold">
                Connection Details
              </SheetTitle>
            </div>

            {selectedConnection && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <div className="space-y-6 sm:space-y-8">
                  {/* Basic Connection Info */}
                  <section className="bg-card rounded-lg border p-4 sm:p-5">
                    <h3 className="text-card-foreground mb-4 text-lg font-semibold">
                      Connection Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                          Connection ID
                        </h4>
                        <CopyID
                          value={selectedConnection.id}
                          width="100%"
                          size="medium"
                        />
                      </div>
                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                          Connector Name
                        </h4>
                        <div className="bg-muted/40 rounded-md px-3 py-1.5">
                          <p className="text-sm font-medium">
                            {selectedConnection.connector_name}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                          Config ID
                        </h4>
                        <CopyID
                          value={selectedConnection.connector_config_id || ''}
                          width="100%"
                          size="medium"
                        />
                      </div>
                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                          Customer ID
                        </h4>
                        <CopyID
                          value={selectedConnection.customer_id || ''}
                          width="100%"
                          size="medium"
                        />
                      </div>
                    </div>
                  </section>

                  {/* OAuth Credentials */}
                  {selectedConnection.settings?.oauth?.credentials && (
                    <section className="bg-card rounded-lg border p-4 sm:p-5">
                      <h3 className="text-card-foreground mb-4 text-lg font-semibold">
                        Authorization
                      </h3>
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                            Access Token
                          </h4>
                          <div className="relative mt-1">
                            <pre className="overflow-x-auto rounded-md bg-slate-950 p-2 text-sm sm:p-3">
                              <code className="whitespace-pre-wrap break-all text-slate-50">
                                {
                                  selectedConnection.settings.oauth.credentials
                                    .access_token
                                }
                              </code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  selectedConnection.settings.oauth.credentials
                                    .access_token,
                                )
                              }>
                              Copy
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                            Refresh Token
                          </h4>
                          <div className="relative mt-1">
                            <pre className="overflow-x-auto rounded-md bg-slate-950 p-2 text-sm sm:p-3">
                              <code className="whitespace-pre-wrap break-all text-slate-50">
                                {
                                  selectedConnection.settings.oauth.credentials
                                    .refresh_token
                                }
                              </code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  selectedConnection.settings.oauth.credentials
                                    .refresh_token,
                                )
                              }>
                              Copy
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="bg-muted/40 rounded-md p-3">
                            <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                              Token Type
                            </h4>
                            <p className="text-sm font-medium">
                              {
                                selectedConnection.settings.oauth.credentials
                                  .token_type
                              }
                            </p>
                          </div>
                          <div className="bg-muted/40 rounded-md p-3">
                            <h4 className="text-muted-foreground mb-1 text-sm font-medium">
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

                        <div className="bg-muted/40 rounded-md p-3">
                          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                            Scope
                          </h4>
                          <p className="break-all text-sm font-medium">
                            {
                              selectedConnection.settings.oauth.credentials
                                .scope
                            }
                          </p>
                        </div>

                        <div className="bg-muted/40 rounded-md p-3">
                          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
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

                  {/* Timestamps */}
                  <section className="bg-card rounded-lg border p-4 sm:p-5">
                    <h3 className="text-card-foreground mb-4 text-lg font-semibold">
                      Timestamps
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                          Created
                        </h4>
                        <p className="text-sm font-medium">
                          {formatIsoDateString(selectedConnection.created_at)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                          Last Updated
                        </h4>
                        <p className="text-sm font-medium">
                          {formatIsoDateString(selectedConnection.updated_at)}
                        </p>
                      </div>
                      {selectedConnection.settings?.oauth?.last_fetched_at && (
                        <div>
                          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                            Last Fetched
                          </h4>
                          <p className="text-sm font-medium">
                            {formatIsoDateString(
                              selectedConnection.settings.oauth.last_fetched_at,
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Raw Response */}
                  {selectedConnection.settings?.oauth?.credentials?.raw && (
                    <section className="bg-card rounded-lg border p-4 sm:p-5">
                      <h3 className="text-card-foreground mb-4 text-lg font-semibold">
                        Raw Token Response
                      </h3>
                      <div className="relative">
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs sm:text-sm">
                          <code className="text-slate-50">
                            {JSON.stringify(
                              selectedConnection.settings.oauth.credentials.raw,
                              null,
                              2,
                            )}
                          </code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              JSON.stringify(
                                selectedConnection.settings.oauth.credentials
                                  .raw,
                                null,
                                2,
                              ),
                            )
                          }>
                          Copy
                        </Button>
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
