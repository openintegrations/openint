import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zInstitution, zTellerConfig} from './TellerClient'

export const tellerSchemas = {
  name: z.literal('teller'),
  connector_config: zTellerConfig,
  connection_settings: z.object({
    token: z.string(),
  }),
  integration_data: zInstitution,
  connect_input: z.object({
    applicationId: z.string(),
    userToken: z.string().nullish(),
  }),
  connect_output: z.object({
    token: z.string(),
  }),
} satisfies ConnectorSchemas

export const helpers = connHelpers(tellerSchemas)

export const tellerDef = {
  name: 'teller',
  schemas: tellerSchemas,
  metadata: {
    verticals: ['banking'],
    logoUrl: '/_assets/logo-teller.svg',
    stage: 'beta',
  },

  standardMappers: {
    connection: (settings) => ({
      displayName: 'TODO' + settings.token,
      institutionId: 'ins_teller_TODO',
    }),
    integration: (data) => ({
      name: data.name,
      logoUrl: data.logoUrl,
      envName: undefined,
      loginUrl: undefined,
    }),
  },
} satisfies ConnectorDef<typeof tellerSchemas>

export default tellerDef
