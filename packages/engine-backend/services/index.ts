import {logLink} from '@opensdks/runtime'
import type {AnyConnectorImpl} from '@openint/cdk'
import {nangoProxyLink} from '@openint/cdk'
import {R} from '@openint/util'
import type {AuthProvider} from './AuthProvider'
import type {_ConnectionExpanded} from './dbService'
import {makeDBService} from './dbService'
import type {MetaService} from './metaService'
import {makeSyncService} from './sync-service'

export function makeServices({
  metaService,
  connectorMap,
  env,
  authProvider,
}: {
  metaService: MetaService
  connectorMap: Record<string, AnyConnectorImpl>
  env: {NANGO_SECRET_KEY?: string}
  authProvider: AuthProvider
  // TODO: Fix any type
}) {
  const dbService = makeDBService({
    metaService,
    connectorMap,
  })
  /** @deprecated. Should use remoteProcedure */
  function getFetchLinks(conn: _ConnectionExpanded) {
    return R.compact([
      logLink(),
      conn.connectorConfig.connector.metadata?.nangoProvider &&
        env.NANGO_SECRET_KEY &&
        nangoProxyLink({
          secretKey: env.NANGO_SECRET_KEY,
          connectionId: conn.id,
          providerConfigKey: conn.connectorConfigId,
        }),
    ])
  }
  const syncService = makeSyncService({
    metaService,
    metaLinks: dbService.metaLinks,
    getPipelineExpandedOrFail: dbService.getPipelineExpandedOrFail,
    getConnectionExpandedOrFail: dbService.getConnectionExpandedOrFail,
    getFetchLinks,
    authProvider,
  })

  return {...dbService, ...syncService, getFetchLinks}
}
