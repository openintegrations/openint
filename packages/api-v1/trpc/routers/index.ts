import {trpc} from '../_base'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
import {eventRouter} from './event'
import {generalRouter} from './general'

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  eventRouter,
  customerRouter,
  generalRouter,
)

export type AppRouter = typeof appRouter
