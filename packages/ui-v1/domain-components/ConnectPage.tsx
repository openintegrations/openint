'use client'

import {ChevronDown} from 'lucide-react'
import {useState} from 'react'
import {Button} from '@openint/shadcn/ui'
import {toast} from '@openint/shadcn/ui/sonner'
import {JSONSchemaForm} from '../components/schema-form'

// Define the type for the trpc response
interface MagicLinkResponse {
  url: string
}

// Defining the error type
interface ErrorWithMessage {
  message: string
}

export interface ConnectPageProps {
  isMainPreview?: boolean
  customerRouterSchema: any
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(content: string): Promise<void> {
  // Workaround https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
  if (typeof navigator.clipboard === 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.value = content
    textarea.style.position = 'fixed' // avoid scrolling to bottom
    document.body.append(textarea)
    textarea.focus()
    textarea.select()
    try {
      document.execCommand('copy')
    } catch {
      console.warn('Unable to use textarea hack to copy')
    }
    textarea.remove()
  } else {
    await navigator.clipboard.writeText(content)
  }
}

export function ConnectPage({
  isMainPreview = false,
  customerRouterSchema,
}: ConnectPageProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // This is a mock implementation for storybook
  // In real usage, this would be imported from @openint/engine-frontend
  const _trpcReact =
    typeof window !== 'undefined' ? (window as any)._trpcReact : null

  const createMagicLink = _trpcReact?.createMagicLink?.useMutation({
    onError: (err: ErrorWithMessage) => {
      toast.error('Error creating magic link', {
        description: err.message,
      })
    },
  }) || {
    mutate: (
      values: any,
      options: {onSuccess: (data: MagicLinkResponse) => void},
    ) => {
      console.log('Mock mutate called with values:', values)
      options.onSuccess({
        url: `https://connect.example.com/${values.customerId}`,
      })
    },
    isLoading: false,
  }

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
        <JSONSchemaForm
          // Omit theme from schema since there's a bug where the tailwind theme setting
          // is shared between connect and console
          jsonSchema={customerRouterSchema.createMagicLink.input}
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
              onSuccess: async (data: MagicLinkResponse) => {
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
        </JSONSchemaForm>
      </div>
    </div>
  )
}
