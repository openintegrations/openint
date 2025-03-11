import {trpc} from '../trpc/_base'
import {connectionRouter} from './connection'
import {connectorRouter} from './connector'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
import {eventRouter} from './event'
import {generalRouter} from './general'

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  connectorRouter,
  eventRouter,
  customerRouter,
  generalRouter,
)

export type AppRouter = typeof appRouter
