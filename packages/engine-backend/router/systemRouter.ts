import {zId, zWebhookInput} from '@openint/cdk'
import {z} from '@openint/util'
import {adminProcedure, systemProcedure, trpc} from './_base'

export const systemRouter = trpc.router({
  ensureDefaultPipelines: adminProcedure.mutation(async ({ctx}) => {
    const connections =
      await ctx.services.metaService.findConnectionsMissingDefaultPipeline()
    return await Promise.all(
      connections.map((reso) =>
        ctx.services
          .ensurePipelinesForConnection(reso.id)
          .then((pipelineIds) => ({connectionId: reso.id, pipelineIds}))
          .catch((err) => {
            console.error(
              'Failed to ensuring default pipelines for resource',
              reso.id,
              err,
            )
            return false
          }),
      ),
    )
  }),
  handleWebhook: systemProcedure
    .input(z.tuple([zId('ccfg'), zWebhookInput]))
    .mutation(async ({input: [ccfgId, input], ctx}) => {
      const int = await ctx.services.getConnectorConfigOrFail(ccfgId)

      if (!int.connector.schemas.webhookInput || !int.connector.handleWebhook) {
        console.warn(`${int.connector.name} does not handle webhooks`)
        return
      }
      const res = await int.connector.handleWebhook(
        int.connector.schemas.webhookInput.parse(input),
        int.config,
      )
      await Promise.all(
        res.connectionUpdates.map((connUpdate) =>
          // Provider is responsible for providing envName / userId
          // This may be relevant for OneBrick connections for example
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          ctx.services._syncConnectionUpdate(int, connUpdate),
        ),
      )

      return res.response?.body
    }),
})
