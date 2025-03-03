// Workaround for vercel env pull cannot properly handle value that contains " #11258
// https://github.com/vercel/vercel/issues/11258
import * as readline from 'node:readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

rl.on('line', (line) => {
  // Replace double quotes with single quotes, but only when they're part of the value
  const processed = line.replace(/^(.*)="(.*)"$/g, "$1='$2'")
  console.log(processed)
})

rl.on('close', () => {
  process.exit(0)
})
