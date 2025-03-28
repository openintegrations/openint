import type {Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../trpc/context'
import {onboardingRouter} from './onboarding'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return onboardingRouter.createCaller(routerContextFromViewer({db, viewer}))
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
        metadata: {foo: 'bar'},
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
})
