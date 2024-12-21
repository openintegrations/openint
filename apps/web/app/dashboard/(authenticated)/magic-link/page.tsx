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

  return (
    <div className="p-6">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">Magic Link</h2>
      <p className="mb-4 text-sm text-gray-600">
        Create a unique link for your customers to manage their connections.
      </p>
      <div className="max-w-xl">
        <SchemaForm
          schema={customerRouterSchema.createMagicLink.input}
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
          }}
          uiSchema={{
            'ui:order': [
              'customerId',
              'validityInSeconds',
              'displayName',
              'redirectUrl',
              'connectorName',
              'connectorConfigDisplayName',
              'connectorConfigId',
              'showExisting',
            ],
            customerId: {
              'ui:widget': 'text',
              'ui:title': <span className="font-semibold">Customer Id</span>,
              'ui:description': (
                <span className="text-sm text-gray-600">
                  Anything that uniquely identifies the customer that you will
                  be sending the magic link to
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
              'ui:title': (
                <span className="font-semibold">Validity In Seconds</span>
              ),
              'ui:description': (
                <span className="text-sm text-gray-600">
                  How long the magic link will be valid for (in seconds) before
                  it expires
                </span>
              ),
            },
            displayName: {
              'ui:widget': showAdvanced ? 'text' : 'hidden',
              'ui:title': <span className="font-semibold">Display Name</span>,
              'ui:description': (
                <span className="text-sm text-gray-600">
                  What to call user by
                </span>
              ),
            },
            redirectUrl: {
              'ui:widget': showAdvanced ? 'text' : 'hidden',
              'ui:title': <span className="font-semibold">Redirect URL</span>,
              'ui:description': (
                <span className="text-sm text-gray-600">
                  Where to send user to after connect / if they press back
                  button
                </span>
              ),
            },
            connectorName: {
              'ui:widget': showAdvanced ? 'text' : 'hidden',
              'ui:title': <span className="font-semibold">Connector Name</span>,
              'ui:description': (
                <span className="text-sm text-gray-600">
                  Filter connector config by connector name
                </span>
              ),
            },
            connectorConfigDisplayName: {
              'ui:widget': showAdvanced ? 'text' : 'hidden',
              'ui:title': (
                <span className="font-semibold">
                  Connector Config Display Name
                </span>
              ),
              'ui:description': (
                <span className="text-sm text-gray-600">
                  Filter connector config by displayName
                </span>
              ),
            },
            connectorConfigId: {
              'ui:widget': showAdvanced ? 'text' : 'hidden',
              'ui:title': (
                <span className="font-semibold">Connector Config ID</span>
              ),
              'ui:description': (
                <span className="text-sm text-gray-600">
                  Must start with ccfg_
                </span>
              ),
            },
            showExisting: {
              'ui:widget': showAdvanced ? 'checkbox' : 'hidden',
              'ui:title': <span className="font-semibold">Show Existing</span>,
            },
          }}>
          <div className="mt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex items-center"
              onClick={(e) => {
                e.preventDefault()
                setShowAdvanced(!showAdvanced)
              }}>
              Advanced settings
              <ChevronDown
                className={`ml-2 transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out ${
              showAdvanced ? 'max-h-full opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className="overflow-hidden">
              {/* Advanced fields go here */}
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" variant="default">
              Create Magic Link
            </Button>
          </div>
        </SchemaForm>
      </div>
    </div>
  )
}
