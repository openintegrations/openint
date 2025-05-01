import {TRPCError} from '@trpc/server'
import {and, any, asc, desc, eq, like, schema, sql} from '@openint/db'
import {zEvent} from '@openint/events/events'
import {eventMap} from '@openint/events/events.def'
import {z} from '@openint/util/zod-utils'
import {authenticatedProcedure, router} from '../_base'
import {core} from '../../models/core'
import {
  formatListResponse,
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
    .input(
      zListParams
        .extend({
          search_query: z.string().optional().openapi({
            description: 'Search query for the event list',
          }),
        })
        .default({}),
    )
    .output(zListResponse(core.event_select))
    .query(async ({ctx, input: {limit, offset, search_query}}) => {
      // Lowercased query for case insensitive search
      const lowerQuery = search_query?.toLowerCase()
      const res = await ctx.db.query.event.findMany({
        extras: {
          total: sql<number>`count(*) OVER ()`.as('total'),
        },
        // filter out deprecated events, preventing parse errors
        where: and(
          eq(schema.event.name, any(Object.keys(eventMap))),
          lowerQuery ? like(schema.event.id, `%${lowerQuery}%`) : undefined,
        ),
        orderBy: [desc(schema.event.timestamp), asc(schema.event.id)],
        offset,
        limit,
      })

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
      return formatListResponse(res, {limit, offset})
    }),
})
