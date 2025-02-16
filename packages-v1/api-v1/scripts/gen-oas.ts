import fs from 'node:fs'
import path from 'node:path'
import {generateOpenAPISpec} from '../trpc/openapi'

const dest = path.join(__dirname, '../__generated__', 'openapi.json')
fs.writeFileSync(dest, JSON.stringify(generateOpenAPISpec({}), null, 2))

console.log(`openapi.json written to ${dest}`)
// NOTE: While the openapi spec is valid
// the typescript types generated from it are not due to usage of discrminated union in the oas spec
// @see https://github.com/openapi-ts/openapi-typescript/issues/2149
