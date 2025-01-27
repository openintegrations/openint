import {handlersLink, makeId, sync, zId, zRaw} from '@openint/cdk'
import {makeUlid, rxjs, z} from '@openint/util'
import {adminProcedure, trpc} from './_base'

export {type inferProcedureInput} from '@openint/trpc'

export const adminRouter = trpc.router({
  adminUpsertPipeline: adminProcedure
    .input(
      zRaw.pipeline
        .pick({
          id: true,
          source_id: true,
          destination_id: true,
          source_state: true,
          destination_state: true,
        })
        .partial()
        // Due to insert on conflict update we need provide all values
        .required({source_id: true, destination_id: true}),
    )
    .mutation(({input: {id: _id, ...input}, ctx}) => {
      const id = _id ? _id : makeId('pipe', makeUlid())
      return ctx.services.patchReturning('pipeline', id, input)
    }),
  adminSearchCustomers: adminProcedure
    .input(z.object({keywords: z.string().trim().nullish()}).optional())
    .query(async ({input: {keywords} = {}, ctx}) =>
      ctx.services.metaService
        .searchCustomers({keywords})
        // Customers must have non empty IDs
        // This fitlers out data that belongs to the org rather than specific customers
        .then((rows) => rows.filter((u) => !!u.id)),
    ),
  adminSyncMetadata: adminProcedure
    .input(zId('ccfg').nullish())
    .mutation(async ({input: ccfgId, ctx}) => {
      const ints = ccfgId
        ? await ctx.services
            .getConnectorConfigOrFail(ccfgId)
            .then((int) => [int])
        : await ctx.services.listConnectorConfigs()
      const stats = await sync({
        source: rxjs.merge(
          ...ints.map(
            (int) =>
              int.connector.metaSync?.({config: int.config}).pipe(
                handlersLink({
                  data: (op) =>
                    rxjs.of({
                      ...op,
                      data: {
                        ...op.data,
                        entity: {
                          external: op.data.entity as unknown,
                          standard:
                            int.connector.standardMappers?.integration?.(
                              op.data.entity,
                            ),
                        },
                      },
                    }),
                }),
              ) ?? rxjs.EMPTY,
          ),
        ),
        // This single destination is a bottleneck to us removing
        // prefixed ids from protocol itself
        destination: ctx.services.metaLinks.persistIntegration(),
      })
      return `Synced ${stats} integrations from ${ints.length} providers`
    }),

  // Manually run to repair mapping issues
  remapEntities: adminProcedure
    // .input(z.object({}).nullish())
    .mutation(async ({ctx}) => {
      if (ctx.viewer.role !== 'system') {
        return
      }
      // TODO: support pagination
      const inss = await ctx.services.metaService.tables.integration.list({})
      for (const ins of inss) {
        console.log('Remap integration', ins.id)
        const provider = ctx.connectorMap[ins.connector_name]
        const standard = provider?.standardMappers?.integration?.(ins.external)
        await ctx.services.patch('integration', ins.id, {standard})
      }
    }),
})
