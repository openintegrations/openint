import type {ColumnDef, TableOptions} from '@tanstack/react-table'

import {flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {type ReactNode} from 'react'
import {cn} from '@openint/shadcn/lib/utils'

export interface DataTileViewProps<TData> {
  data: TData[]
  /** Column is used for selections and filters */
  columns: Array<ColumnDef<TData>>
  selectedId?: string
  onSelect?: (item: TData) => void
  getItemId: (item: TData) => string
  className?: string
  renderItem?: (item: TData) => ReactNode
}

export function DataTileView<TData>({
  data,
  columns,
  selectedId,
  onSelect,
  getItemId,
  className,
  renderItem,
}: DataTileViewProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  } satisfies TableOptions<TData>)

  return (
    <div
      // In small devices we want to justify center but in larger ones at the start of the row
      className={cn(
        'flex flex-wrap justify-start gap-4',
        // data.length === 1 ? 'justify-start' : 'justify-center md:justify-start',
        className,
      )}>
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          onClick={() => onSelect?.(row.original)}
          className={
            selectedId === getItemId(row.original) ? 'ring-button ring-2' : ''
          }>
          {renderItem ? (
            renderItem(row.original)
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add placeholders to ensure number of items is a multiple of 4 and the content spreads evenly */}
      {/* {Array.from({
        length: data.length % 4 === 0 ? 0 : 4 - (data.length % 4),
      }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          // same width as connection card but 0 height so that it doesn't create new rows of space
          className="invisible h-0 w-[150px]"
          aria-hidden="true"
        />
      ))} */}
    </div>
  )
}
