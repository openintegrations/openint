'use client'

import {useMemo, useState} from 'react'
import {Core} from '@openint/api-v1/models'
import {Button} from '@openint/shadcn/ui'
import {Sheet, SheetContent, SheetTitle} from '@openint/shadcn/ui/sheet'
import {CommandPopover, ConnectionTableCell, CopyID} from '@openint/ui-v1'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {formatIsoDateString} from '@openint/ui-v1/utils'
import {useCommandDefinitionMap} from '@/app/GlobalCommandBarProvider'
import {useTRPC} from '../client'

const columns: Array<ColumnDef<Core['connection']>> = [
  {
    id: 'id',
    header: 'id',
    cell: ({row}) => <ConnectionTableCell connection={row.original} />,
  },
  {
    id: 'connector_name',
    header: 'Connector',
  },
  {
    id: 'customer_id',
    header: 'Customer',
    cell: ({row}) => (
      <CopyID value={row.original.customer_id} size="compact" width="auto" />
    ),
  },
  {
    id: 'created_at',
    header: 'Created At',
    accessorKey: 'created_at',
  },
  {
    id: 'updated_at',
    header: 'Updated At',
    accessorKey: 'updated_at',
  },
]

export function ConnectionsPage(props: {
  initialData?: {
    items: Array<Core['connection']>
    total: number
    limit: number
    offset: number
  }
}) {
  const {initialData} = props
  const trpc = useTRPC()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<
    Core['connection'] | null
  >(null)

  const connectionData = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {expand: ['connector']},
      initialData ? {initialData} : undefined,
    ),
  )

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
  const handleRowClick = (connection: Core['connection']) => {
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
      } as ColumnDef<Core['connection']>,
    ],
    [deleteConn],
  )

  return (
    <>
      <div>
        <DataTable<Core['connection'], string | number | string[]>
          data={connectionData.data.items}
          columns={columnsWithActions}
          onRowClick={handleRowClick}>
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

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setSelectedConnection(null)
        }}>
        <SheetContent side="right" className="w-[600px] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <SheetTitle className="text-xl font-semibold">
                Connection Details
              </SheetTitle>
            </div>

            {selectedConnection && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Basic Connection Info */}
                  <section>
                    <h3 className="mb-3 text-lg font-semibold">
                      Connection Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Connection ID
                        </h4>
                        <p className="font-mono text-sm">
                          {selectedConnection.id}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Connector Name
                        </h4>
                        <p className="font-mono text-sm">
                          {selectedConnection.connector_name}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Config ID
                        </h4>
                        <p className="font-mono text-sm">
                          {selectedConnection.connector_config_id}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* OAuth Credentials */}
                  {selectedConnection.settings?.oauth?.credentials && (
                    <section>
                      <h3 className="mb-3 text-lg font-semibold">
                        Authorization
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Access Token
                          </h4>
                          <div className="relative mt-1">
                            <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-sm">
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
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Refresh Token
                          </h4>
                          <div className="relative mt-1">
                            <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-sm">
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-muted-foreground text-sm font-medium">
                              Token Type
                            </h4>
                            <p className="font-mono text-sm">
                              {
                                selectedConnection.settings.oauth.credentials
                                  .token_type
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="text-muted-foreground text-sm font-medium">
                              Expires In
                            </h4>
                            <p className="font-mono text-sm">
                              {
                                selectedConnection.settings.oauth.credentials
                                  .expires_in
                              }
                              s
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Scope
                          </h4>
                          <p className="break-all font-mono text-sm">
                            {
                              selectedConnection.settings.oauth.credentials
                                .scope
                            }
                          </p>
                        </div>

                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Expires At
                          </h4>
                          <p className="font-mono text-sm">
                            {new Date(
                              selectedConnection.settings.oauth.credentials.expires_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Timestamps */}
                  <section>
                    <h3 className="mb-3 text-lg font-semibold">Timestamps</h3>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Created
                        </h4>
                        <p className="font-mono text-sm">
                          {formatIsoDateString(selectedConnection.created_at)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-muted-foreground text-sm font-medium">
                          Last Updated
                        </h4>
                        <p className="font-mono text-sm">
                          {formatIsoDateString(selectedConnection.updated_at)}
                        </p>
                      </div>
                      {selectedConnection.settings?.oauth?.last_fetched_at && (
                        <div>
                          <h4 className="text-muted-foreground text-sm font-medium">
                            Last Fetched
                          </h4>
                          <p className="font-mono text-sm">
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
                    <section>
                      <h3 className="mb-3 text-lg font-semibold">
                        Raw Token Response
                      </h3>
                      <div className="relative">
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-4">
                          <code className="text-sm text-slate-50">
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
