import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import schema from './schema'

// Importing `drizzle-kit/api` in this file causes next.js to crash... So we are separating it instead
// ./node_modules/.pnpm/@esbuild+darwin-arm64@0.19.12/node_modules/@esbuild/darwin-arm64/bin/esbuild
// Reading source code for parsing failed
// An unexpected error happened while trying to read the source code to parse: failed to convert rope into string

// Caused by:
// - invalid utf-8 sequence of 1 bytes from index 0
/** For the full schema, pretty much only used for testing */
export async function getMigrationStatements() {
  return generateMigration(generateDrizzleJson({}), generateDrizzleJson(schema))
}
