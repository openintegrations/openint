import fs from 'node:fs'
import {exportJWK, generateKeyPair} from 'jose'

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
  privateJwk.kid = 'my-key-id'
  privateJwk.alg = 'RS256'
  // Add the same metadata to the public key JWK for consistency.
  publicJwk.use = 'sig'
  publicJwk.kid = 'my-key-id'
  publicJwk.alg = 'RS256'
  // Save the keys to separate JSON files.
  fs.writeFileSync('privateKey.jwk.json', JSON.stringify(privateJwk, null, 2))
  fs.writeFileSync('publicKey.jwk.json', JSON.stringify(publicJwk, null, 2))
  console.log('Keys generated and saved to files.')
}
generateAndExportKeys()
