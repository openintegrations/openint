import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import { ExternalLink, Edit, Play, PlusCircle } from "lucide-react";
import { UseQueryResult } from '@tanstack/react-query'

import { DataTable } from './DataTable'
import { Button } from '../shadcn/Button'
import ConnectorVerticalBadge from '../shadcn/VerticalBadge'
import ConnectorVersion from '../shadcn/ConnectorVersion'
import OAuthLabelType from '../shadcn/OAuthLabelType'
import ConnectorAudience from '../shadcn/ConnectorAudience'
import StatusBadge from '../shadcn/StatusBadge'

// Define the connector data type based on the screenshot
interface Connector {
  id: string
  name: string
  logo: string
  type: string
  authType: string
  audience: string
  version: string
  connectionCount: number
  status: 'enabled' | 'disabled'
}

interface ConnectorsTableProps {
  query: UseQueryResult<Connector[]>
  onEdit?: (connector: Connector) => void
  onRun?: (connector: Connector) => void
  onAddConnector?: () => void
}

export function ConnectorsTable({ 
  query, 
  onEdit, 
  onRun,
  onAddConnector 
}: ConnectorsTableProps) {
  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: 'name',
      header: 'Connector Name',
      cell: ({ row }) => {
        const connector = row.original
        return (
          <div className="flex items-center gap-3">
            <img 
              src={connector.logo} 
              alt={`${connector.name} logo`} 
              className="h-8 w-8 rounded-md"
            />
            <span className="font-medium">{connector.name}</span>
            
            <div className="ml-2 flex flex-wrap gap-2">
              <ConnectorVerticalBadge>{connector.type}</ConnectorVerticalBadge>
              <OAuthLabelType>{connector.authType}</OAuthLabelType>
              <ConnectorAudience>{connector.audience}</ConnectorAudience>
              <ConnectorVersion>{connector.version}</ConnectorVersion>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'connectionCount',
      header: 'Connections',
      cell: ({ row }) => {
        const count = row.original.connectionCount
        return (
          <div className="flex items-center">
            <span className="text-lg font-medium">{count}</span>
            {count > 0 && (
              <ExternalLink className="ml-2 h-4 w-4 text-blue-500" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <StatusBadge 
            status={status === 'enabled' ? 'success' : 'disabled'}
            text={status === 'enabled' ? 'Enabled' : 'Disabled'}
          />
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const connector = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit?.(connector)}
              aria-label={`Edit ${connector.name}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onRun?.(connector)}
              aria-label={`Run ${connector.name}`}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  // Check if there are any connectors
  const isLoading = query.isLoading
  const connectors = query.data || []
  const isEmpty = !isLoading && connectors.length === 0

  // Render empty state if no connectors
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-3">
          <PlusCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No connectors configured</h3>
        <p className="mb-6 text-sm text-gray-500">
          You haven't added any connectors yet. Add your first connector to get started.
        </p>
        <Button onClick={onAddConnector}>
          Add Connector
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connectors</h2>
        <Button 
          onClick={onAddConnector}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Connector
        </Button>
      </div>
      
      <div className="connectors-table-wrapper">
        <DataTable
          query={query}
          columns={columns}
          onRowClick={onEdit}
        />
      </div>
    </div>
  )
} 