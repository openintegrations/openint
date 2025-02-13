import fs from 'node:fs'
import path from 'node:path'
import {openApiDocument} from '../trpc/routers'

const dest = path.join(__dirname, '../__generated__', 'openapi.json')
fs.writeFileSync(dest, JSON.stringify(openApiDocument, null, 2))

console.log(`openapi.json written to ${dest}`)
