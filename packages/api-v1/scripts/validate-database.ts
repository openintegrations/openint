import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {routerContextFromViewer} from '../trpc/context'
import {appRouter} from '../trpc/routers'

async function main() {
  const db = initDbNeon(envRequired.DATABASE_URL)

  const context = routerContextFromViewer({db, viewer: {role: 'system'}})
  const caller = appRouter.createCaller(context)

  if (process.argv[2] === 'list') {
    const res = await caller.listConnectorConfigs({
      limit: 500,
    })
    console.log(res)
  } else if (process.argv[2] === 'get') {
    const res = await caller.getConnectorConfig({
      id: process.argv[3] as string,
    })
    console.log(res)
  }
}

main()
