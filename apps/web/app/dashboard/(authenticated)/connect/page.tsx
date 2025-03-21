'use client'

import {ChevronDown} from 'lucide-react'
import {useState} from 'react'
import {isMainPreview} from '@openint/app-config/constants'
import {customerRouterSchema} from '@openint/engine-backend/router/customerRouter'
import {_trpcReact} from '@openint/engine-frontend'
import {SchemaForm} from '@openint/ui'
import {toast} from '@openint/ui-v1/components/toast'
import {copyToClipboard} from '@/lib-client/copyToClipboard'
import {Button} from '@openint/shadcn/ui'

export default function MagicLinkPage() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const createMagicLink = _trpcReact.createMagicLink.useMutation({
    onError: (err) => {
      toast.error('Error creating magic link', {
        description: `${err.message}`,
      })
    },
  })

  const uiSchema = {
    'ui:order': [
      'customerId',
      'validityInSeconds',
      'displayName',
      'redirectUrl',
      'connectorConfigDisplayName',
      'connectorConfigId',
      'connectorNames',
      'integrationIds',
      'connectionId',
      'theme',
      'view',
      'showExisting',
    ],
    customerId: {
      'ui:widget': 'text',
      'ui:title': <span className="font-semibold">Customer Id</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Anything that uniquely identifies the customer that you will be
          sending the magic link to
        </span>
      ),
    },
    validityInSeconds: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Validity In Seconds</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          How long the magic link will be valid for (in seconds) before it
          expires
        </span>
      ),
    },
    redirectUrl: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Redirect URL</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Where to send user to after connect / if they press back button
        </span>
      ),
    },
    displayName: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Customer Display Name </span>,
      'ui:description': (
        <span className="text-sm text-gray-600">What to call user by</span>
      ),
    },
    connectorConfigId: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Connector Config ID</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">Must start with ccfg_</span>
      ),
    },
    connectorNames: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Connector Names</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Filter integrations by comma separated connector names
        </span>
      ),
    },
    integrationIds: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Integration IDs</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Filter integrations by comma separated integration ids
        </span>
      ),
    },
    connectionId: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Connection ID</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Filter managed connections by connection id
        </span>
      ),
    },
    theme: {
      'ui:widget': showAdvanced ? 'select' : 'hidden',
      'ui:title': <span className="font-semibold">Theme</span>,
    },
    view: {
      'ui:widget': showAdvanced ? 'select' : 'hidden',
      'ui:title': <span className="font-semibold">View</span>,
    },
    showExisting: {
      'ui:widget': showAdvanced ? 'checkbox' : 'hidden',
      'ui:title': <span className="font-semibold">Show Existing</span>,
    },
  }

  return (
    <div className="p-6">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">Magic Link</h2>
      <p className="mb-4 text-sm text-gray-600">
        Create a unique link for your customers to manage their connections.
      </p>
      <div className="max-w-xl">
        <SchemaForm
          // Omit theme from schema since there's a bug where the tailwind theme setting
          // is shared between connect and console
          schema={customerRouterSchema.createMagicLink.input}
          uiSchema={uiSchema}
          loading={createMagicLink.isLoading}
          formData={{
            theme: 'light',
            view: 'add',
            customerId: isMainPreview
              ? `stably-user-${Math.random().toString(36).substring(2, 12)}`
              : undefined,
          }}
          onSubmit={({formData: values}) => {
            createMagicLink.mutate(values, {
              onSuccess: async (data) => {
                await copyToClipboard(data.url)

                if (isMainPreview) {
                  window.location.href = data.url
                }
                toast.success('Magic link copied to clipboard')
              },
            })
          }}>
          <div className="space-y-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex items-center"
              onClick={() => setShowAdvanced(!showAdvanced)}>
              Advanced settings
              <ChevronDown
                className={`ml-2 transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </Button>
            <Button type="submit" variant="default">
              Create Magic Link
            </Button>
          </div>
        </SchemaForm>
      </div>
    </div>
  )
}
