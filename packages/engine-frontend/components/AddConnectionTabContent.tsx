import type {ConnectorConfigFilters} from '../hocs/WithConnectConfig'
import {ConnectIntegrations} from './ConnectIntegrations'

interface AddConnectionTabContentProps {
  connectorConfigFilters: ConnectorConfigFilters
  refetch: () => void
}

export function AddConnectionTabContent({
  connectorConfigFilters,
  refetch,
}: AddConnectionTabContentProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div>
        <p className="text-base font-semibold">Setup a new Connection</p>
        <p className="text-base">Choose a connector config to start</p>
      </div>
      <ConnectIntegrations
        connectorConfigFilters={connectorConfigFilters}
        onEvent={(event) => {
          if (event.type === 'close') {
            refetch()
          }
        }}
      />
    </div>
  )
}
