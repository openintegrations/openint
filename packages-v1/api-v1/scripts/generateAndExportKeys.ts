import {exportJWK, generateKeyPair} from 'jose'
import {z} from 'zod'

const envName = z
  .enum(['development', 'preview', 'production'])
  .default('development')
  .parse(process.argv[2])

// Function to generate a new RSA key pair, converts the keys to JWK (JSON Web Key) format,
// adds necessary metadata, and saves them to separate files.
async function generateAndExportKeys() {
  // Generate a new RSA key pair using the RS256 algorithm.
  const {publicKey, privateKey} = await generateKeyPair('RS256', {
    extractable: true,
  })
  // Convert the generated keys to JWK format
  const privateJwk = await exportJWK(privateKey)
  const publicJwk = await exportJWK(publicKey)
  // Add metadata to the private key JWK.
  // 'use': Indicates the key's intended use (e.g., 'sig' for signing).
  // 'kid': A unique identifier for the key, useful for key management and rotation.
  // 'alg': Specifies the algorithm to be used with the key (Neon RLS Authorize supports only RS256 and ES256 currently).
  privateJwk.use = 'sig'
  privateJwk.kid = `openint-${envName}`
  privateJwk.alg = 'RS256'
  // Add the same metadata to the public key JWK for consistency.
  publicJwk.use = 'sig'
  publicJwk.kid = `openint-${envName}`
  publicJwk.alg = 'RS256'
  // Save the keys to separate JSON files.
  console.log('--- privateKey.jwk.json')
  console.log(JSON.stringify(privateJwk))
  console.log('--- publicKey.jwk.json')
  console.log(JSON.stringify(publicJwk))
  console.log('--- Keys generated and saved to files.')
}
generateAndExportKeys()
