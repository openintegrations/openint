'use client'

import {ChevronDown} from 'lucide-react'
import {useState} from 'react'
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
      'customer_id',
      'validity_in_seconds',
      'display_name',
      'redirect_url',
      'connector_config_display_name',
      'connector_config_id',
      'connector_names',
      'integration_ids',
      'connection_id',
      'theme',
      'view',
      'show_existing',
    ],
    customer_id: {
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
    validity_in_seconds: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Validity In Seconds</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          How long the magic link will be valid for (in seconds) before it
          expires
        </span>
      ),
    },
    display_name: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Display Name</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">What to call user by</span>
      ),
    },
    redirect_url: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Redirect URL</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Where to send user to after connect / if they press back button
        </span>
      ),
    },
    connector_config_display_name: {
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
    connector_config_id: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Connector Config ID</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">Must start with ccfg_</span>
      ),
    },
    connector_names: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Connector Names</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Filter integrations by comma separated connector names
        </span>
      ),
    },
    integration_ids: {
      'ui:widget': showAdvanced ? 'text' : 'hidden',
      'ui:title': <span className="font-semibold">Integration IDs</span>,
      'ui:description': (
        <span className="text-sm text-gray-600">
          Filter integrations by comma separated integration ids
        </span>
      ),
    },
    connection_id: {
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
    show_existing: {
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
          schema={customerRouterSchema.createMagicLink.input}
          uiSchema={uiSchema}
          loading={createMagicLink.isLoading}
          onSubmit={({formData: values}) => {
            createMagicLink.mutate(values, {
              onSuccess: async (data) => {
                await copyToClipboard(data.url)
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
