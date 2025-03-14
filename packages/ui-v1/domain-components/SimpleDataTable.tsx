'use client'

// Using any types to avoid import errors
import {useMemo, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util'

// Remove type declarations and use any types
const defaultFilter = () => true

interface SimpleDataTableProps<TData> {
  data: TData[]
  columns: Array<any>
  enableSelect?: boolean
  filter?: (data: TData) => boolean
  onRowClick?: (data: TData) => void
  isLoading?: boolean
  error?: Error | null
}

export function SimpleDataTable<TData>({
  columns: _columns,
  data,
  enableSelect,
  filter = defaultFilter,
  onRowClick,
  isLoading = false,
  error = null,
}: SimpleDataTableProps<TData>) {
  // Remove unused state variables
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isFocused, setIsFocused] = useState(false)
  const [globalFilter, setGlobalFilterValue] = useState('')

  // Mock implementation of tanstack table functions
  const flexRender = (component: any, props: any) => {
    if (typeof component === 'function') {
      return component(props)
    }
    return component
  }

  const columns = useMemo(
    () =>
      [
        enableSelect && {
          id: 'select',
          header: ({table}: {table: any}) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({row}: {row: any}) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ..._columns.map((col: any) => {
          if ('accessorKey' in col && typeof col.accessorKey === 'string') {
            return {header: titleCase(col.accessorKey), ...col}
          }
          return col
        }),
      ].filter(Boolean) as any[],
    [_columns, enableSelect],
  )

  // Create a simplified mock table object with better row selection support
  const table = {
    getState: () => ({
      globalFilter,
      rowSelection,
    }),
    setGlobalFilter: (value: string) => {
      setGlobalFilterValue(value)
    },
    getAllColumns: () =>
      columns.map((col) => ({
        id: col.id || col.accessorKey,
        getCanHide: () => true,
        getIsVisible: () => true,
        toggleVisibility: (_: boolean) => {
          // No-op function, but using _ to indicate unused parameter
        },
        columnDef: col,
      })),
    getHeaderGroups: () => [
      {
        id: 'header-group',
        headers: columns.map((col) => ({
          id: col.id || col.accessorKey,
          isPlaceholder: false,
          column: {
            columnDef: col,
          },
          getContext: () => ({
            table,
          }),
        })),
      },
    ],
    getRowModel: () => ({
      rows: data.map((item, index) => {
        const rowId = `row-${index}`
        return {
          id: rowId,
          original: item,
          getIsSelected: () => !!rowSelection[rowId],
          toggleSelected: (value: boolean) => {
            setRowSelection((prev) => ({
              ...prev,
              [rowId]: value,
            }))
          },
          getVisibleCells: () =>
            columns.map((col) => ({
              id: `cell-${index}-${col.id || col.accessorKey}`,
              column: {
                columnDef: col,
              },
              getContext: () => ({
                row: {
                  original: item,
                  id: rowId,
                  getIsSelected: () => !!rowSelection[rowId],
                  toggleSelected: (value: boolean) => {
                    setRowSelection((prev) => ({
                      ...prev,
                      [rowId]: value,
                    }))
                  },
                },
                table,
              }),
            })),
        }
      }),
    }),
    getFilteredSelectedRowModel: () => ({
      rows: data
        .filter(filter)
        .map((_, index) => `row-${index}`)
        .filter((id) => rowSelection[id])
        .map((id) => ({id})),
    }),
    getFilteredRowModel: () => ({
      rows: data.filter(filter).map((_, index) => ({id: `row-${index}`})),
    }),
    getCanPreviousPage: () => false,
    getCanNextPage: () => false,
    previousPage: () => {},
    nextPage: () => {},
    getIsAllPageRowsSelected: () => {
      const rowIds = data.map((_, index) => `row-${index}`)
      return rowIds.length > 0 && rowIds.every((id) => rowSelection[id])
    },
    toggleAllPageRowsSelected: (value: boolean) => {
      const newSelection: Record<string, boolean> = {}
      data.forEach((_, index) => {
        newSelection[`row-${index}`] = value
      })
      setRowSelection(newSelection)
    },
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div
          className="relative max-w-lg transition-all duration-300 ease-in-out"
          style={{width: isFocused ? '600px' : '400px'}}>
          {isFocused && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 opacity-100 transition-opacity duration-300 ease-in-out">
              🔍
            </div>
          )}
          <Input
            placeholder={isFocused ? '' : 'Search...'}
            value={globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`transition-all duration-300 ease-in-out ${
              isFocused ? 'pl-10' : 'pl-3'
            }`}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <span className="ml-2 h-4 w-4">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading || !table.getRowModel().rows?.length ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  {isLoading ? (
                    <div className="flex size-full min-h-[300px] items-center justify-center">
                      <div className="text-button size-8 animate-spin">⌛</div>
                    </div>
                  ) : error ? (
                    `Error: ${error.message}`
                  ) : (
                    'No results'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.filter((row: any) => filter(row.original))
                .map((row: any) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={
                      onRowClick ? () => onRowClick?.(row.original) : undefined
                    }
                    className={cn(
                      onRowClick && 'hover:bg-muted cursor-pointer',
                    )}>
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {enableSelect && (
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
        {(table.getCanPreviousPage() || table.getCanNextPage()) && (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
