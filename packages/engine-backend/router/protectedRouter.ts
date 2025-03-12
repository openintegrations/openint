import {extractId, zStandard} from '@openint/cdk'
import {schema, sql} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {env} from '@openint/env'
import {zEvent} from '@openint/events'
import {TRPCError} from '@openint/trpc'
import {R, z} from '@openint/util'
import {getOrCreateApikey} from '@/lib-server'
import {inngest} from '../inngest'
import {protectedProcedure, trpc} from './_base'

export {type inferProcedureInput} from '@openint/trpc'

export const protectedRouter = trpc.router({
  dispatch: protectedProcedure.input(zEvent).mutation(async ({input}) => {
    if (
      input.name !== 'sync.connection-requested' &&
      input.name !== 'sync.pipeline-requested'
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Event name not supported ${input.name}`,
      })
    }
    // not sure what `viewer` is quite for here...
    await inngest.send(input)
  }),

  searchIntegrations: protectedProcedure
    .input(z.object({keywords: z.string().trim().nullish()}).optional())
    .query(async ({input: {keywords} = {}, ctx}) => {
      const ints = await ctx.services.listConnectorConfigs()
      const integrations = await ctx.services.metaService.searchIntegrations({
        keywords,
        limit: 10,
        connectorNames: R.uniq(ints.map((int) => int.connector.name)),
      })
      const intsByConnectorName = R.groupBy(ints, (int) => int.connector.name)
      return integrations.flatMap((ins) => {
        const [, connectorName, externalId] = extractId(ins.id)
        const standard = ctx.connectorMap[
          connectorName
        ]?.standardMappers?.integration?.(ins.external)
        const res = zStandard.integration.omit({id: true}).safeParse(standard)

        if (!res.success) {
          console.error('Invalid integration found', ins, res.error)
          return []
        }
        return (intsByConnectorName[connectorName] ?? []).map((int) => ({
          ins: {...res.data, id: ins.id, externalId},
          int: {id: int.id},
        }))
      })
    }),
  // TODO: Do we need this method at all? Or should we simply add params to args
  // to syncConnection instead? For example, skipPipelines?

  createOrganization: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        referrer: z.string().nullish(),
        clerkUserId: z.string(),
      }),
    )
    .output(z.object({id: z.string().nullish()}))
    .mutation(async ({input, ctx}) => {
      const db = initDbNeon(env.DATABASE_URL)

      const apikey = await getOrCreateApikey(ctx.viewer)
      const metadata = {
        referrer: input.referrer,
        clerk_user_id: input.clerkUserId,
      }
      const res = await db.execute<{id: string}>(sql`
      INSERT INTO ${schema.organization} (id, name, apikey, metadata)
      VALUES (${sql.param(input.id)}, ${sql.param(input.name)}, ${sql.param(
        apikey,
      )}, ${sql.param(metadata)})
      returning id
    `)
      return {id: res[0]?.id}
    }),
})
