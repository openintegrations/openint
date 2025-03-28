import type {EntityPayload, StdSyncOperation} from '@openint/sync'
import type {rxjs} from '@openint/util'
import {objectEntries, R} from '@openint/util'
import {handlersLink} from './base-links'
import type {Pta} from './verticals-deprecated'

// TODO: Move into entityLink
export interface StdCache {
  account: Record<string, Pta.Account>
  transaction: Record<string, Pta.Transaction>
  commodity: Record<string, Pta.Commodity>
  [k: string]: Record<string, unknown>
}

export function _opsFromCache(cache: StdCache) {
  return R.pipe(
    cache,
    (c) => objectEntries(c),
    R.flatMap(([entityName, entityById]) =>
      objectEntries(entityById).map(
        // @ts-expect-error Not fully sure how to type this
        ([id, entity]): EntityPayload => ({id, entity, entityName}),
      ),
    ),
    R.map((input): StdSyncOperation => ({type: 'data', data: input})),
  )
}

/** Performs cumulative transform */
export function cachingLink(
  onCommit: (c: StdCache) => rxjs.Observable<StdSyncOperation>,
) {
  const cache: StdCache = {account: {}, transaction: {}, commodity: {}}
  let numChanges = 0
  return handlersLink({
    data: (op) => {
      const entityCache = cache[op.data.entityName] ?? {}
      if (!cache[op.data.entityName]) {
        cache[op.data.entityName] = entityCache
      }
      if (op.data.entity) {
        entityCache[op.data.id] = op.data.entity
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete entityCache[op.data.id]
      }
      numChanges++
    },
    commit: () => {
      if (numChanges === 0) {
        return
      }
      console.log('[makeCachingLink] commit', {numChanges})
      numChanges = 0
      return onCommit(cache)
    },
  })
}
