'use client'

import {Loader2} from 'lucide-react'
import type {AppRouter} from '@openint/api'
import {zOrganization} from '@openint/engine-backend/services/AuthProvider'
import type {TRPCReact} from '@openint/engine-frontend'
import {_trpcReact, useMutationToast} from '@openint/engine-frontend'
import {SchemaForm} from '@openint/ui'
import useRefetchOnSwitch from '../useRefetchOnSwitch'

const trpcReact = _trpcReact as unknown as TRPCReact<AppRouter>

export default function SettingsPage() {
  const res = trpcReact.getCurrentOrganization.useQuery()
  useRefetchOnSwitch(res.refetch)

  const updateOrg = trpcReact.updateCurrentOrganization.useMutation({
    ...useMutationToast({
      successMessage: 'Organization updated',
      errorMessage: 'Failed to save organization',
    }),
  })

  if (!res.data) {
    return null
  }

  return res && !(res.isLoading || res.isRefetching) ? (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">
        Settings - {res.data.id}
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Configure your database, schema, and webhook settings to manage how data
        is stored, organized, and synced across your integrations.
      </p>
      <SchemaForm
        schema={zOrganization.shape.publicMetadata}
        uiSchema={{
          // Would be nice if this can be extracted from example field of the openapi spec
          database_url: {
            'ui:placeholder': 'postgres://username:password@host:port/database',
          },
          webhook_url: {'ui:placeholder': 'https://yourapp.com/webhook'},
        }}
        formData={res.data.publicMetadata}
        loading={updateOrg.isLoading}
        onSubmit={({formData}) => {
          updateOrg.mutate(
            {publicMetadata: formData},
            {
              onSuccess: () => {
                res.refetch()
              },
            },
          )
        }}
      />
    </div>
  ) : (
    <div className="flex size-full flex-1 items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-button" />
    </div>
  )
}
