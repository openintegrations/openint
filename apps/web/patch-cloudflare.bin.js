function copyPgCloudflareAndPatchWorker() {
  const path = require('path')
  const {execSync} = require('child_process')
  const fs = require('fs')

  // Copy pg-cloudflare after building.
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
    console.log('Successfully copied pg-cloudflare.')
  } catch (error) {
    console.error('Error copying file:', error)
    process.exit(1)
  }

  // Now patch .open-next/worker.ts to add the line:
  //   process.env = Object.assign({}, process.env, env)
  // right below: const url = new URL(request.url)
  try {
    const workerTsPath = path.resolve(__dirname, '.open-next/worker.ts')
    if (!fs.existsSync(workerTsPath)) {
      console.warn(`Warning: worker.ts not found at: ${workerTsPath}`)
      return
    }

    let workerCode = fs.readFileSync(workerTsPath, 'utf8')
    const insertionMarker = 'const url = new URL(request.url)'
    const envAssignment =
      'process.env = Object.assign({}, process.env, env); process.versions.node = "18.19.0"'

    // Only insert if not already present.
    if (!workerCode.includes(envAssignment)) {
      const modifiedWorkerCode = workerCode.replace(
        insertionMarker,
        `${insertionMarker}\n      ${envAssignment}`,
      )

      fs.writeFileSync(workerTsPath, modifiedWorkerCode, 'utf8')
      console.log('Successfully patched worker.ts with process.env assignment.')
    } else {
      console.log('worker.ts already contains the process.env assignment.')
    }
  } catch (err) {
    console.error('Error patching worker.ts:', err)
    process.exit(1)
  }

  // Now also patch .open-next/server-functions/default/apps/web/handler.mjs
  // by inserting:
  //   req = { ...req, body: await new Promise((resolve) => { let body = ''; req.body.on('data', (chunk) => (body += chunk)); req.body.on('end', () => resolve(body)); }) };
  // right before the line that contains "_nextrequest.NextRequestAdapter.fromBaseNextRequest"
  try {
    const handlerMjsPath = path.resolve(
      __dirname,
      '.open-next/server-functions/default/apps/web/handler.mjs',
    )
    if (!fs.existsSync(handlerMjsPath)) {
      console.warn(`Warning: handler.mjs not found at: ${handlerMjsPath}`)
      return
    }

    let handlerCode = fs.readFileSync(handlerMjsPath, 'utf8')
    const insertionMarker =
      '                const request2 = _nextrequest.NextRequestAdapter.fromBaseNextRequest(req, (0, _nextrequest.signalFromNodeResponse)(res.originalResponse));'
    const insertionLine = `                  req = { ...req, body: await new Promise((resolve) => { let body = ''; req.body.on('data', (chunk) => (body += chunk)); req.body.on('end', () => resolve(body)); }) };`

    // Only insert if not already present.
    if (!handlerCode.includes(insertionLine)) {
      const idx = handlerCode.indexOf(insertionMarker)
      if (idx === -1) {
        console.warn(
          `Marker for insertion not found in handler.mjs: ${insertionMarker}`,
        )
      } else {
        // Insert our line right before the marker
        // We'll keep a small indentation (4 spaces) for readability
        const modifiedHandlerCode = handlerCode.replace(
          insertionMarker,
          `${insertionLine}\n    ${insertionMarker}`,
        )

        fs.writeFileSync(handlerMjsPath, modifiedHandlerCode, 'utf8')
        console.log(
          'Successfully patched handler.mjs with req body assignment.',
        )
      }
    } else {
      console.log('handler.mjs already contains the req body assignment.')
    }
  } catch (err) {
    console.error('Error patching handler.mjs:', err)
    process.exit(1)
  }
}

// Execute the function when the script runs
copyPgCloudflareAndPatchWorker()
