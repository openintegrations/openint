import type {inferRouterInputs, inferRouterOutputs} from '@trpc/server'

import {trpc} from '../trpc/_base'
import {connectRouter} from './connect'
import {connectionRouter} from './connection'
import {connectorRouter} from './connector'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
import {eventRouter} from './event'
import {generalRouter} from './general'
import {organizationRouter} from './organization'
import {webhookRouter} from './webhook'

export const appRouter = trpc.mergeRouters(
  connectorRouter,
  connectorConfigRouter,
  connectionRouter,
  connectRouter,
  eventRouter,
  customerRouter,
  generalRouter,
  organizationRouter,
  webhookRouter,
)

export type AppRouter = typeof appRouter

export type AppRouterInput = inferRouterInputs<AppRouter>
export type AppRouterOutput = inferRouterOutputs<AppRouter>
