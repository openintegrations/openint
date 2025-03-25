'use client'

import {use} from 'react'
import {Core} from '@openint/api-v1/models'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'

const columns: ColumnDef<Core['connection']>[] = [
  {
    id: 'id',
    header: 'id',
    accessorKey: 'id',
  },
  {
    id: 'connector_name',
    header: 'Connector',
    accessorKey: 'connector_name',
  },
  {
    id: 'connector_config_id',
    header: 'Connector Config ID',
    accessorKey: 'connector_config_id',
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

export function ConnectionList(props: {
  initialData?: Promise<{
    items: Array<Core['connection']>
    total: number
    limit: number
    offset: number
  }>
}) {
  const initialData = use(
    props.initialData ??
      Promise.resolve({
        items: [],
        total: 0,
        limit: 0,
        offset: 0,
      }),
  )

  return (
    <div>
      <DataTable<Core['connection'], string | number | string[]>
        data={initialData.items}
        columns={columns}>
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
  )
}
