'use client'

import type {
  ColumnDef,
  ColumnFiltersState,
  Table as ReactTable,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {ChevronDown, Loader2, Search} from 'lucide-react'
import React, {useState} from 'react'
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
import {compact} from '@openint/util/array-utils'
import {titleCase} from '@openint/util/string-utils'

const defaultFilter = () => true

export type {ColumnDef}

export type Columns<TItem, TValue> = Array<ColumnDef<TItem, TValue>>

export interface DataTableProps<TItem, TValue> {
  data: TItem[] | PaginatedData<TItem>
  isRefetching?: boolean
  columns: Array<ColumnDef<TItem, TValue>>
  enableSelect?: boolean
  filter?: (data: TItem) => boolean
  onRowClick?: (data: TItem) => void
  children?: React.ReactNode
  className?: string
  onPageChange?: (pageIndex: number) => void
  isLoading?: boolean // Only when data is paginated and fetching
}

type DataTableContextValue<TData, TValue> = {
  table: ReactTable<TData>
  columns: Array<ColumnDef<TData, TValue>>
  isRefetching?: boolean
  filter: (data: TData) => boolean
  onRowClick?: (data: TData) => void
  isPaginated: boolean
  isLoading: boolean
  paginationInfo?: {
    currentPage: number
    totalCount: number
    pageSize: number
  }
}

const DataTableContext = React.createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataTableContextValue<any, any> | undefined
>(undefined)

export function useDataTableContext() {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error('useDataTable must be used within a DataTableProvider')
  }
  return context
}

export type PaginatedData<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

export function DataTable<TData, TValue>({
  columns: _columns,
  data,
  isRefetching,
  enableSelect,
  filter = defaultFilter,
  onRowClick,
  children,
  onPageChange,
  isLoading,
  ...props
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  // Hide id column by default... We need a better way to do this though
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      Object.fromEntries(
        // TODO: there has got to be a better way to specify initial column visibility
        // than this convoluted method, with custom accessorKey stringification function
        _columns
          .map(
            (col) =>
              [
                col.id ??
                  ('accessorKey' in col
                    ? col.accessorKey.toString().replaceAll('.', '_')
                    : undefined),
                (col.meta as {initialVisibility?: boolean} | undefined)
                  ?.initialVisibility,
              ] as [string, boolean],
          )
          .filter(([id, hidden]) => !!id && hidden != null),
      ),
    )

  const [rowSelection, setRowSelection] = React.useState({})

  // Check if data is paginated
  const isPaginated = 'items' in data && 'total' in data
  const items = isPaginated ? data.items : data
  const totalCount = isPaginated ? data.total : items.length
  const pageSize = isPaginated ? data.limit : items.length
  const currentPage = isPaginated ? Math.floor(data.offset / data.limit) : 0

  const [pageIndex, setPageIndex] = useState(currentPage)

  const columns = React.useMemo(
    () =>
      compact<ColumnDef<TData, TValue>>([
        enableSelect && {
          id: 'select',
          header: ({table}) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          ),
          cell: ({row}) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ..._columns.map((col) => {
          if ('accessorKey' in col && typeof col.accessorKey === 'string') {
            return {header: titleCase(col.accessorKey), ...col} as typeof col
          }
          return col
        }),
      ]),
    [_columns, enableSelect],
  )

  const table = useReactTable({
    data: items,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: isPaginated, // Only enable manual pagination if data is paginated
    pageCount: isPaginated ? Math.ceil(totalCount / pageSize) : 1,
    onPaginationChange: isPaginated
      ? (updater) => {
          if (typeof updater === 'function') {
            const newState = updater({pageIndex, pageSize})
            setPageIndex(newState.pageIndex)
            onPageChange?.(newState.pageIndex)
          }
        }
      : undefined,
  })
  return (
    <DataTableContext.Provider
      // This optimization breaks the inner components because as updates to dataTable.state
      // would not trigger a re-render for context consumers. We'll need a better mechanism for it
      // value={React.useMemo(
      //   () => ({table, columns, isRefetching, filter, onRowClick}),
      //   [table, columns, isRefetching, filter, onRowClick],
      // )}>
      value={{
        table,
        columns,
        isRefetching,
        filter,
        onRowClick,
        isPaginated,
        isLoading: isLoading ?? false,
        paginationInfo: isPaginated
          ? {
              currentPage,
              totalCount,
              pageSize,
            }
          : undefined,
      }}>
      <div className={cn('w-full', props.className)}>{children}</div>
    </DataTableContext.Provider>
  )
}

export function DataTableTable(props: {className?: string}) {
  const {table, columns, isRefetching, filter, onRowClick} =
    useDataTableContext()

  return (
    <div className={cn('overflow-hidden rounded-md border', props.className)}>
      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-3 py-3">
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
          {isRefetching || !table.getRowModel().rows?.length ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {isRefetching ? (
                  <div className="flex size-full min-h-[300px] items-center justify-center">
                    <Loader2 className="text-button size-8 animate-spin" />
                  </div>
                ) : (
                  'No results'
                )}
              </TableCell>
            </TableRow>
          ) : (
            table
              .getRowModel()
              .rows.filter((row) => filter(row.original))
              .map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={
                    onRowClick ? () => onRowClick?.(row.original) : undefined
                  }
                  className={cn(onRowClick && 'hover:bg-muted cursor-pointer')}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-3">
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
  )
}

// Add a convenience component for table controls
export function DataTableHeader({children}: {children: React.ReactNode}) {
  return <div className="flex items-center py-4">{children}</div>
}

export function SearchInput() {
  const {table} = useDataTableContext()
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div
      className="relative max-w-lg transition-all duration-300 ease-in-out"
      style={{width: isFocused ? '600px' : '400px'}}>
      {isFocused && (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 opacity-100 transition-opacity duration-300 ease-in-out" />
      )}
      <Input
        placeholder={isFocused ? '' : 'Search...'}
        value={(table.getState().globalFilter as string) ?? ''}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`transition-all duration-300 ease-in-out ${
          isFocused ? 'pl-10' : 'pl-3'
        }`}
      />
    </div>
  )
}

export function ColumnVisibilityToggle() {
  const {table} = useDataTableContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Columns <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
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
  )
}

export function DataTableFooter({children}: {children: React.ReactNode}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      {children}
    </div>
  )
}

export function Pagination() {
  const {table, isPaginated, isLoading, paginationInfo} = useDataTableContext()

  if (!isPaginated || !paginationInfo || paginationInfo?.totalCount === 0)
    return null

  const {currentPage, totalCount, pageSize} = paginationInfo

  return (
    <>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || isLoading}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || isLoading}>
          Next
        </Button>
        <span>
          Page {currentPage + 1} of {Math.ceil(totalCount / pageSize)}
        </span>
      </div>
    </>
  )
}

// Add to DataTable composition

DataTable.Table = DataTableTable
DataTable.Header = DataTableHeader
DataTable.SearchInput = SearchInput
DataTable.ColumnVisibilityToggle = ColumnVisibilityToggle
DataTable.Footer = DataTableFooter
DataTable.Pagination = Pagination
