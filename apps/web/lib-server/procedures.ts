// import '@openint/app-config/register.node'

import {createClerkClient} from '@clerk/nextjs/server'
import {kApikeyMetadata} from '@openint/app-config/constants'
import type {Viewer} from '@openint/cdk'
import {encodeApiKey, hasRole} from '@openint/cdk'
import {env} from '@openint/env'
import {makeUlid} from '@openint/util'

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

export async function getOrCreateApikey(viewer: Viewer) {
  const orgId = hasRole(viewer, ['org', 'user']) ? viewer.orgId : null
  const userId = hasRole(viewer, ['user']) ? viewer.userId : null

  if (orgId) {
    const res = await clerkClient.organizations.getOrganization({
      organizationId: orgId,
    })
    if (typeof res.privateMetadata[kApikeyMetadata] === 'string') {
      return encodeApiKey(orgId, res.privateMetadata[kApikeyMetadata])
    }
    const key = `key_${makeUlid()}`
    // updateMetadata will do a deepMerge, unlike simple update
    await clerkClient.organizations.updateOrganizationMetadata(orgId, {
      privateMetadata: {[kApikeyMetadata]: key},
    })
    return encodeApiKey(orgId, key)
  }
  if (userId) {
    const res = await clerkClient.users.getUser(userId)
    if (typeof res.privateMetadata[kApikeyMetadata] === 'string') {
      return encodeApiKey(userId, res.privateMetadata[kApikeyMetadata])
    }
    const key = `key_${makeUlid()}`
    // updateMetadata will do a deepMerge, unlike simple update
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {[kApikeyMetadata]: key},
    })
    return encodeApiKey(userId, key)
  }
  throw new Error('Only users and organizations can have apikeys')
}
