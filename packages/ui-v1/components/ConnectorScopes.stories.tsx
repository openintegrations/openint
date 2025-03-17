import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'
import {Skeleton, Switch} from '@openint/shadcn/ui'
import type {Scope} from './ConnectorScopes'
import {ConnectorScopes} from './ConnectorScopes'

const meta: Meta<typeof ConnectorScopes> = {
  title: 'UI-V1/Components/ConnectorScopes',
  component: ConnectorScopes,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConnectorScopes>

// Sample scopes
const initialScopes: Scope[] = [
  {id: 'read:users', name: 'read:users'},
  {id: 'read:documents', name: 'read:documents'},
  {id: 'read:profiles', name: 'read:profiles'},
  {id: 'read:settings', name: 'read:settings'},
]

const availableScopes: Scope[] = [
  {id: 'write:users', name: 'write:users'},
  {id: 'write:documents', name: 'write:documents'},
  {id: 'write:profiles', name: 'write:profiles'},
  {id: 'write:settings', name: 'write:settings'},
  {id: 'admin:access', name: 'admin:access'},
  {id: 'admin:users', name: 'admin:users'},
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
  const [scopes, setScopes] = useState<Scope[]>([...initialScopes])

  const handleRemoveScope = (scopeToRemove: Scope) => {
    setScopes(scopes.filter((scope) => scope.id !== scopeToRemove.id))
  }

  const handleAddScope = (scopeToAdd: Scope) => {
    // Check if scope already exists
    if (!scopes.some((scope) => scope.id === scopeToAdd.id)) {
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
const ConstrainedWidthExample = () => {
  const [scopes, setScopes] = useState<Scope[]>([...initialScopes])
  const [enabled, setEnabled] = useState(true)

  const handleRemoveScope = (scopeToRemove: Scope) => {
    setScopes(scopes.filter((scope) => scope.id !== scopeToRemove.id))
  }

  const handleAddScope = (scopeToAdd: Scope) => {
    // Check if scope already exists
    if (!scopes.some((scope) => scope.id === scopeToAdd.id)) {
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
          <ConnectorScopes scopes={scopes} editable={false}>
            <ConnectorScopes.List />
          </ConnectorScopes>
        ) : (
          <ConnectorScopes
            scopes={scopes}
            onRemoveScope={handleRemoveScope}
            onAddScope={handleAddScope}
            availableScopes={availableScopes}
            editable={true}>
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
