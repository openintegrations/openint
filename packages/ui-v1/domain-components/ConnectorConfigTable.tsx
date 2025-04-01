'use client'

import {MoreHorizontal} from 'lucide-react'
import {Core} from '@openint/api-v1/models'
import {Button} from '@openint/shadcn/ui'
import {ConnectorConfigTableCell} from '../components/ConnectorConfigTableCell'
import type {ColumnDef} from '../components/DataTable'
import {DataTable} from '../components/DataTable'

// Define the columns for the connector config table
export const columns: Array<ColumnDef<Core['connector_config']>> = [
  {
    id: 'connectorConfig',
    header: 'Connector Name',
    cell: ({row}) => (
      <ConnectorConfigTableCell connectorConfig={row.original} />
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({row}) => {
      // This should be calculated based on the connector config's actual status
      const isEnabled = true // Simplified for example
      return (
        <div
          className={`text-sm font-medium ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      )
    },
  },
  {
    id: 'environment',
    header: 'Env Name',
    cell: ({row}) => {
      // This should check the actual environment of the connector config
      const isProd = row.original.config?.environment === 'production'
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
    cell: ({row}) => (
      <div className="text-gray-500">
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
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
  data: Core['connector_config'][]
  enableSelect?: boolean
  onRowClick?: (connectorConfig: Core['connector_config']) => void
}) {
  return (
    <DataTable
      data={data}
      columns={columns}
      enableSelect={enableSelect}
      onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}>
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
