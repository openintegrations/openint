import type {AdapterMap} from '@openint/vdk'
import {hubspotAdapter} from './hubspot-adapter'
import {hubspotSingularMappers} from './hubspot-adapter/mappers'
import {msDynamics365SalesAdapter} from './ms-dynamics-365-sales-adapter'
import {pipedriveAdapter} from './pipedrive-adapter'
import {
  salesforceAdapter,
  mappers as salesforceMappers,
} from './salesforce-adapter'

// QQ: why does this export as {hubspot {}}?
export const mappers = {
  hubspot: hubspotSingularMappers,
  salesforce: salesforceMappers,
}

export default {
  hubspot: hubspotAdapter,
  salesforce: salesforceAdapter,
  pipedrive: pipedriveAdapter,
  ms_dynamics_365_sales: msDynamics365SalesAdapter,
} satisfies AdapterMap
