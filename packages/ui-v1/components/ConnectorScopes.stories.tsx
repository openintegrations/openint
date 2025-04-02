import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {Skeleton, Switch} from '@openint/shadcn/ui'
import {ConnectorScopes} from './ConnectorScopes'

const meta: Meta<typeof ConnectorScopes> = {
  component: ConnectorScopes,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConnectorScopes>

// Sample scopes
const initialScopes: string[] = [
  'read:users',
  'read:documents',
  'read:profiles',
  'read:settings',
]

const availableScopes: string[] = [
  'write:users',
  'write:documents',
  'write:profiles',
  'write:settings',
  'admin:access',
  'admin:users',
]

// Default view (read-only)
export const Default: Story = {
  args: {
    scopes: initialScopes,
    editable: false,
  },
  render: (args) => (
    <ConnectorScopes {...args}>
      <ConnectorScopes.List />
    </ConnectorScopes>
  ),
}

// Interactive story with state management
const EditableExample = () => {
  const [scopes, setScopes] = useState<string[]>(initialScopes)

  const handleRemoveScope = (scopeToRemove: string) => {
    setScopes(scopes.filter((scope) => scope !== scopeToRemove))
  }

  const handleAddScope = (scopeToAdd: string) => {
    // Check if scope already exists
    if (!scopes.some((scope) => scope === scopeToAdd)) {
      setScopes([...scopes, scopeToAdd])
    }
  }

  return (
    <ConnectorScopes
      scopes={scopes}
      onRemoveScope={handleRemoveScope}
      onAddScope={handleAddScope}
      availableScopes={availableScopes}
      editable={true}>
      <ConnectorScopes.AddButton />
      <ConnectorScopes.List />
    </ConnectorScopes>
  )
}

export const Editable: Story = {
  render: () => <EditableExample />,
}

// Constrained width example simulating a sheet
const ConstrainedWidthExample = ({
  scopesLookup,
}: {
  scopesLookup?: Record<
    string,
    {scope: string; display_name: string; description: string}
  >
}) => {
  const [scopes, setScopes] = useState<string[]>(initialScopes)
  const [enabled, setEnabled] = useState(true)

  const handleRemoveScope = (scopeToRemove: string) => {
    setScopes(scopes.filter((scope) => scope !== scopeToRemove))
  }

  const handleAddScope = (scopeToAdd: string) => {
    // Check if scope already exists
    if (!scopes.some((scope) => scope === scopeToAdd)) {
      setScopes([...scopes, scopeToAdd])
    }
  }

  return (
    <div
      style={{
        width: '450px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <div style={{marginBottom: '32px'}}>
        <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '24px'}}>
          Connector Details
        </h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div>
            <p
              style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
              Name
            </p>
            <Skeleton className="h-8 w-full" />
          </div>
          <div>
            <p
              style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
              Description
            </p>
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <p
              style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
              API Key
            </p>
            <Skeleton className="h-8 w-full" />
          </div>
          <div>
            <p
              style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
              Status
            </p>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>

      <div style={{width: '100%', marginBottom: '24px'}}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
            <span style={{fontSize: '16px', fontWeight: '500'}}>
              Enable OpenInt Credentials
            </span>
            <span style={{fontSize: '14px', color: '#6b7280'}}>
              {enabled
                ? 'Credentials are enabled. Scopes are read-only.'
                : 'Credentials are disabled. You can edit scopes.'}
            </span>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <div style={{width: '100%'}}>
        <h3 style={{fontSize: '18px', fontWeight: '500', marginBottom: '16px'}}>
          Scopes
        </h3>
        {enabled ? (
          <ConnectorScopes
            scopes={scopes}
            editable={false}
            scopeLookup={scopesLookup}>
            <ConnectorScopes.List />
          </ConnectorScopes>
        ) : (
          <ConnectorScopes
            scopes={scopes}
            onRemoveScope={handleRemoveScope}
            onAddScope={handleAddScope}
            availableScopes={availableScopes}
            editable={true}
            scopeLookup={scopesLookup}>
            <ConnectorScopes.AddButton />
            <ConnectorScopes.List />
          </ConnectorScopes>
        )}
      </div>
    </div>
  )
}

export const ConstrainedWidth: Story = {
  render: () => <ConstrainedWidthExample />,
}

const scopesLookup = {
  'read:users': {
    scope: 'read:users',
    display_name: 'Read Users',
    description: 'Access to view user information',
  },
  'read:documents': {
    scope: 'read:documents',
    display_name: 'Read Documents',
    description: 'Access to view documents and their metadata',
  },
  'read:profiles': {
    scope: 'read:profiles',
    display_name: 'Read Profiles',
    description: 'Access to view user profiles and preferences',
  },
  'read:settings': {
    scope: 'read:settings',
    display_name: 'Read Settings',
    description: 'Access to view system and application settings',
  },
  'write:users': {
    scope: 'write:users',
    display_name: 'Write Users',
    description: 'Permission to create and modify user information',
  },
  'write:documents': {
    scope: 'write:documents',
    display_name: 'Write Documents',
    description: 'Permission to create, update, and delete documents',
  },
  'write:profiles': {
    scope: 'write:profiles',
    display_name: 'Write Profiles',
    description: 'Permission to update user profiles and preferences',
  },
  'write:settings': {
    scope: 'write:settings',
    display_name: 'Write Settings',
    description: 'Permission to modify system and application settings',
  },
  'admin:access': {
    scope: 'admin:access',
    display_name: 'Admin Access',
    description: 'Full administrative access to the system',
  },
  'admin:users': {
    scope: 'admin:users',
    display_name: 'Admin Users',
    description: 'Administrative control over user accounts and permissions',
  },
}

export const WithScopeLookup: Story = {
  render: () => <ConstrainedWidthExample scopesLookup={scopesLookup} />,
}
