import {makeJwtClient} from '@openint/api-v1/lib/makeJwtClient'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'

// Global variables with implicit caching on a module scope

export const db = initDbNeon(envRequired.DATABASE_URL)

export const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})
