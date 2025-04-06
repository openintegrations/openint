import {createTRPCCaller} from '@openint/api-v1'
import {makeJwtClient} from '@openint/api-v1/lib/makeJwtClient'
import {type Viewer} from '@openint/cdk'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'

// Global variables with implicit caching on a module scope

export const db = initDbNeon(envRequired.DATABASE_URL)

export type APICaller = ReturnType<typeof createTRPCCaller>

export function createAPICaller<T extends Viewer>(viewer: T) {
  return createTRPCCaller({db}, viewer)
}

export const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})
