import {inArray} from 'drizzle-orm'
import {configDb, schemaWip as schema} from '@openint/db'
import {z} from '@openint/util'
import {protectedProcedure, trpc} from './_base'
import {zListParams} from './_schemas'

export {type inferProcedureInput} from '@openint/trpc'

const tags = ['Core']

export const syncRouter = trpc.router({
  listSyncRuns: protectedProcedure
    .meta({openapi: {method: 'GET', path: '/core/sync_run', tags}})
    .input(zListParams.optional())
    .output(z.array(z.unknown()))
    .query(async ({ctx}) => {
      const connections = await ctx.services.metaService.tables.connection.list({})
      if (connections.length === 0) {
        return []
      }
      const runs = await configDb.query.sync_run.findMany({
        // @ts-expect-error
        where: inArray(
          // @ts-expect-error
          schema.sync_run.connection_id,
          connections.map((r) => r.id),
        ),
      })
      return runs
    }),
})
