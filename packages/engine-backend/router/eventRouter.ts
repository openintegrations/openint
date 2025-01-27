import {z} from '@opensdks/util-zod'
import type {ZRaw} from '@openint/cdk'
import {zCustomerId, zRaw} from '@openint/cdk'
import {protectedProcedure, trpc} from '@openint/trpc'
import {zPaginatedResult, zPaginationParams} from '@openint/vdk'

export const eventRouter = trpc.router({
  listEvents: protectedProcedure
    .meta({
      openapi: {method: 'GET', path: '/core/events', tags: ['Connect']},
    })
    .input(
      zPaginationParams.extend({
        // Should not be a required param
        since: z.number().int(),
        customer_id: zCustomerId.nullish(),
        name: z.string().nullish(),
      }),
    )
    .output(zPaginatedResult.extend({items: z.array(zRaw.event)}))
    .query(
      async ({
        input: {since, customer_id: customerId, page_size, name},
        ctx,
      }) => {
        const events = (await ctx.services.metaService.tables.event.list({
          since,
          customer_id: customerId,
          // TODO: add cursor
          limit: page_size,
          order_by: 'timestamp',
          order: 'desc',
          where: {...(name ? {name} : {})},
        })) as Array<ZRaw['event']>
        return {
          // TODO: fix pagination
          has_next_page: false,
          items: events,
        }
      },
    ),
})
