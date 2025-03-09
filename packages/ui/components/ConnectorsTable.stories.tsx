import React from 'react'
import { DataTable } from './DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '../shadcn/Button'
import { PlusCircle, ExternalLink, Edit, Play } from 'lucide-react'
import StatusBadge from '../shadcn/StatusBadge'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a QueryClient
const queryClient = new QueryClient()

// Define the connector data type
interface Connector {
  id: string
  name: string
  logo: string
  type: string
  connectionCount: number
  status: 'enabled' | 'disabled'
}

export default {
  title: 'UI/Tables/ConnectorsTable',
  parameters: {
    layout: 'centered',
  },
}

// Mock data
const mockConnectors = [
  {
    id: '1',
    name: 'Salesforce',
    logo: 'https://logo.clearbit.com/salesforce.com',
    type: 'CRM',
    connectionCount: 1250,
    status: 'enabled',
  },
  {
    id: '2',
    name: 'Google Drive',
    logo: 'https://logo.clearbit.com/google.com',
    type: 'File Storage',
    connectionCount: 890,
    status: 'enabled',
  },
  {
    id: '3',
    name: 'Plaid',
    logo: 'https://logo.clearbit.com/plaid.com',
    type: 'Banking',
    connectionCount: 456,
    status: 'enabled',
  },
]

// Simple connector table component
const SimpleConnectorsTable = () => {
  // Define columns
  const columns: ColumnDef<Connector>[] = [
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
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => console.log('Edit', row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => console.log('Run', row.original)}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  // Mock query
  const mockQuery = {
    data: mockConnectors,
    isLoading: false,
    isError: false,
    error: null,
  }

  return (
    <div className="space-y-4 w-full max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connectors</h2>
        <Button 
          onClick={() => console.log('Add connector clicked')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Connector
        </Button>
      </div>
      
      <DataTable
        query={mockQuery as any}
        columns={columns}
        onRowClick={(data) => console.log('Row clicked', data)}
      />
    </div>
  )
}

export const Default = () => (
  <QueryClientProvider client={queryClient}>
    <SimpleConnectorsTable />
  </QueryClientProvider>
)

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center w-full max-w-4xl">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        <PlusCircle className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium">No connectors configured</h3>
      <p className="mb-6 text-sm text-gray-500">
        You haven't added any connectors yet. Add your first connector to get started.
      </p>
      <Button onClick={() => console.log('Add connector clicked')}>
        Add Connector
      </Button>
    </div>
  )
} 