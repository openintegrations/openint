#!/usr/bin/env bun
import {readFile} from 'fs/promises'
import path from 'path'

import {env} from '@openint/env'
import {initDb} from '../init'

async function main() {
  console.log('🎯 Starting bootstrap process...')

  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const db = initDb(databaseUrl)

  try {
    const bootstrapPath = path.join(__dirname, './scripts/bootstrap.sql')

    const bootstrapSql = await readFile(bootstrapPath, 'utf-8')
    if (bootstrapSql) {
      console.log('🎯 Found bootstrap.sql, running bootstrap...')
      await db.$exec(bootstrapSql)
      console.log('✅ Bootstrap completed successfully')
    } else {
      console.log('⏭️ No bootstrap.sql found, skipping bootstrap step')
    }
  } finally {
    // Type cast to handle complex union types for $end method
    if ((db as any).$end) {
      await (db as any).$end()
    }
    console.log('🔚 Database connection closed')
  }
}

main().catch((error) => {
  console.error('❌ Bootstrap failed:', error)
  process.exit(1)
})
