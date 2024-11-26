'use client'

import {endUserRouterSchema} from '@openint/engine-backend/router/endUserRouter'
import {_trpcReact} from '@openint/engine-frontend'
import {SchemaForm, useToast} from '@openint/ui'
import {copyToClipboard} from '@/lib-client/copyToClipboard'
import {Button} from '../../../../../../packages/ui/shadcn/Button'

export default function MagicLinkPage() {
  const {toast} = useToast()

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
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">Magic Link</h2>
      <SchemaForm
        schema={endUserRouterSchema.createMagicLink.input}
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
            'endUserId',
            'validityInSeconds',
            'displayName',
            'redirectUrl',
            'connectorName',
            'connectorConfigDisplayName',
            'connectorConfigId',
            'showExisting',
          ],
          endUserId: {
            'ui:widget': 'text',
          },
          validityInSeconds: {
            'ui:widget': 'hidden',
          },
          displayName: {
            'ui:widget': 'hidden',
          },
          redirectUrl: {
            'ui:widget': 'hidden',
          },
          connectorName: {
            'ui:widget': 'hidden',
          },
          connectorConfigDisplayName: {
            'ui:widget': 'hidden',
          },
          connectorConfigId: {
            'ui:widget': 'hidden',
          },
          showExisting: {
            'ui:widget': 'hidden',
          },
        }}>
        <Button type="submit" variant="default">
          Submit
        </Button>
      </SchemaForm>
    </div>
  )
}
