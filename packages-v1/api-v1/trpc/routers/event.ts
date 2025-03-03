import {count, desc, schema} from '@openint/db'
import {zListParams, zListResponse} from '.'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'

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
    .input(zListParams)
    .output(zListResponse(core.event))
    .query(async ({ctx, input}) => {
      const limit = input.limit ?? 50
      const offset = input.offset ?? 0

      // Use a single query with COUNT(*) OVER() to get both results and total count
      const result = await ctx.db
        .select({
          event: schema.event,
          total: count(),
        })
        .from(schema.event)
        .orderBy(desc(schema.event.timestamp))
        .limit(limit)
        .offset(offset)

      const events = result.map((r) => r.event)
      const total = result.length > 0 ? Number(result[0]?.total ?? 0) : 0

      return {
        items: events,
        total,
        limit,
        offset,
      }
    }),
})
