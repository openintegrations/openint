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
    <div className={cn('flex flex-wrap gap-4', className)}>
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
    </div>
  )
}
