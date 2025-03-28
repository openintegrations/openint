'use client'

import {AlertTriangle, Loader2, Search} from 'lucide-react'
import {useEffect, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Button, Card, Input} from '@openint/shadcn/ui'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import {CheckboxFilter} from '../components/CheckboxFilter'

// Simplified types for demo purposes
type ConnectorConfig = {
  id: string
  name: string
  display_name: string
  logo_url: string
  category?: string
}

type Connection = {
  id: string
  connectorConfigId: string
  connectorConfig?: ConnectorConfig
  customer_id: string
  name: string
  created_at: string
}

// Simple connector card component
function ConnectorCard({
  connector,
  onClick,
}: {
  connector: ConnectorConfig
  onClick?: () => void
}) {
  return (
    <Card
      className="flex aspect-square cursor-pointer flex-col items-center justify-center p-1.5 hover:bg-gray-50"
      onClick={onClick}>
      <div className="mb-1 h-12 w-12 overflow-hidden">
        <img
          src={connector.logo_url}
          alt={connector.display_name}
          className="h-full w-full object-contain"
        />
      </div>
      <span className="text-xs font-medium">{connector.display_name}</span>
    </Card>
  )
}

export interface ConnectionPortalProps {
  className?: string
  initialView?: 'add' | 'manage'
  mockConnectorConfigs?: ConnectorConfig[]
  mockConnections?: Connection[]
}

export function ConnectionPortal({
  className,
  initialView = 'manage',
  mockConnectorConfigs = [],
  mockConnections = [],
}: ConnectionPortalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [checkedCategories, setCheckedCategories] = useState<
    Record<string, boolean>
  >({})

  // Simple loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Initialize checked categories on load
  useEffect(() => {
    const categories = Array.from(
      new Set(mockConnectorConfigs.map((c) => c.category || 'Other')),
    )
    const initialCheckedState: Record<string, boolean> = {}
    categories.forEach((category) => {
      initialCheckedState[category] = false
    })
    setCheckedCategories(initialCheckedState)
  }, [mockConnectorConfigs])

  // Get unique categories
  const categories = Array.from(
    new Set(mockConnectorConfigs.map((c) => c.category || 'Other')),
  )

  // Filter handlers for CheckboxFilter
  const handleCategoryCheckboxChange = (id: string) => {
    setCheckedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleClearFilter = () => {
    const resetState: Record<string, boolean> = {}
    Object.keys(checkedCategories).forEach((key) => {
      resetState[key] = false
    })
    setCheckedCategories(resetState)
  }

  const handleApplyFilter = (_selected: string[]) => {
    // This is handled by the CheckboxFilter component directly
  }

  // Filter connectors based on search and selected categories
  const filteredConnectors = mockConnectorConfigs.filter((connector) => {
    // Text search filter
    const matchesSearch = searchQuery
      ? connector.display_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        connector.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    // Category filter - if no categories are checked, show all
    const anyChecked = Object.values(checkedCategories).some((value) => value)
    const matchesCategory =
      !anyChecked ||
      (connector.category && checkedCategories[connector.category])

    return matchesSearch && matchesCategory
  })

  // Group connectors by category
  const connectorsByCategory: Record<string, ConnectorConfig[]> = {}
  filteredConnectors.forEach((connector) => {
    const category = connector.category || 'Other'
    if (!connectorsByCategory[category]) {
      connectorsByCategory[category] = []
    }
    connectorsByCategory[category].push(connector)
  })

  return (
    <div className={cn('flex flex-col', className)}>
      <Tabs defaultValue={initialView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">
            My Connections ({mockConnections.length})
          </TabsTrigger>
          <TabsTrigger value="add">Add a Connection</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search or pick a connector for your setup"
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {categories.length > 0 && (
                  <CheckboxFilter
                    options={categories}
                    checkedState={checkedCategories}
                    onCheckboxChange={handleCategoryCheckboxChange}
                    onClearFilter={handleClearFilter}
                    onApply={handleApplyFilter}
                  />
                )}
              </div>

              <div className="space-y-8">
                {Object.entries(connectorsByCategory).map(
                  ([category, connectors]) => (
                    <div key={category}>
                      <h2 className="mb-4 text-xl font-semibold">{category}</h2>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {connectors.map((connector) => (
                          <ConnectorCard
                            key={connector.id}
                            connector={connector}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="manage" className="p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : mockConnections.length === 0 ? (
            <Card className="flex flex-col items-center justify-center space-y-3 rounded-lg border p-6 text-center">
              <div className="flex flex-row gap-2">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <h3 className="mb-2 text-xl font-semibold">
                  No data source connected
                </h3>
              </div>
              <p className="mb-6 text-gray-600">
                Get started by adding your first connection
              </p>
              <Button
                onClick={() =>
                  document
                    .querySelector('[value="add"]')
                    ?.dispatchEvent(new Event('click'))
                }>
                Add a Connection
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockConnections.map((connection) => (
                <Card
                  key={connection.id}
                  className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {connection.connectorConfig?.logo_url && (
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src={connection.connectorConfig.logo_url}
                          alt={connection.connectorConfig.display_name || ''}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{connection.name}</h3>
                      <p className="text-sm text-gray-600">
                        Connected on{' '}
                        {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
