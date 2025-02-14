'use client'

import {Loader2} from 'lucide-react'
import type {AppRouter} from '@openint/api'
import {zOrganization} from '@openint/engine-backend/services/AuthProvider'
import type {TRPCReact} from '@openint/engine-frontend'
import {_trpcReact, useMutationToast} from '@openint/engine-frontend'
import {Button, SchemaForm} from '@openint/ui'
import useRefetchOnSwitch from '../useRefetchOnSwitch'

const trpcReact = _trpcReact as unknown as TRPCReact<AppRouter>

export default function SettingsForm() {
  const res = trpcReact.getCurrentOrganization.useQuery()
  useRefetchOnSwitch(res.refetch)

  const updateOrg = trpcReact.updateCurrentOrganization.useMutation({
    ...useMutationToast({
      successMessage: 'Organization updated',
      errorMessage: 'Failed to save organization',
    }),
  })

  if (res.isLoading || res.isRefetching) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.96))] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-button" />
      </div>
    )
  }

  if (!res.data) {
    return null
  }

  return (
    <>
      <SchemaForm
        className="mt-4"
        schema={zOrganization.shape.publicMetadata.omit({
          synced_data_schema: true,
          migrate_tables: true,
          database_url: res.data.id !== 'org_2nkeyWpfGKK6W011qwV8dA1la8n',
        })}
        uiSchema={{
          // Would be nice if this can be extracted from example field of the openapi spec
          database_url: {
            'ui:placeholder': 'postgres://username:password@host:port/database',
          },
          webhook_url: {
            'ui:placeholder': 'https://yourapp.com/webhook',
          },
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
        }}>
        <Button type="submit" className="mt-4">
          Save Settings
        </Button>
      </SchemaForm>
    </>
  )
}
