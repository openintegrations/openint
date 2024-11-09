import type {ConnectorConfigFilters} from '../hocs/WithConnectConfig'
import {ConnectIntegrations} from './ConnectIntegrations'

interface AddConnectionTabContentProps {
  connectorConfigFilters: ConnectorConfigFilters
  refetch: () => void
  onSuccessCallback?: () => void
}

export function AddConnectionTabContent({
  connectorConfigFilters,
  refetch,
  onSuccessCallback,
}: AddConnectionTabContentProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div>
        <p className="text-sm">
          Choose a connector to integrate with your current setup.
        </p>
      </div>
      <ConnectIntegrations
        connectorConfigFilters={connectorConfigFilters}
        onEvent={(event) => {
          if (event.type === 'close') {
            refetch()
          } else if (event.type === 'success') {
            onSuccessCallback?.()
            refetch()
          }
        }}
      />
    </div>
  )
}
