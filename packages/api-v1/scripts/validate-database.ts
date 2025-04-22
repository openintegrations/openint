import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {routerContextFromViewer} from '../trpc/context'
import {appRouter} from '../trpc/routers'

async function main() {
  const db = initDbNeon(envRequired.DATABASE_URL)

  const context = routerContextFromViewer({db, viewer: {role: 'system'}})
  const caller = appRouter.createCaller(context)

  // const res = await caller.listConnectorConfigs()
  const res = await caller.getConnectorConfig({
    id: 'ccfg_slack_01JPTJADVQ3H8VF82QYR2P9EQV',
  })
  console.log(res)
}

main()
