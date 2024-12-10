import '@openint/app-config/register.node'
import {contextFactory} from '@openint/app-config/backendConfig'
import type {CustomerId} from '@openint/cdk'
import {flatRouter} from '@openint/engine-backend'
import {inngest} from '@openint/engine-backend/events'
import {getPool, sql} from '../lib-server'
import * as routines from './routines'

export const scheduleSyncs = inngest.createFunction(
  {id: 'Schedule pipeline syncs'},
  // Disable scheduling during development, can be explicitly triggered from /api/inngest UI
  process.env.NODE_ENV === 'development'
    ? {event: 'sync/scheduler-debug'}
    : {cron: '0 * * * *'}, // Once an hour, https://crontab.guru/#0_*_*_*_*
  routines.scheduleSyncs,
)

export const syncPipeline = inngest.createFunction(
  {id: 'Sync pipeline'},
  {event: 'sync/pipeline-requested'},
  routines.syncPipeline,
)

export const syncConnection = inngest.createFunction(
  {id: 'Sync resource'},
  {event: 'sync/connection-requested'},
  async ({event}) => {
    try {
      const {connectionId} = event.data
      console.log('Will sync resource', connectionId)
      // TODO: Figure out what is the userId we ought to be using...

      const pool = await getPool()
      const customerId = await pool.oneFirst<CustomerId>(
        sql`SELECT customer_id FROM resource WHERE id = ${connectionId}`,
      )
      console.log('customerId', customerId)
      await flatRouter
        .createCaller({
          ...contextFactory.fromViewer({role: 'system'}),
          remoteConnectionId: null,
        })
        .syncConnection({id: connectionId})

      console.log('did sync pipeline', connectionId)
      return connectionId
    } catch (err) {
      console.error('Error running syncConnection', err)
      throw err
    }
  },
)

export const handleWebhook = inngest.createFunction(
  {id: 'Handle webhook'},
  {event: 'webhook/received'},
  ({event: {data}}) => {
    if (data.path.startsWith('connector/')) {
      // TODO: implement me
      console.log('handle connector event', data.path)
    } else {
      console.warn('Unexpected webhook received', data)
    }
  },
)
