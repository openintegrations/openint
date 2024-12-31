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
        since: z.number().int(),
        customerId: zCustomerId.nullish(),
      }),
    )
    .output(zPaginatedResult.extend({items: z.array(zRaw.event)}))
    .query(async ({input: {since, customerId, page_size}, ctx}) => {
      const events = (await ctx.services.metaService.tables.event.list({
        since,
        customerId,
        // TODO: add cursor
        limit: page_size,
        orderBy: 'timestamp',
        order: 'desc',
      })) as Array<ZRaw['event']>
      return {
        // TODO: fix pagination
        has_next_page: false,
        items: events,
      }
    }),
})
