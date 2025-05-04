import {readdir, readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

async function main() {
  const connectorsDir = join(process.cwd(), '..')
  const packageJsonPath = join(process.cwd(), 'package.json')

  // Read package.json first to get current package name
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))
  const currentPackageName = packageJson.name

  // Read all connector directories
  const entries = await readdir(connectorsDir, {withFileTypes: true})
  const connectorDirs = entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        `@openint/${entry.name}` !== currentPackageName,
    )
    .map((dir) => `@openint/${dir.name}`)

  const dependencies = Object.keys(packageJson.dependencies || {})

  // Find missing dependencies
  const missingDeps = connectorDirs.filter((dir) => !dependencies.includes(dir))

  if (missingDeps.length > 0) {
    console.log('Adding missing dependencies to package.json:')
    missingDeps.forEach((dep) => {
      console.log(`- ${dep}`)
      packageJson.dependencies[dep] = 'workspace:*'
    })

    // Write back to package.json
    await writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf-8',
    )
    console.log('Successfully updated package.json with missing dependencies')
  } else {
    console.log(
      'All connector dependencies are properly listed in package.json',
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
