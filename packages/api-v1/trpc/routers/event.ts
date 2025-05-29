import {TRPCError} from '@trpc/server'
import {extractId} from '@openint/cdk'
import {and, any, asc, desc, eq, ilike, schema, sql} from '@openint/db'
import { envRequired} from '@openint/env'
import {Event, zEvent} from '@openint/events/events'
import {eventMap} from '@openint/events/events.def'
import {z} from '@openint/util/zod-utils'
import {authenticatedProcedure, router} from '../_base'
import {core} from '../../models/core'
import {getConnectorModelByName} from './connector.models'
import {
  formatListResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'

export const eventRouter = router({
  // NOTE: why publish this API?
  createEvent: authenticatedProcedure
    .meta({
      openapi: {method: 'POST', path: '/event', enabled: false},
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
        enabled: false,
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
          expand: z.array(z.enum(['prompt'])).optional(),
        })
        .default({}),
    )
    .output(zListResponse(core.event_select))
    .query(async ({ctx, input: {limit, offset, search_query, expand}}) => {
      // Lowercased query for case insensitive search
      const lowerQuery = search_query?.toLowerCase()
      const res = await ctx.db.query.event.findMany({
        extras: {
          total: sql<number>`count(*) OVER ()`.as('total'),
        },
        // filter out deprecated events, preventing parse errors
        where: and(
          eq(schema.event.name, any(Object.keys(eventMap))),
          lowerQuery ? ilike(schema.event.id, `%${lowerQuery}%`) : undefined,
        ),
        orderBy: [desc(schema.event.timestamp), asc(schema.event.id)],
        offset,
        limit,
      })

      const events = expand?.includes('prompt')
        ? await Promise.all(
            res.map(async (_event) => {
              const event = _event as Event

              if (event.name === 'connect.connection-connected') {
                const connectionId = event.data.connection_id
                const connectorName = extractId(connectionId)[1]
                const meta = getConnectorModelByName(connectorName)
                if (!meta) {
                  console.error(
                    `Connector with name "${connectorName}" not found`,
                  )
                  return event
                }
                const apiUrl = new URL(
                  '/v1/message_template',
                  envRequired.AI_ROUTER_URL,
                )
                apiUrl.searchParams.append('language', 'javascript')
                apiUrl.searchParams.append('use_environment_variables', 'true')
                apiUrl.searchParams.append('connector_name', connectorName)
                apiUrl.searchParams.append(
                  'connector_auth_type',
                  meta.auth_type ?? '',
                )
                // TODO: add connector documentation url
                // apiUrl.searchParams.append(
                //   'connector_documentation_url',
                //   meta.documentation_url ?? '',
                // )

                const response = await fetch(apiUrl.toString(), {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                const data: unknown = await response.json()
                const zMessageTemplateResponse = z.object({
                  template: z.string(),
                })
                const prompt =
                  zMessageTemplateResponse.safeParse(data).data?.template
                return {
                  ...event,
                  prompt,
                }
              }
              return event
            }),
          )
        : res

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
      // }\
      // @ts-expect-error TODO: fix this
      return formatListResponse(events, {limit, offset})
    }),
})
