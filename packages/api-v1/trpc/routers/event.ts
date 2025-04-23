import {TRPCError} from '@trpc/server'
import {eq, schema, sql} from '@openint/db'
import {zEvent} from '@openint/events/events'
import {eventMap} from '@openint/events/events.def'
import {z} from '@openint/util/zod-utils'
import {authenticatedProcedure, router} from '../_base'
import {core} from '../../models/core'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'

export const eventRouter = router({
  // NOTE: why publish this API?
  createEvent: authenticatedProcedure
    .meta({
      openapi: {method: 'POST', path: '/event'},
    })
    .input(
      z.object({
        event: zEvent,
      }),
    ) // Ref does not work for input params for now in zod-openapi. So will be inlined in the spec unfortunately
    .output(core.event_select)
    .mutation(async ({ctx, input}) => ctx.dispatch(input.event)),

  getEvent: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/event/{id}',
        description: 'Get a single event by ID',
        summary: 'Get Event',
      },
    })
    .input(z.object({id: z.string()}))
    .output(core.event_select)
    .query(async ({ctx, input}) => {
      const event = await ctx.db.query.event.findFirst({
        where: eq(schema.event.id, input.id),
        // Include deprecated events, which would result in a parse error unfortunately
      })
      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Event with ID "${input.id}" not found`,
        })
      }
      return event
    }),

  listEvents: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/event',
        description: 'List all events for an organization',
        summary: 'List Organization Events',
      },
    })
    .input(zListParams.optional())
    .output(zListResponse(core.event_select))
    .query(async ({ctx, input}) => {
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            event: schema.event,
            total: sql`count(*) OVER ()`,
          })
          .from(schema.event)
          .where(
            // filter out deprecated events, preventing parse errors
            eq(
              schema.event.name,
              sql`ANY (${sql.param(Object.keys(eventMap))})`,
            ),
          ),
        schema.event.timestamp,
        input,
      )

      const {items, total} = await processPaginatedResponse(query, 'event')

      // const parseErrors: string[] = []
      // items.forEach((item) => {
      //   try {
      //     core.event_select.parse(item)
      //   } catch (err) {
      //     parseErrors.push(item.id)
      //     console.error('Failed to parse event:', item.id, item.name)
      //   }
      // })
      // if (parseErrors.length > 0) {
      //   throw new TRPCError({
      //     code: 'INTERNAL_SERVER_ERROR',
      //     message: `Failed to parse ${parseErrors.length} events`,
      //   })
      // }

      return {
        items,
        total,
        limit,
        offset,
      }
    }),
})
