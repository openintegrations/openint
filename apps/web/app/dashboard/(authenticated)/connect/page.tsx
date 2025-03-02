'use client'

import {ChevronDown} from 'lucide-react'
import {useState} from 'react'
import {isMainPreview} from '@openint/app-config/constants'
import {customerRouterSchema} from '@openint/engine-backend/router/customerRouter'
import {_trpcReact} from '@openint/engine-frontend'
import {SchemaForm, useToast} from '@openint/ui'
import {copyToClipboard} from '@/lib-client/copyToClipboard'
import {Button} from '../../../../../../packages/ui/shadcn/Button'

export default function MagicLinkPage() {
  const {toast} = useToast()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const createMagicLink = _trpcReact.createMagicLink.useMutation({
    onError: (err) => {
      toast({
        title: 'Error creating magic link',
        description: `${err.message}`,
        variant: 'destructive',
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
      'ui:options': {
        // @snrondina: this placeholder is too non-faint to work well.
        // I mistook it for real value and got confused why magic link creation failed
        // placeholder: 'my-user-id',
      },
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
    displayName: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Display Name</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">What to call user by</span>
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
    connectorConfigDisplayName: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': (
        <span className="font-semibold">Connector Config Display Name</span>
      ),
      'ui:description': (
        <span className="text-sm text-gray-600">
          Filter connector config by displayName
        </span>
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
          }}
          onSubmit={({formData: values}) => {
            createMagicLink.mutate(values, {
              onSuccess: async (data) => {
                if (isMainPreview) {
                  window.location.href = data.url
                } else {
                  await copyToClipboard(data.url)
                }
                toast({
                  title: 'Magic link copied to clipboard',
                  variant: 'success',
                })
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
