import {eq} from 'drizzle-orm'
import type {Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../trpc/context'
import {organizationRouter} from './organization'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return organizationRouter.createCaller(
      routerContextFromViewer({db, viewer}),
    )
  }

  const orgId = 'org_222'
  const asOrg = getCaller({role: 'org', orgId})
  const asUser = getCaller({
    role: 'user',
    userId: 'user_222',
    orgId,
  })

  beforeEach(async () => {
    await db
      .insert(schema.organization)
      .values({
        id: orgId,
        name: 'Test Organization',
        api_key: 'test_api_key',
        slug: 'test-organization',
        metadata: {webhook_url: 'https://webhook.site/webhook-url'},
      })
      .onConflictDoNothing()
  })

  describe('getOnboarding', () => {
    test('returns correct onboarding state for new organization', async () => {
      const result = await asOrg.getOnboarding()

      expect(result).toEqual({
        first_connector_configured: false,
        first_connection_created: false,
        api_key_used: false,
        onboarding_marked_complete: false,
      })
    })

    test('user can access organization onboarding state', async () => {
      const result = await asUser.getOnboarding()

      expect(result).toEqual({
        first_connector_configured: false,
        first_connection_created: false,
        api_key_used: false,
        onboarding_marked_complete: false,
      })
    })
  })

  describe('getOrganization', () => {
    test('returns organization details', async () => {
      const org = await asOrg.getOrganization()

      expect(org).toEqual({
        id: orgId,
        name: 'Test Organization',
        slug: 'test-organization',
        api_key: 'test_api_key',
        created_at: expect.any(String),
        updated_at: expect.any(String),
        metadata: {webhook_url: 'https://webhook.site/webhook-url'},
      })
    })

    test('user can access organization details', async () => {
      const org = await asUser.getOrganization()

      expect(org).toEqual({
        id: orgId,
        name: 'Test Organization',
        slug: 'test-organization',
        api_key: 'test_api_key',
        created_at: expect.any(String),
        updated_at: expect.any(String),
        metadata: {webhook_url: 'https://webhook.site/webhook-url'},
      })
    })
  })

  describe('setOnboardingComplete', () => {
    test('marks onboarding as complete', async () => {
      // Set onboarding complete
      await asOrg.setOnboardingComplete()

      // Verify onboarding is marked complete
      const result = await asOrg.getOnboarding()
      expect(result.onboarding_marked_complete).toBe(true)

      await expect(asOrg.setOnboardingComplete()).rejects.toThrow(
        'Onboarding already marked complete',
      )
    })
  })

  describe('setMetadataUrl', () => {
    test('updates webhook URL', async () => {
      await asOrg.setMetadataUrl({
        urlType: 'webhook_url',
        url: 'https://webhook.site/webhook-url',
      })

      const org = await asOrg.getOrganization()
      expect(org.metadata.webhook_url).toBe('https://webhook.site/webhook-url')
    })

    test('updates OAuth redirect URL', async () => {
      await asOrg.setMetadataUrl({
        urlType: 'oauth_redirect_url',
        url: 'https://app.example.com/oauth/callback',
      })

      const org = await db.query.organization.findFirst({
        where: eq(schema.organization.id, orgId),
      })
      expect(org?.metadata?.oauth_redirect_url).toBe(
        'https://app.example.com/oauth/callback',
      )
    })

    test('rejects invalid webhook URL', async () => {
      await expect(
        asOrg.setMetadataUrl({
          urlType: 'webhook_url',
          url: 'http://insecure-webhook.com',
        }),
      ).rejects.toThrow('Invalid webhook URL. It must start with "https://".')
    })

    test('rejects invalid OAuth redirect URL', async () => {
      await expect(
        asOrg.setMetadataUrl({
          urlType: 'oauth_redirect_url',
          url: 'not-a-valid-url',
        }),
      ).rejects.toThrow(
        'Invalid OAuth redirect URL. Please provide a valid URL.',
      )
    })

    test('does not update if URL is unchanged', async () => {
      const initialOrg = await db.query.organization.findFirst({
        where: eq(schema.organization.id, orgId),
      })

      // Wait a bit to ensure timestamp would be different if updated
      await new Promise((resolve) => setTimeout(resolve, 5))

      await asOrg.setMetadataUrl({
        urlType: 'webhook_url',
        url: 'https://webhook.site/webhook-url',
      })

      const updatedOrg = await db.query.organization.findFirst({
        where: eq(schema.organization.id, orgId),
      })

      expect(updatedOrg?.metadata).toEqual(initialOrg?.metadata)
    })
  })
})
