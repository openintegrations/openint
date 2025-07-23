import {readFile} from 'fs/promises'
import path from 'path'

/**
 * Executes bootstrap.sql if it exists after successful migrations
 */
export async function runBootstrapIfExists(
  execQuery: (query: string) => Promise<unknown>,
): Promise<void> {
  const bootstrapPath = path.join(__dirname, './scripts/bootstrap.sql')

  try {
    const bootstrapSql = await readFile(bootstrapPath, 'utf-8')
    console.log('🎯 Found bootstrap.sql, running bootstrap...')
    await execQuery(bootstrapSql)
    console.log('✅ Bootstrap completed successfully')
  } catch (error) {
    if ((error as {code?: string}).code === 'ENOENT') {
      console.log('⏭️  No bootstrap.sql found, skipping bootstrap step')
    } else {
      console.error('❌ ERROR: Bootstrap failed:', error)
      throw error
    }
  }
}
