import React from 'react'
import { ConnectorsTableWrapper } from './ConnectorsTableWrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

// Wrap with QueryClientProvider
const StoryWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

export default {
  title: 'UI/Tables/ConnectorsTableWrapper',
  component: ConnectorsTableWrapper,
}

// Mock data based on the screenshot
const mockConnectors = [
  {
    id: '1',
    name: 'Salesforce',
    logo: 'https://logo.clearbit.com/salesforce.com',
    type: 'CRM',
    authType: 'oauth2',
    audience: 'GA',
    version: 'V2',
    connectionCount: 1250,
    status: 'enabled' as const,
  },
  {
    id: '2',
    name: 'Google Drive',
    logo: 'https://logo.clearbit.com/google.com',
    type: 'File Storage',
    authType: 'oauth2',
    audience: 'GA',
    version: 'V3',
    connectionCount: 890,
    status: 'enabled' as const,
  },
]

// Empty state story
export const EmptyState = () => {
  const emptyQuery = {
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  }

  return (
    <StoryWrapper>
      <div className="container mx-auto p-6">
        <ConnectorsTableWrapper 
          query={emptyQuery as any}
          onEdit={(connector) => console.log('Edit', connector)}
          onRun={(connector) => console.log('Run', connector)}
          onAddConnector={() => console.log('Add connector clicked')}
        />
      </div>
    </StoryWrapper>
  )
}

// With data story
export const WithConnectors = () => {
  const mockQuery = {
    data: mockConnectors,
    isLoading: false,
    isError: false,
    error: null,
  }

  return (
    <StoryWrapper>
      <div className="container mx-auto p-6">
        <ConnectorsTableWrapper 
          query={mockQuery as any}
          onEdit={(connector) => console.log('Edit', connector)}
          onRun={(connector) => console.log('Run', connector)}
          onAddConnector={() => console.log('Add connector clicked')}
        />
      </div>
    </StoryWrapper>
  )
} 