import type {inferRouterInputs, inferRouterOutputs} from '@openint/trpc'
import {trpc} from './_base'
import {adminRouter} from './adminRouter'
import {connectorConfigRouter} from './connectorConfigRouter'
import {connectorRouter} from './connectorRouter'
import {customerRouter} from './customerRouter'
import {pipelineRouter} from './pipelineRouter'
import {protectedRouter} from './protectedRouter'
import {publicRouter} from './publicRouter'
import {connectionRouter} from './connectionRouter'
import {syncRouter} from './syncRouter'
import {systemRouter} from './systemRouter'

// accountingRouter._def.procedures.listAccounts._def.meta?.openapi?.path += '/accounting/'

export const routers = {
  public: publicRouter,
  protected: protectedRouter,
  customer: customerRouter,
  admin: adminRouter,
  connectorConfig: connectorConfigRouter,
  system: systemRouter,
  connection: connectionRouter,
  pipeline: pipelineRouter,
  connector: connectorRouter,
  sync: syncRouter,
}

// Which one is best?
export const nestedRouter = trpc.router(routers)

export const flatRouter = trpc.mergeRouters(
  publicRouter,
  protectedRouter,
  customerRouter,
  adminRouter,
  systemRouter,
  connectionRouter,
  connectorConfigRouter,
  connectorRouter,
  pipelineRouter,
  syncRouter,
)

export type FlatRouter = typeof flatRouter
export type RouterInput = inferRouterInputs<typeof flatRouter>
export type RouterOutput = inferRouterOutputs<typeof flatRouter>

export type {AnyRouter} from '@openint/trpc'
