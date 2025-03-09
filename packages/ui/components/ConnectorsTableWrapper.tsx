import React from 'react'
import { ConnectorsTable } from './ConnectorsTable'
import { Button } from '../shadcn/Button'
import { PlusCircle } from 'lucide-react'
import { UseQueryResult } from '@tanstack/react-query'

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

interface ConnectorsTableWrapperProps {
  query: UseQueryResult<Connector[]>
  onEdit?: (connector: Connector) => void
  onRun?: (connector: Connector) => void
  onAddConnector?: () => void
}

export function ConnectorsTableWrapper({
  query,
  onEdit,
  onRun,
  onAddConnector
}: ConnectorsTableWrapperProps) {
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
      
      <ConnectorsTable
        query={query}
        onEdit={onEdit}
        onRun={onRun}
        onAddConnector={onAddConnector}
      />
    </div>
  )
} 