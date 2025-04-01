'use client'

import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {ConnectorConfigTableCell} from '../components/ConnectorConfigTableCell'
import type {ColumnDef} from '../components/DataTable'
import {DataTable} from '../components/DataTable'

// Define the ConnectorConfig data structure
export interface ConnectorConfig {
  id: string
  name: string
  enabled: boolean
  environment: 'sandbox' | 'production'
  firstCreated: string
}

// Define the columns for the connector config table
export const columns: Array<ColumnDef<ConnectorConfig>> = [
  {
    id: 'connectorConfig',
    header: 'Connector Name',
    cell: ({row}) => (
      <ConnectorConfigTableCell
        name={row.original.name}
        id={row.original.id}
        compact={true}
        useIcon={false}
        backgroundColor="#f5f5f5"
        textColor="#666666"
      />
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({row}) => (
      <div
        className={`text-sm font-medium ${row.original.enabled ? 'text-green-600' : 'text-gray-500'}`}>
        {row.original.enabled ? 'Enabled' : 'Disabled'}
      </div>
    ),
  },
  {
    id: 'environment',
    header: 'Env Name',
    cell: ({row}) => {
      const isProd = row.original.environment === 'production'
      return (
        <div
          className={`text-sm font-medium ${isProd ? 'text-blue-600' : 'text-amber-600'}`}>
          {isProd ? 'Production' : 'Sandbox'}
        </div>
      )
    },
  },
  {
    id: 'firstCreated',
    header: 'First Created',
    accessorKey: 'firstCreated',
    cell: ({row}) => (
      <div className="text-gray-500">{row.original.firstCreated}</div>
    ),
  },
  {
    id: 'action',
    header: '',
    cell: () => (
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
]

export function ConnectorConfigTable({
  data,
  enableSelect,
  onRowClick,
}: {
  data: ConnectorConfig[]
  enableSelect?: boolean
  onRowClick?: (connectorConfig: ConnectorConfig) => void
}) {
  return (
    <DataTable
      data={data}
      columns={columns}
      enableSelect={enableSelect}
      onRowClick={
        onRowClick
          ? (row) => {
              onRowClick(row)
            }
          : undefined
      }>
      <DataTable.Header>
        <DataTable.SearchInput />
        <DataTable.ColumnVisibilityToggle />
      </DataTable.Header>
      <DataTable.Table />
      <DataTable.Footer>
        <DataTable.Pagination />
      </DataTable.Footer>
    </DataTable>
  )
}
