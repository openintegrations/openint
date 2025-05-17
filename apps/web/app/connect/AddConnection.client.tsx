'use client'

import type {ConnectorConfig} from '@openint/api-v1/trpc/routers/connectorConfig.models'
import type {Id} from '@openint/cdk'

import {type ConnectorName} from '@openint/api-v1/trpc/routers/connector.models'
import {Label} from '@openint/shadcn/ui'
import {ConnectorConfigCard} from '@openint/ui-v1/domain-components/ConnectorConfigCard'
import {ConnectorConnectContainer} from './ConnectorConnect.client'

export type ConnectorConfigForCustomer = Pick<
  ConnectorConfig<'connector'>,
  'id' | 'connector_name' | 'connector'
>

export function AddConnectionCard({
  connectorConfig,
}: {
  connectorConfig: ConnectorConfigForCustomer
  onReady?: (ctx: {state: string}, name: string) => void
}) {
  console.log(
    '[AddConnectionCard] Rendering for',
    connectorConfig.connector_name,
  )

  return (
    <ConnectorConnectContainer
      connectorName={connectorConfig.connector_name as ConnectorName}
      connector={connectorConfig.connector!}
      connectorConfigId={connectorConfig.id as Id['ccfg']}>
      {({isConnecting, handleConnect}) => {
        console.log(
          '[AddConnectionCard] ConnectorConnectContainer child rendered with isConnecting:',
          isConnecting,
        )
        return (
          <ConnectorConfigCard
            displayNameLocation="right"
            // TODO: fix this
            connectorConfig={connectorConfig as ConnectorConfig<'connector'>}
            onPress={() => {
              console.log(
                '[AddConnectionCard] Card pressed, isConnecting:',
                isConnecting,
              )
              if (isConnecting) {
                console.log(
                  '[AddConnectionCard] Already connecting, ignoring press',
                )
                return
              }
              console.log('[AddConnectionCard] Calling handleConnect')
              handleConnect()
            }}>
            <Label className="text-muted-foreground pointer-events-none ml-auto text-sm">
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Label>
          </ConnectorConfigCard>
        )
      }}
    </ConnectorConnectContainer>
  )
}
