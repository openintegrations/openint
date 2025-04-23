import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {routerContextFromViewer} from '../trpc/context'
import {appRouter} from '../trpc/routers'

async function main() {
  const db = initDbNeon(envRequired.DATABASE_URL)

  const context = routerContextFromViewer({db, viewer: {role: 'system'}})
  const caller = appRouter.createCaller(context)

  const resource = process.argv[2]
  if (!['connector-config', 'connection', 'event'].includes(resource!)) {
    console.error(
      'First argument must be one of: connector-config, connection, event',
    )
    process.exit(1)
  }

  const action = process.argv[3]
  if (action === 'list') {
    if (resource === 'connector-config') {
      const res = await caller.listConnectorConfigs({
        limit: 500,
      })
      console.log(res)
    } else if (resource === 'connection') {
      const res = await caller.listConnections({
        limit: 500,
      })
      console.log(res)
    } else if (resource === 'event') {
      const res = await caller.listEvents({
        limit: 500,
      })
      console.log(res)
    }
  } else if (action === 'get') {
    if (resource === 'connector-config') {
      const res = await caller.getConnectorConfig({
        id: process.argv[4] as string,
      })
      console.log(res)
    } else if (resource === 'connection') {
      const res = await caller.getConnection({
        id: process.argv[4] as string,
      })
      console.log(res)
    } else if (resource === 'event') {
      const res = await caller.getEvent({
        id: process.argv[4] as string,
      })
      console.log(res)
    }
  }
}

main()
