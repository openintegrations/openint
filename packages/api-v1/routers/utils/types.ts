// temp ids
import {z} from '@openint/util/zod-utils'
import {serverConnectors} from '@openint/all-connectors/connectors.server'

export const zConnectionId = z
  .string()
  .startsWith('conn_')
  .describe('The id of the connection, starts with `conn_`')
export const zConnectorConfigId = z
  .string()
  .startsWith('ccfg_')
  .describe('The id of the connector config, starts with `ccfg_`')

export const zCustomerId = z
  .string()
  .describe(
    'The id of the customer in your application. Ensure it is unique for that customer.',
  )

export const zConnectorName = z
  .enum(
    Object.keys(serverConnectors).filter((key) => key !== 'postgres') as [
      string,
      ...string[],
    ],
  )
  .describe('The name of the connector')
