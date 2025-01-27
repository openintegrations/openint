'use client'

import Image from 'next/image'
import React from 'react'
import {extractConnectorName, zRaw} from '@openint/cdk'
import {_trpcReact} from '@openint/engine-frontend'
import type {SchemaSheetRef} from '@openint/ui'
import {Badge, cn, SchemaSheet, SheetDescription} from '@openint/ui'
import type {ZClient} from '@/lib-common/schemas'

const formSchema = zRaw.connection.pick({
  id: true,
  customerId: true,
  settings: true,
  disabled: true,
  displayName: true,
  //
  connectorConfigId: true,
  integrationId: true,
})

/** TODO: See if we can eliminate the need having entity specific sheets */
export const ConnectionSheet = React.forwardRef(function ConnectionSheet(
  props: {connection?: ZClient['connection']; triggerButton?: boolean},
  ref: SchemaSheetRef,
) {
  const catalogRes = _trpcReact.listConnectorMetas.useQuery()

  const updateConnection = _trpcReact.updateConnection.useMutation()

  const connector =
    props.connection &&
    catalogRes.data?.[extractConnectorName(props.connection.id)]
  if (!connector) {
    return null
  }

  return (
    <SchemaSheet
      ref={ref}
      triggerButton={props.triggerButton}
      title={props.connection ? 'Edit' : 'New Connection'}
      buttonProps={{variant: props.connection ? 'ghost' : 'default'}}
      formProps={{
        uiSchema: {
          id: {'ui:readonly': true},
          connectorConfigId: {'ui:readonly': true},
          integrationId: {'ui:readonly': true},
        },
      }}
      schema={formSchema}
      mutation={updateConnection}
      initialValues={props.connection}>
      <div className="flex max-h-[100px] flex-row items-center justify-between">
        {connector.logo_url ? (
          <Image
            width={100}
            height={100}
            src={connector.logo_url}
            alt={connector.display_name}
          />
        ) : (
          <span>{connector.display_name}</span>
        )}
        <Badge
          variant="secondary"
          className={cn(
            'ml-auto',
            connector.stage === 'ga' && 'bg-green-200',
            connector.stage === 'beta' && 'bg-blue-200',
            connector.stage === 'alpha' && 'bg-pink-50',
          )}>
          {connector.stage}
        </Badge>
        {/* Add help text here */}
      </div>

      <SheetDescription>
        {props.connection && `ID: ${props.connection.id}`}
        <br />
        Supported mode(s): {connector.supported_modes.join(', ')}
      </SheetDescription>
    </SchemaSheet>
  )
})
