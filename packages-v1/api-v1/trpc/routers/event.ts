import {z} from 'zod'
import {schema} from '@openint/db'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'

export const eventRouter = router({
  createEvent: publicProcedure
    .meta({
      openapi: {method: 'POST', path: '/event'},
    })
    .input(core.event_insert) // Ref does not work for input params for now in zod-openapi. So will be inlined in the spec unfortunately
    .output(core.event)
    .query(async ({ctx, input}) => {
      const event = await ctx.db.insert(schema.event).values(input).returning()
      return event
    }),
  listEvents: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/event'},
    })
    .input(z.void())
    .output(
      z.object({
        items: z.array(core.event),
      }),
    )
    .query(async ({ctx}) => {
      const events = await ctx.db.query.event.findMany({})
      return {items: events}
    }),
})
