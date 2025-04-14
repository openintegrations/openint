// TODO: Get the codegen rule to work...
/// codegen:start {preset: barrel, include: "./{*.{ts,tsx},*/index.{ts,tsx}},../routers/*.models.{ts,tsx}}", exclude: "./**/*.{d,spec,test,fixture,gen,node}.{ts,tsx}"}
export * from './core'
// Is it the right idea to combine them?
export * from '../trpc/routers/connectorConfig.models'
export * from '../trpc/routers/connection.models'
export * from '../trpc/routers/connector.models'
export * from '../trpc/routers/connect.models'
