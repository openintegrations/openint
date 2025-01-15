import type {ConnectorConfigFilters} from '../hocs/WithConnectConfig'
import {ConnectIntegrations} from './ConnectIntegrations'

interface AddConnectionTabContentProps {
  connectorConfigFilters: ConnectorConfigFilters
  refetch: () => void
  onSuccessCallback?: () => void
  enabledIntegrationIds?: string[]
}

export function AddConnectionTabContent({
  connectorConfigFilters,
  enabledIntegrationIds = [],
  refetch,
  onSuccessCallback,
}: AddConnectionTabContentProps) {
  return (
    <div className="flex flex-col p-4 pt-0">
      <div>
        {/* <p className="text-sm">
          Choose a connector to integrate with your current setup.
        </p> */}
      </div>
      <ConnectIntegrations
        connectorConfigFilters={connectorConfigFilters}
        enabledIntegrationIds={enabledIntegrationIds}
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
