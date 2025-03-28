'use client'

import {AlertTriangle, Loader2, Search} from 'lucide-react'
import {useEffect, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Button, Card, Input} from '@openint/shadcn/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@openint/shadcn/ui/dialog'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import {CheckboxFilter} from '../components/CheckboxFilter'
import {MultiSelectActionBar} from '../components/MultiSelectActionBar'

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
  isSelected,
  onSelect,
  isDeleting,
}: {
  connector: ConnectorConfig
  isSelected?: boolean
  onSelect?: (e: React.MouseEvent) => void
  isDeleting?: boolean
}) {
  return (
    <Card
      className={cn(
        'relative flex aspect-square cursor-pointer flex-col items-center justify-center p-1.5 transition-all hover:bg-gray-50',
        isDeleting && 'pointer-events-none opacity-50',
        isSelected && 'ring-primary ring-2',
      )}
      onClick={onSelect}>
      {isDeleting && (
        <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
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
  mockConnections: initialMockConnections = [],
}: ConnectionPortalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingConnections, setIsDeletingConnections] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tempCheckedCategories, setTempCheckedCategories] = useState<
    Record<string, boolean>
  >({})
  const [appliedCategories, setAppliedCategories] = useState<
    Record<string, boolean>
  >({})
  const [selectedConnections, setSelectedConnections] = useState<Set<string>>(
    new Set(),
  )
  const [connections, setConnections] = useState<Connection[]>(
    initialMockConnections,
  )
  const [selectedConnector, setSelectedConnector] =
    useState<ConnectorConfig | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Simple loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
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
    setTempCheckedCategories(initialCheckedState)
    setAppliedCategories(initialCheckedState)
  }, [mockConnectorConfigs])

  // Get unique categories
  const categories = Array.from(
    new Set(mockConnectorConfigs.map((c) => c.category || 'Other')),
  )

  // Filter handlers for CheckboxFilter
  const handleCategoryCheckboxChange = (id: string) => {
    setTempCheckedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleClearFilter = () => {
    const resetState: Record<string, boolean> = {}
    Object.keys(tempCheckedCategories).forEach((key) => {
      resetState[key] = false
    })
    setTempCheckedCategories(resetState)
    setAppliedCategories(resetState)
  }

  const handleApplyFilter = (selected: string[]) => {
    const newState: Record<string, boolean> = {}
    Object.keys(tempCheckedCategories).forEach((key) => {
      newState[key] = selected.includes(key)
    })
    setAppliedCategories(newState)
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
    const anyChecked = Object.values(appliedCategories).some((value) => value)
    const matchesCategory =
      !anyChecked ||
      (connector.category && appliedCategories[connector.category])

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

  const handleConnectionSelect = (connectionId: string) => {
    setSelectedConnections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId)
      } else {
        newSet.add(connectionId)
      }
      return newSet
    })
  }

  const handleDeleteSelected = async () => {
    setIsDeletingConnections(true)

    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setConnections((prevConnections) =>
      prevConnections.filter(
        (connection) => !selectedConnections.has(connection.id),
      ),
    )
    setSelectedConnections(new Set())
    setIsDeletingConnections(false)
  }

  const handleAddConnection = (connector: ConnectorConfig) => {
    setSelectedConnector(connector)
    setIsModalOpen(true)
  }

  const handleSubmitApiKey = () => {
    // Here you would handle the API key submission
    console.log('Submitting API key:', apiKey)
    setApiKey('')
    setIsModalOpen(false)
    setSelectedConnector(null)
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Enter API Key for {selectedConnector?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
              }}
            />
            <Button onClick={handleSubmitApiKey}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue={initialView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">
            My Connections ({connections.length})
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
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                      }}
                    />
                  </div>
                </div>

                {categories.length > 0 && (
                  <CheckboxFilter
                    options={categories}
                    checkedState={tempCheckedCategories}
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
                            onSelect={() => {
                              handleAddConnection(connector)
                            }}
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
          ) : connections.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Card className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border bg-gray-50/50 px-6 py-10 text-center">
                <div className="rounded-full border border-yellow-200 bg-yellow-100/80 p-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
                  No data source connected
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Connect your first data source to start syncing your data
                  across your tools.
                </p>
                <div className="mt-6">
                  <Button
                    size="lg"
                    className="font-medium"
                    onClick={() =>
                      document
                        .querySelector('[value="add"]')
                        ?.dispatchEvent(new Event('click'))
                    }>
                    Add your first connection
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {connections.map((connection) => (
                  <ConnectorCard
                    key={connection.id}
                    connector={connection.connectorConfig!}
                    isSelected={selectedConnections.has(connection.id)}
                    onSelect={() => {
                      handleConnectionSelect(connection.id)
                    }}
                    isDeleting={
                      isDeletingConnections &&
                      selectedConnections.has(connection.id)
                    }
                  />
                ))}
              </div>
              {selectedConnections.size > 0 && (
                <MultiSelectActionBar
                  selectedCount={selectedConnections.size}
                  onDelete={handleDeleteSelected}
                  onClear={() => {
                    setSelectedConnections(new Set())
                  }}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
