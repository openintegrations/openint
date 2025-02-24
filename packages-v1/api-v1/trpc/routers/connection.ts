import {z} from 'zod'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'

export const connectionRouter = router({
  listConnections: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection'},
    })
    .input(z.void())
    .output(
      z.object({
        items: z.array(core.connection),
      }),
    )
    .query(() => ({items: []})),
})
