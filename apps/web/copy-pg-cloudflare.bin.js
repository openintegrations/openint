// Required for build:worker
const path = require('path')
const {execSync} = require('child_process')

const fs = require('fs')

const sourcePath = path.resolve(
  __dirname,
  '../../node_modules/.pnpm/pg@8.13.1_pg-native@3.0.1/node_modules/pg-cloudflare/dist/index.js',
)
const destinationPath = path.resolve(
  __dirname,
  '.next/standalone/node_modules/.pnpm/pg@8.13.1_pg-native@3.0.1/node_modules/pg-cloudflare/dist',
)

if (!fs.existsSync(sourcePath)) {
  console.error(`PG Cloudflare file does not exist: ${sourcePath}`)
  process.exit(1)
}

if (!fs.existsSync(destinationPath)) {
  console.error(
    `PG Cloudflare destination directory does not exist: ${destinationPath}`,
  )
  process.exit(1)
}

const copyCommand =
  process.platform === 'win32'
    ? `copy "${sourcePath}" "${destinationPath}"`
    : `cp "${sourcePath}" "${destinationPath}"`

try {
  execSync(copyCommand, {stdio: 'inherit'})
} catch (error) {
  console.error('Error copying file:', error)
  process.exit(1)
}
