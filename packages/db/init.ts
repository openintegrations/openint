import type {DbOptions} from './db'

import {initDbNeon} from './db.neon'
import {initDbPg} from './db.pg'

/**
 * Automatically initializes the appropriate database driver based on the URL
 * - Uses initDbNeon for Neon database URLs
 * - Uses initDbPg for all other PostgreSQL URLs
 */
export function initDb(url: string, options: DbOptions = {}) {
  if (url.includes('neon') || url.includes('localtest')) {
    return initDbNeon(url, options)
  }
  return initDbPg(url, options)
}
