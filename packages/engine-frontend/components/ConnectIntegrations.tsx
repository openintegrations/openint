import {
  WithConnectConfig,
  type ConnectorConfigFilters,
} from '../hocs/WithConnectConfig'
import {IntegrationSearch} from './IntegrationSearch'

export function ConnectIntegrations({
  connectorConfigFilters,
  onEvent,
}: {
  connectorConfigFilters: ConnectorConfigFilters
  onEvent: (event: any) => void
}) {
  return (
    <WithConnectConfig {...connectorConfigFilters}>
      {({ccfgs}) => (
        <IntegrationSearch
          connectorConfigs={ccfgs}
          onEvent={(e) => {
            if (onEvent) onEvent(e)
          }}
        />
      )}
    </WithConnectConfig>
  )
}
