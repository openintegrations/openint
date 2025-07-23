import {makeJwtClient} from '@openint/api-v1/lib/makeJwtClient'
import {initDb} from '@openint/db'
import {envRequired} from '@openint/env'

// Global variables with implicit caching on a module scope

export const db = initDb(envRequired.DATABASE_URL)

export const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})
