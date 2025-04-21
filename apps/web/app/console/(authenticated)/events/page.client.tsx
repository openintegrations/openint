'use client'

import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useState} from 'react'
import {type Event} from '@openint/api-v1/models'
import {Sheet, SheetContent, SheetTitle} from '@openint/shadcn/ui/sheet'
import {DataTable} from '@openint/ui-v1/components/DataTable'
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
      <div className="text-gray-500">
        {new Date(row.original.timestamp)
          .toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
          .replace(',', '')}
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
        <SheetContent side="right" className="min-w-1/3 p-4">
          <SheetTitle className="text-xl font-semibold">
            Event Details
          </SheetTitle>
          {selectedEvent && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium">Event ID</h3>
                <p>{selectedEvent.id}</p>
              </div>
              <div>
                <h3 className="font-medium">Event</h3>
                <p>{selectedEvent.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Timestamp</h3>
                <p className="font-mono">
                  {new Date(selectedEvent.timestamp)
                    .toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })
                    .replace(',', '')}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Identifiers</h3>
                <pre className="mt-2 rounded-lg bg-slate-950 p-4">
                  <code className="text-sm text-slate-50">
                    {/* TODO: format this as customer_id instead of cus_id */}
                    {JSON.stringify(selectedEvent.user, null, 2)}
                  </code>
                </pre>
              </div>
              <div>
                <h3 className="font-medium">Data</h3>
                <pre className="mt-2 rounded-lg bg-slate-950 p-4">
                  <code className="text-sm text-slate-50">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
