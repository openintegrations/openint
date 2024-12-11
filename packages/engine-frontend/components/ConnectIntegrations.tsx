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
  connectorNames?: string[]
  enabledIntegrationIds?: string[]
  onEvent: (event: any) => void
}) {
  return (
    <WithConnectConfig {...connectorConfigFilters}>
      {({ccfgs}) => {

        return (
          <IntegrationSearch
            connectorConfigs={ccfgs}
            enabledIntegrationIds={enabledIntegrationIds}
            onEvent={(e) => {
              if (onEvent) onEvent(e)
            }}
          />
        )
      }}
    </WithConnectConfig>
  )
}
