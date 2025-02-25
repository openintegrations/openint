import type {inferRouterInputs, inferRouterOutputs} from '@openint/trpc'
import {trpc} from './_base'
import {adminRouter} from './adminRouter'
import {connectionRouter} from './connectionRouter'
import {connectorConfigRouter} from './connectorConfigRouter'
import {connectorRouter} from './connectorRouter'
import {customerRouter} from './customerRouter'
import {eventRouter} from './eventRouter'
import {pipelineRouter} from './pipelineRouter'
import {protectedRouter} from './protectedRouter'
import {publicRouter} from './publicRouter'
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
  event: eventRouter,
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
  eventRouter,
)

export type FlatRouter = typeof flatRouter
export type RouterInput = inferRouterInputs<typeof flatRouter>
export type RouterOutput = inferRouterOutputs<typeof flatRouter>

export type {AnyRouter} from '@openint/trpc'
