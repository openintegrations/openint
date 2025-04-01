const fs = require('fs')
const https = require('https')
const yaml = require('js-yaml')

async function getOasSpec() {
  if (process.env.NODE_ENV === 'development') {
    const {exec} = require('child_process')

    // Run the pnpm gen command in the api-v1 package
    exec('pnpm gen', {cwd: '../packages/api-v1'}, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing pnpm gen: ${error.message}`)
        return
      }
      if (stderr) {
        console.error(`pnpm gen stderr: ${stderr}`)
        return
      }
      return JSON.parse(
        fs.readFileSync(
          '../packages/api-v1/__generated__/openapi.json',
          'utf8',
        ),
      )
    })
  }

  return new Promise((resolve, reject) => {
    https.get(
      'https://app.stainless.com/api/spec/documented/openint',
      (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            resolve(yaml.load(data))
          } catch (e) {
            reject(e)
          }
        })

        res.on('error', (err) => {
          reject(err)
        })
      },
    )
  })
}

async function main() {
  const oas = await getOasSpec()

  // no longer in use
  const pathsToFilterOut = []

  const filteredPaths = Object.keys(oas.paths)
    .filter((path) => !pathsToFilterOut.includes(path))
    .reduce((obj, key) => {
      obj[key] = oas.paths[key]
      return obj
    }, {})

  // Update the OAS with the filtered paths
  oas.paths = filteredPaths

  // Save the updated OAS to a new file as YAML
  fs.writeFileSync('mintlify.oas.yml', yaml.dump(oas, {lineWidth: -1}))

  console.log('Filtered OAS saved to mintlify.oas.yml for Mintlify')
}

main().catch(console.error)
