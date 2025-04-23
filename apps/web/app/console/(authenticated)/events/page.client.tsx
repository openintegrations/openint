'use client'

import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useState} from 'react'
import {type Event} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Sheet, SheetContent, SheetTitle} from '@openint/shadcn/ui/sheet'
import {CopyID} from '@openint/ui-v1'
import {DataTable} from '@openint/ui-v1/components/DataTable'
import {formatIsoDateString, timeSince} from '@openint/ui-v1/utils/dates'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

const columns: Array<ColumnDef<Event>> = [
  {
    id: 'id',
    header: 'Event ID',
    accessorKey: 'id',
  },
  {
    id: 'name',
    header: 'Event Name',
    accessorKey: 'name',
  },
  {
    id: 'timestamp',
    header: 'Timestamp',
    cell: ({row}) => (
      <div className="flex flex-col">
        <span className="text-sm">
          {formatIsoDateString(row.original.timestamp)}
        </span>
        <span className="text-muted-foreground text-xs">
          {timeSince(row.original.timestamp)}
        </span>
      </div>
    ),
  },
]

const DATA_PER_PAGE = 20

export function EventsList() {
  const trpc = useTRPC()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [pageIndex, setPageIndex] = useState(0)

  const eventData = useSuspenseQuery(
    trpc.listEvents.queryOptions({
      limit: DATA_PER_PAGE,
      offset: pageIndex * DATA_PER_PAGE,
    }),
  )

  const handleRowClick = (event: Event) => {
    console.log('row click event', event)
    setSelectedEvent(event)
    setSheetOpen(true)
  }

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }

  return (
    <>
      <DataTable<Event, string | number | string[]>
        data={eventData.data}
        columns={columns}
        onRowClick={handleRowClick}
        enableSelect={false}
        onPageChange={handlePageChange}
        isLoading={eventData.isFetching || eventData.isLoading}>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </DataTable>

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setSelectedEvent(null)
        }}>
        <SheetContent
          side="right"
          className="w-full p-0 backdrop-blur-xl sm:max-w-[550px]">
          <div className="flex h-full flex-col">
            <div className="border-b p-5">
              <SheetTitle className="text-xl font-semibold tracking-tight">
                Event Details
              </SheetTitle>
            </div>

            {selectedEvent && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-5 p-5">
                  {/* Basic Event Info */}
                  <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                    <div className="border-border/40 bg-muted/30 border-b px-5 py-3">
                      <h3 className="text-sm font-medium tracking-tight">
                        Event Information
                      </h3>
                    </div>
                    <div className="divide-border/40 divide-y">
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Event ID
                        </h4>
                        <div className="w-2/3">
                          <CopyID
                            value={selectedEvent.id}
                            width="100%"
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Event Name
                        </h4>
                        <div className="w-2/3">
                          <CopyID
                            value={selectedEvent.name}
                            width="100%"
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="flex px-5 py-3">
                        <h4 className="text-muted-foreground w-1/3 text-sm">
                          Timestamp
                        </h4>
                        <div className="flex w-2/3 items-center justify-between">
                          <p className="text-sm font-medium">
                            {formatIsoDateString(selectedEvent.timestamp)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {timeSince(selectedEvent.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Identifiers */}
                  {((selectedEvent.user as any)?.customer_id ||
                    (selectedEvent.data as any)?.connection_id) && (
                    <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                      <div className="border-border/40 bg-muted/30 border-b px-5 py-3">
                        <h3 className="text-sm font-medium tracking-tight">
                          Identifiers
                        </h3>
                      </div>
                      <div className="divide-border/40 divide-y">
                        {(selectedEvent.user as any)?.customer_id && (
                          <div className="flex px-5 py-3">
                            <h4 className="text-muted-foreground w-1/3 text-sm">
                              Customer ID
                            </h4>
                            <div className="w-2/3">
                              <CopyID
                                value={(selectedEvent.user as any).customer_id}
                                width="100%"
                                size="medium"
                              />
                            </div>
                          </div>
                        )}
                        {(selectedEvent.data as any)?.connection_id && (
                          <div className="flex px-5 py-3">
                            <h4 className="text-muted-foreground w-1/3 text-sm">
                              Connection ID
                            </h4>
                            <div className="w-2/3">
                              <CopyID
                                value={
                                  (selectedEvent.data as any).connection_id
                                }
                                width="100%"
                                size="medium"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* User Data */}
                  {selectedEvent.user &&
                    Object.keys(selectedEvent.user).length > 0 && (
                      <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                        <div className="border-border/40 bg-muted/30 border-b px-5 py-3">
                          <h3 className="text-sm font-medium tracking-tight">
                            User Data
                          </h3>
                        </div>
                        <div className="divide-border/40 divide-y">
                          {Object.entries(selectedEvent.user).map(
                            ([key, value]) => {
                              const formattedKey = key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c) => c.toUpperCase())

                              return (
                                <div key={key} className="flex px-5 py-3">
                                  <h4 className="text-muted-foreground w-1/3 text-sm">
                                    {formattedKey}
                                  </h4>
                                  <div className="w-2/3">
                                    <CopyID
                                      value={String(value)}
                                      width="100%"
                                      size="medium"
                                    />
                                  </div>
                                </div>
                              )
                            },
                          )}
                        </div>
                      </section>
                    )}

                  {/* Event Data */}
                  {selectedEvent.data &&
                    Object.keys(selectedEvent.data).length > 0 && (
                      <section className="border-border/60 bg-card/30 overflow-hidden rounded-lg border">
                        <div className="border-border/40 bg-muted/30 flex items-center justify-between border-b px-5 py-3">
                          <h3 className="text-sm font-medium tracking-tight">
                            Event Data
                          </h3>
                          <CopyID
                            value={JSON.stringify(selectedEvent.data, null, 2)}
                            size="justicon"
                          />
                        </div>
                        <div className="bg-foreground relative max-h-96 overflow-auto">
                          <div className="bg-primary/30 absolute left-0 top-0 h-[2px] w-full"></div>
                          <pre className="text-background p-4 font-mono text-xs leading-relaxed">
                            {JSON.stringify(selectedEvent.data, null, 2)}
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
