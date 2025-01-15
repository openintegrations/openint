import {
  WithConnectConfig,
  type ConnectorConfigFilters,
} from '../hocs/WithConnectConfig'
import {IntegrationSearch} from './IntegrationSearch'

export function ConnectIntegrations({
  connectorConfigFilters,
  enabledIntegrationIds = [],
  onEvent,
}: {
  connectorConfigFilters: ConnectorConfigFilters
  enabledIntegrationIds?: string[]
  onEvent: (event: any) => void
}) {
  return (
    <WithConnectConfig {...connectorConfigFilters}>
      {({ccfgs}) => (
        <IntegrationSearch
          connectorConfigs={ccfgs}
          enabledIntegrationIds={enabledIntegrationIds}
          onEvent={(e) => {
            if (onEvent) onEvent(e)
          }}
        />
      )}
    </WithConnectConfig>
  )
}
