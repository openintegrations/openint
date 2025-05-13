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

// Extended set of URL-like scopes for Google services
const googleLongUrlScopes: string[] = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.settings.readonly',
  'https://www.googleapis.com/auth/calendar.addons.execute',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/user.addresses.read',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
]

// Extended set of many scopes for demonstrating "+X more" functionality
const manyScopes: string[] = [
  'read:users',
  'read:documents',
  'read:profiles',
  'read:settings',
  'write:users',
  'write:documents',
  'write:profiles',
  'write:settings',
  'admin:access',
  'admin:users',
  'admin:system',
  'admin:billing',
  'api:read',
  'api:write',
  'api:admin',
  'api:metrics',
  'api:logs',
  'api:config',
  'api:status',
  'api:diagnostics',
  // User scopes
  'user:read',
  'user:write',
  'user:delete',
  'user:profile:read',
  'user:profile:write',
  'user:settings:read',
  'user:settings:write',
  'user:billing:read',
  'user:billing:write',
  'user:auth:read',
  'user:auth:write',
  // Content scopes
  'content:read',
  'content:write',
  'content:delete',
  'content:publish',
  'content:draft',
  'content:archive',
  'content:restore',
  'content:export',
  'content:import',
  // Analytics scopes
  'analytics:view',
  'analytics:export',
  'analytics:reports:basic',
  'analytics:reports:advanced',
  'analytics:reports:custom',
  'analytics:dashboards:view',
  'analytics:dashboards:create',
  'analytics:dashboards:share',
  // Admin scopes
  'admin:full',
  'admin:readonly',
  'admin:users',
  'admin:content',
  'admin:settings',
  'admin:billing',
  'admin:security',
  'admin:logs',
  'admin:backup',
  'admin:restore',
  // Integration scopes
  'integration:connect',
  'integration:disconnect',
  'integration:configure',
  'integration:oauth',
  'integration:webhook:read',
  'integration:webhook:write',
  // Domain specific scopes
  'files:read',
  'files:write',
  'files:delete',
  'comments:read',
  'comments:write',
  'comments:delete',
  'notifications:read',
  'notifications:write',
  'tags:read',
  'tags:write',
  'categories:read',
  'categories:write',
  // System scopes
  'system:read',
  'system:write',
  'system:metrics',
  'system:logs',
  'system:config',
  'system:diagnostics',
  'system:health',
  'system:cache',
  // Additional scopes to reach 70+
  'payments:read',
  'payments:write',
  'subscriptions:read',
  'subscriptions:write',
  'messages:read',
  'messages:write',
  'events:read',
  'events:write',
]

// Extended set of 70+ scopes for demonstrating large quantity of scopes
const largeNumberOfScopes: string[] = [
  // API scopes
  'api:read',
  'api:write',
  'api:admin',
  'api:metrics',
  'api:logs',
  'api:config',
  'api:status',
  'api:diagnostics',
  // User scopes
  'user:read',
  'user:write',
  'user:delete',
  'user:profile:read',
  'user:profile:write',
  'user:settings:read',
  'user:settings:write',
  'user:billing:read',
  'user:billing:write',
  'user:auth:read',
  'user:auth:write',
  // Content scopes
  'content:read',
  'content:write',
  'content:delete',
  'content:publish',
  'content:draft',
  'content:archive',
  'content:restore',
  'content:export',
  'content:import',
  // Analytics scopes
  'analytics:view',
  'analytics:export',
  'analytics:reports:basic',
  'analytics:reports:advanced',
  'analytics:reports:custom',
  'analytics:dashboards:view',
  'analytics:dashboards:create',
  'analytics:dashboards:share',
  // Admin scopes
  'admin:full',
  'admin:readonly',
  'admin:users',
  'admin:content',
  'admin:settings',
  'admin:billing',
  'admin:security',
  'admin:logs',
  'admin:backup',
  'admin:restore',
  // Integration scopes
  'integration:connect',
  'integration:disconnect',
  'integration:configure',
  'integration:oauth',
  'integration:webhook:read',
  'integration:webhook:write',
  // Domain specific scopes
  'files:read',
  'files:write',
  'files:delete',
  'comments:read',
  'comments:write',
  'comments:delete',
  'notifications:read',
  'notifications:write',
  'tags:read',
  'tags:write',
  'categories:read',
  'categories:write',
  // System scopes
  'system:read',
  'system:write',
  'system:metrics',
  'system:logs',
  'system:config',
  'system:diagnostics',
  'system:health',
  'system:cache',
  // Additional scopes to reach 70+
  'payments:read',
  'payments:write',
  'subscriptions:read',
  'subscriptions:write',
  'messages:read',
  'messages:write',
  'events:read',
  'events:write',
]

const availableScopes: string[] = [
  // Original scopes
  'write:users',
  'write:documents',
  'write:profiles',
  'write:settings',
  'admin:access',
  'admin:users',
  'admin:system',
  'admin:billing',
  // API scopes
  'api:read',
  'api:write',
  'api:admin',
  'api:metrics',
  'api:logs',
  'api:config',
  'api:status',
  'api:diagnostics',
  // User scopes
  'user:read',
  'user:write',
  'user:delete',
  'user:profile:read',
  'user:profile:write',
  'user:settings:read',
  'user:settings:write',
  'user:billing:read',
  'user:billing:write',
  'user:auth:read',
  'user:auth:write',
  // Content scopes
  'content:read',
  'content:write',
  'content:delete',
  'content:publish',
  'content:draft',
  'content:archive',
  'content:restore',
  'content:export',
  'content:import',
  // Analytics scopes
  'analytics:view',
  'analytics:export',
  'analytics:reports:basic',
  'analytics:reports:advanced',
  'analytics:reports:custom',
  'analytics:dashboards:view',
  'analytics:dashboards:create',
  'analytics:dashboards:share',
  // Admin scopes
  'admin:full',
  'admin:readonly',
  'admin:content',
  'admin:settings',
  'admin:security',
  'admin:logs',
  'admin:backup',
  'admin:restore',
  // Integration scopes
  'integration:connect',
  'integration:disconnect',
  'integration:configure',
  'integration:oauth',
  'integration:webhook:read',
  'integration:webhook:write',
  // Domain specific scopes
  'files:read',
  'files:write',
  'files:delete',
  'comments:read',
  'comments:write',
  'comments:delete',
  'notifications:read',
  'notifications:write',
  'tags:read',
  'tags:write',
  'categories:read',
  'categories:write',
  // System scopes
  'system:read',
  'system:write',
  'system:metrics',
  'system:logs',
  'system:config',
  'system:diagnostics',
  'system:health',
  'system:cache',
  // Additional scopes
  'payments:read',
  'payments:write',
  'subscriptions:read',
  'subscriptions:write',
  'messages:read',
  'messages:write',
  'events:read',
  'events:write',
]

// Sheet view example simulating the app's UI
const SheetViewExample = ({
  hideCustomInput = false,
  useLargeScopes = false,
}: {
  hideCustomInput?: boolean
  useLargeScopes?: boolean
}) => {
  const [scopes, setScopes] = useState<string[]>(
    useLargeScopes ? largeNumberOfScopes : manyScopes,
  )
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

  const handleClearAllScopes = () => {
    setScopes([])
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
                ? 'Credentials are enabled. You can edit scopes.'
                : 'Credentials are disabled. Scopes are read-only.'}
            </span>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <div style={{width: '100%'}}>
        <h3 style={{fontSize: '18px', fontWeight: '500', marginBottom: '16px'}}>
          Scopes {useLargeScopes ? `(${scopes.length})` : ''}
        </h3>
        {!enabled ? (
          <ConnectorScopes
            scopes={scopes}
            editable={false}
            scopeLookup={scopeLookup}
            hideCustomInput={hideCustomInput}
          />
        ) : (
          <ConnectorScopes
            scopes={scopes}
            onRemoveScope={handleRemoveScope}
            onAddScope={handleAddScope}
            onClearAllScopes={handleClearAllScopes}
            availableScopes={availableScopes}
            editable={true}
            scopeLookup={scopeLookup}
            hideCustomInput={hideCustomInput}
          />
        )}
      </div>
    </div>
  )
}

export const SheetViewWithLargeNumberOfScopes: Story = {
  render: () => <SheetViewExample useLargeScopes={true} />,
}

// SheetView with Google URL scopes example
const SheetViewWithLongUrlScopes = () => {
  const [scopes, setScopes] = useState<string[]>(
    googleLongUrlScopes.slice(0, 6),
  )
  const [enabled, setEnabled] = useState(true)

  const handleRemoveScope = (scopeToRemove: string) => {
    setScopes(scopes.filter((scope) => scope !== scopeToRemove))
  }

  const handleAddScope = (scopeToAdd: string) => {
    if (!scopes.some((scope) => scope === scopeToAdd)) {
      setScopes([...scopes, scopeToAdd])
    }
  }

  const handleClearAllScopes = () => {
    setScopes([])
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
          Google Drive Connector
        </h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div>
            <p
              style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
              OAuth Configuration
            </p>
            <Skeleton className="h-8 w-full" />
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
              Enable Google API Access
            </span>
            <span style={{fontSize: '14px', color: '#6b7280'}}>
              {enabled
                ? 'API access is enabled. You can edit scopes.'
                : 'API access is disabled. Scopes are read-only.'}
            </span>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <div style={{width: '100%'}}>
        <h3 style={{fontSize: '18px', fontWeight: '500', marginBottom: '16px'}}>
          Google API Scopes
        </h3>
        {!enabled ? (
          <ConnectorScopes scopes={scopes} editable={false} />
        ) : (
          <ConnectorScopes
            scopes={scopes}
            onRemoveScope={handleRemoveScope}
            onAddScope={handleAddScope}
            onClearAllScopes={handleClearAllScopes}
            availableScopes={googleLongUrlScopes}
            editable={true}
          />
        )}
      </div>
    </div>
  )
}

export const SheetViewWithGoogleLongUrlScopes: Story = {
  render: () => <SheetViewWithLongUrlScopes />,
}

const scopeLookup = {
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
  'admin:system': {
    scope: 'admin:system',
    display_name: 'Admin System',
    description: 'Administrative control over system configuration',
  },
  'admin:billing': {
    scope: 'admin:billing',
    display_name: 'Admin Billing',
    description: 'Administrative control over billing and payments',
  },
}

// Basic example with default configuration
export const CardView: Story = {
  args: {
    scopes: manyScopes.slice(0, 10),
    editable: true,
    availableScopes: availableScopes,
    view: 'card',
  },
}

// Example with no-card view
export const NoCardView: Story = {
  args: {
    scopes: manyScopes.slice(0, 10),
    editable: false,
    view: 'no-card',
  },
  decorators: [
    (Story) => (
      <div className="border-border/40 bg-muted/5 rounded-lg border p-4">
        <Story />
      </div>
    ),
  ],
}
