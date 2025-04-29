'use client'

import type {Core} from '@openint/api-v1/models'

import {useSuspenseQuery} from '@tanstack/react-query'
import {AddConnectorConfig} from '@openint/ui-v1'
import {useTRPC} from '@/lib-client/TRPCApp'

interface AddConnectorConfigWrapperProps {
  onSelectConnector: (connector: Core['connector']) => void
}

export function AddConnectorConfigWrapper({
  onSelectConnector,
}: AddConnectorConfigWrapperProps) {
  const trpc = useTRPC()
  const connectorRes = useSuspenseQuery(
    trpc.listConnectors.queryOptions({
      expand: ['schemas'],
    }),
  )

  return (
    <AddConnectorConfig
      connectors={connectorRes.data.items}
      onSelectConnector={onSelectConnector}
    />
  )
}
