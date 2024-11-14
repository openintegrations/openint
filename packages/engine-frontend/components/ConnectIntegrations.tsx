import {
  WithConnectConfig,
  type ConnectorConfigFilters,
} from '../hocs/WithConnectConfig'
import {IntegrationSearch} from './IntegrationSearch'

export function ConnectIntegrations({
  connectorConfigFilters,
  connectorNames = [],
  onEvent,
}: {
  connectorConfigFilters: ConnectorConfigFilters
  connectorNames?: string[]
  onEvent: (event: any) => void
}) {
  return (
    <WithConnectConfig {...connectorConfigFilters}>
      {({ccfgs}) => {
        const filteredCcfgs = ccfgs.filter((c) => {
          // TODO: move this to in the case of ccfg containing
          // integrations we check the list of configured integrations
          // and not show them again.

          const integrations = c.integrations

          if (integrations && integrations.length > 0) {
            return true
          }

          return !connectorNames.includes(c.connectorName)
        })

        return (
          <IntegrationSearch
            connectorConfigs={filteredCcfgs}
            onEvent={(e) => {
              if (onEvent) onEvent(e)
            }}
          />
        )
      }}
    </WithConnectConfig>
  )
}
