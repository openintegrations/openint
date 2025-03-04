import {count, schema} from '@openint/db'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from '../utils/pagination'

export const eventRouter = router({
  // NOTE: why publish this API?
  // createEvent: publicProcedure
  //   .meta({
  //     openapi: {method: 'POST', path: '/event'},
  //   })
  //   .input(core.event_insert) // Ref does not work for input params for now in zod-openapi. So will be inlined in the spec unfortunately
  //   .output(core.event)
  //   .mutation(async ({ctx, input}) => {
  //     const [event] = await ctx.db
  //       .insert(schema.event)
  //       .values(input)
  //       .returning()
  //     return event!
  //   }),
  listEvents: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/event'},
    })
    .input(zListParams.optional())
    .output(zListResponse(core.event))
    .query(async ({ctx, input}) => {
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            event: schema.event,
            total: count(),
          })
          .from(schema.event),
        schema.event.timestamp,
        input,
      )

      const {items, total} = await processPaginatedResponse(query, 'event')

      return {
        items,
        total,
        limit,
        offset,
      }
    }),
})
