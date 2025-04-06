import {execSync} from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

// Path to the defs directory
const defsDir = path.join(__dirname, '../defs')

// Path to the output file (now index.ts in the defs folder)
const outputFile = path.join(defsDir, 'index.ts')

// Get all .ts files in the defs directory
const files = fs
  .readdirSync(defsDir)
  .filter((file) => file.endsWith('.ts') && file !== 'index.ts')

// Generate the content for index.ts
let content = '// This file is auto-generated. Do not edit manually.\n\n'

// Function to convert a filename to a valid JavaScript identifier
function toValidIdentifier(fileName: string): string {
  // Replace hyphens and other non-alphanumeric characters with underscores
  return fileName.replace(/[^a-zA-Z0-9]/g, '_')
}

// Add imports for each file
files.forEach((file) => {
  const fileName = path.basename(file, '.ts')
  const importName = toValidIdentifier(fileName)
  content += `import ${importName} from './${fileName}';\n`
})

// Add the object with all imports
content += '\nconst defs = {\n'
files.forEach((file) => {
  const fileName = path.basename(file, '.ts')
  const importName = toValidIdentifier(fileName)
  content += `  '${fileName}': ${importName},\n`
})
content += '};\n\n'

// Export the object as default
content += 'export default defs;\n'

// Write the content to the output file
fs.writeFileSync(outputFile, content)

console.log(`Generated index.ts in defs folder with ${files.length} imports.`)

// Run Prettier on the generated file
try {
  console.log('Running Prettier on the generated file...')
  execSync(`npx prettier --write "${outputFile}"`, {stdio: 'inherit'})
  console.log('Prettier formatting complete.')
} catch (error) {
  console.error('Error running Prettier:', error)
}

// Run ESLint on the generated file
try {
  console.log('Running ESLint on the generated file...')
  execSync(`npx eslint --fix "${outputFile}"`, {stdio: 'inherit'})
  console.log('ESLint check complete.')
} catch (error) {
  console.error('Error running ESLint:', error)
}
