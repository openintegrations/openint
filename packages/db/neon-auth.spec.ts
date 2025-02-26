import {eq, sql} from 'drizzle-orm'
import {env} from '@openint/env'
import {Id, makeId, makeJwtClient, Viewer} from '../../kits/cdk'
import {drizzle, neon, schema} from './index'
import {connection, connector_config, pipeline} from './schema'

/**
 * Generates a random string for test IDs
 */
function randomStr(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Creates a test viewer with specified role
 */
function createTestViewer(role: string): Viewer {
  switch (role) {
    case 'anon':
      return {role: 'anon' as const}
    case 'customer':
      return {
        role: 'customer' as const,
        customerId: `cust_${randomStr()}` as any,
        orgId: `org_${randomStr()}`,
      }
    case 'user':
      return {
        role: 'user' as const,
        userId: makeId('user', randomStr()),
        orgId: `org_${randomStr()}`,
      }
    case 'org':
      return {
        role: 'org' as const,
        orgId: `org_${randomStr()}`,
      }
    case 'system':
      return {role: 'system' as const}
    default:
      throw new Error(`Unknown role: ${role}`)
  }
}

/**
 * Gets a Drizzle DB instance authenticated with the given viewer
 */
async function getAuthenticatedDb(viewer: Viewer) {
  if (!env.JWT_PRIVATE_KEY) {
    throw new Error('JWT_PRIVATE_KEY is not set')
  }

  const jwt = makeJwtClient({
    secretOrPrivateKey: env.JWT_PRIVATE_KEY,
    publicKey: env.NEXT_PUBLIC_JWT_PUBLIC_KEY,
  })

  const authToken = await jwt.signViewer(viewer)

  // Create database connection with auth token and schema
  return drizzle(neon(env.DATABASE_URL, {authToken}), {schema})
}

async function initJwtSession(
  db: Awaited<ReturnType<typeof getAuthenticatedDb>>,
) {
  try {
    await db.execute(sql`SELECT auth.init()`)
    return true
  } catch (error) {
    console.error('Error initializing JWT session:', error)
    return false
  }
}

interface TestDataContext {
  orgId: Id<'org'>
  customerId: Id<'cust'>
  userId: Id<'user'>
  connectionIds: Id<'conn'>[]
  configIds: Id<'ccfg'>[]
  integrationIds: Id<'int'>[]
  pipelineIds: Id<'pipe'>[]
}

/**
 * Creates test data in the database
 */
async function createTestData(): Promise<TestDataContext> {
  const systemViewer = createTestViewer('system')
  const db = await getAuthenticatedDb(systemViewer)

  const context: TestDataContext = {
    orgId: makeId('org', randomStr()) as any,
    customerId: `cust_${randomStr()}` as any,
    userId: makeId('user', randomStr()) as any,
    connectionIds: [],
    configIds: [],
    integrationIds: [],
    pipelineIds: [],
  }

  try {
    // Create test integration
    const intId = makeId('int', randomStr(), randomStr()) as any
    await db.execute(sql`
      INSERT INTO integration (id, connector_name, standard, external, created_at, updated_at)
      VALUES (${intId}, 'test', '{}', '{}', now(), now())
      ON CONFLICT (id) DO NOTHING
    `)
    context.integrationIds.push(intId)

    // Create test connector_config
    const ccfgId = makeId('ccfg', randomStr(), randomStr()) as any
    await db.execute(sql`
      INSERT INTO connector_config (id, org_id, connector_name, config, created_at, updated_at)
      VALUES (${ccfgId}, ${context.orgId}, 'test', '{}', now(), now())
      ON CONFLICT (id) DO NOTHING
    `)
    context.configIds.push(ccfgId)

    // Create test connection
    const connId = makeId('conn', randomStr(), randomStr()) as any
    await db.execute(sql`
      INSERT INTO connection (id, connector_name, customer_id, connector_config_id, integration_id, settings, created_at, updated_at)
      VALUES (
        ${connId}, 
        'test', 
        ${context.customerId}, 
        ${ccfgId},
        ${intId},
        '{}',
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING
    `)
    context.connectionIds.push(connId)

    // Create another connection for pipeline tests
    const conn2Id = makeId('conn', randomStr(), randomStr()) as any
    await db.execute(sql`
      INSERT INTO connection (id, connector_name, customer_id, connector_config_id, integration_id, settings, created_at, updated_at) 
      VALUES (
        ${conn2Id},
        'test',
        ${context.customerId},
        ${ccfgId},
        ${intId},
        '{}',
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING
    `)
    context.connectionIds.push(conn2Id)

    // Create a test pipeline
    const pipeId = makeId('pipe', randomStr()) as any
    await db.execute(sql`
      INSERT INTO pipeline (id, source_id, destination_id, created_at, updated_at)
      VALUES (
        ${pipeId},
        ${connId},
        ${conn2Id},
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING
    `)
    context.pipelineIds.push(pipeId)

    return context
  } catch (error) {
    console.error('Error creating test data:', error)
    throw error
  }
}

/**
 * Cleans up test data
 */
async function cleanupTestData(context: TestDataContext) {
  const systemViewer = createTestViewer('system')
  const db = await getAuthenticatedDb(systemViewer)

  try {
    // Clean up in reverse order of dependencies
    if (context.pipelineIds.length > 0) {
      await db.execute(sql`
        DELETE FROM pipeline 
        WHERE id IN (${sql.join(context.pipelineIds, sql`, `)})
      `)
    }

    if (context.connectionIds.length > 0) {
      await db.execute(sql`
        DELETE FROM connection 
        WHERE id IN (${sql.join(context.connectionIds, sql`, `)})
      `)
    }

    if (context.configIds.length > 0) {
      await db.execute(sql`
        DELETE FROM connector_config 
        WHERE id IN (${sql.join(context.configIds, sql`, `)})
      `)
    }

    if (context.integrationIds.length > 0) {
      await db.execute(sql`
        DELETE FROM integration 
        WHERE id IN (${sql.join(context.integrationIds, sql`, `)})
      `)
    }

    console.log('Test data cleaned up')
  } catch (error) {
    console.error('Error cleaning up test data:', error)
  }
}

describe('Neon Authorize Authentication', () => {
  // Skip these tests if the DATABASE_URL is not set
  const itIfDb = env.DATABASE_URL ? it : it.skip

  // Test data context
  let testData: TestDataContext

  // Set up test data once before all tests
  beforeAll(async () => {
    if (!env.DATABASE_URL) return
    testData = await createTestData()
  })

  // Clean up test data after all tests
  afterAll(async () => {
    if (!env.DATABASE_URL || !testData) return
    await cleanupTestData(testData)
  })

  describe('Extension and function availability', () => {
    itIfDb('pg_session_jwt extension should be installed', async () => {
      const systemViewer = createTestViewer('system')
      const db = await getAuthenticatedDb(systemViewer)

      const {rows} = await db.execute(sql`
        SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_session_jwt'
      `)

      expect(rows.length).toBe(1)
      expect(rows[0]!['extname']).toBe('pg_session_jwt')
    })

    itIfDb('auth.init() function should be available', async () => {
      const systemViewer = createTestViewer('system')
      const db = await getAuthenticatedDb(systemViewer)

      const {rows} = await db.execute(sql`
        SELECT proname, pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname = 'init' AND pronamespace::regnamespace::text = 'auth'
      `)

      expect(rows.length).toBe(1)
      expect(rows[0]!['proname']).toBe('init')
      expect(rows[0]!['schema']).toBe('auth')

      // Test calling the function
      await db.execute(sql`SELECT auth.init()`)
    })

    itIfDb('auth.user_id() function should be available', async () => {
      const systemViewer = createTestViewer('system')
      const db = await getAuthenticatedDb(systemViewer)

      const {rows} = await db.execute(sql`
        SELECT proname, pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname = 'user_id' AND pronamespace::regnamespace::text = 'auth'
      `)

      expect(rows.length).toBe(1)
      expect(rows[0]!['proname']).toBe('user_id')
      expect(rows[0]!['schema']).toBe('auth')
    })

    itIfDb('auth.session() function should be available', async () => {
      const systemViewer = createTestViewer('system')
      const db = await getAuthenticatedDb(systemViewer)

      const {rows} = await db.execute(sql`
        SELECT proname, pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname = 'session' AND pronamespace::regnamespace::text = 'auth'
      `)

      expect(rows.length).toBe(1)
      expect(rows[0]!['proname']).toBe('session')
      expect(rows[0]!['schema']).toBe('auth')
    })

    itIfDb('public.jwt_sub() function should be available', async () => {
      const systemViewer = createTestViewer('system')
      const db = await getAuthenticatedDb(systemViewer)

      const {rows} = await db.execute(sql`
        SELECT proname, pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname = 'jwt_sub' AND pronamespace::regnamespace::text = 'public'
      `)

      expect(rows.length).toBe(1)
      expect(rows[0]!['proname']).toBe('jwt_sub')
      expect(rows[0]!['schema']).toBe('public')
    })

    itIfDb('public.jwt_org_id() function should be available', async () => {
      const systemViewer = createTestViewer('system')
      const db = await getAuthenticatedDb(systemViewer)

      const {rows} = await db.execute(sql`
        SELECT proname, pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname = 'jwt_org_id' AND pronamespace::regnamespace::text = 'public'
      `)

      expect(rows.length).toBe(1)
      expect(rows[0]!['proname']).toBe('jwt_org_id')
      expect(rows[0]!['schema']).toBe('public')
    })

    itIfDb(
      'public.jwt_customer_id() function should be available',
      async () => {
        const systemViewer = createTestViewer('system')
        const db = await getAuthenticatedDb(systemViewer)

        const {rows} = await db.execute(sql`
        SELECT proname, pronamespace::regnamespace as schema
        FROM pg_proc
        WHERE proname = 'jwt_customer_id' AND pronamespace::regnamespace::text = 'public'
      `)

        expect(rows.length).toBe(1)
        expect(rows[0]!['proname']).toBe('jwt_customer_id')
        expect(rows[0]!['schema']).toBe('public')
      },
    )
  })

  describe('JWT authentication', () => {
    itIfDb('JWT should work for customer role', async () => {
      const customerViewer = createTestViewer('customer')
      customerViewer.customerId = testData.customerId as any
      customerViewer.orgId = testData.orgId as any

      const db = await getAuthenticatedDb(customerViewer)

      // Initialize JWT session
      await initJwtSession(db)

      // Verify claims using auth.session()
      const {rows} = await db.execute(sql`
        SELECT 
          auth.session()->'customer_id' as customer_id,
          auth.session()->'org_id' as org_id,
          auth.session()->'role' as role
      `)

      expect(rows.length).toBeGreaterThan(0)

      // Clean up JSON string results if needed
      const customerId =
        rows[0]?.['customer_id'] != null &&
        typeof rows[0]['customer_id'] === 'string'
          ? rows[0]['customer_id'].replace(/^"|"$/g, '')
          : rows[0]?.['customer_id']

      const orgId =
        rows[0]?.['org_id'] != null && typeof rows[0]['org_id'] === 'string'
          ? rows[0]['org_id'].replace(/^"|"$/g, '')
          : rows[0]?.['org_id']

      const role =
        rows[0]?.['role'] != null && typeof rows[0]['role'] === 'string'
          ? rows[0]['role'].replace(/^"|"$/g, '')
          : rows[0]?.['role']

      expect(customerId).toBe(customerViewer.customerId)
      expect(orgId).toBe(customerViewer.orgId)
      expect(role).toBe('customer')

      // Check our custom functions
      const {rows: customFuncs} = await db.execute(sql`
        SELECT 
          public.jwt_customer_id() as customer_id,
          public.jwt_org_id() as org_id,
          public.jwt_sub() as sub
      `)

      expect(customFuncs.length).toBeGreaterThan(0)
      expect(customFuncs[0]?.['customer_id']).toBe(customerViewer.customerId)
      expect(customFuncs[0]?.['org_id']).toBe(customerViewer.orgId)
      // sub for customer should be null or empty
    })

    itIfDb('JWT should work for org role', async () => {
      const orgViewer = createTestViewer('org')
      // @ts-expect-error
      orgViewer.orgId = testData.orgId

      const db = await getAuthenticatedDb(orgViewer)

      // Initialize JWT session
      await initJwtSession(db)

      // Verify claims using auth.session()
      const {rows} = await db.execute(sql`
        SELECT 
          auth.session()->'org_id' as org_id,
          auth.session()->'role' as role
      `)

      expect(rows.length).toBeGreaterThan(0)

      // Clean up JSON string results
      const orgId =
        rows[0]?.['org_id'] != null && typeof rows[0]['org_id'] === 'string'
          ? rows[0]['org_id'].replace(/^"|"$/g, '')
          : rows[0]?.['org_id']

      const role =
        rows[0]?.['role'] != null && typeof rows[0]['role'] === 'string'
          ? rows[0]['role'].replace(/^"|"$/g, '')
          : rows[0]?.['role']

      expect(orgId).toBe(orgViewer.orgId)
      expect(role).toBe('org')

      // Check our custom functions
      const {rows: customFuncs} = await db.execute(sql`
        SELECT 
          public.jwt_org_id() as org_id,
          public.jwt_customer_id() as customer_id
      `)

      expect(customFuncs.length).toBeGreaterThan(0)
      expect(customFuncs[0]?.['org_id']).toBe(orgViewer.orgId)
      expect([null, '', undefined]).toContain(customFuncs[0]?.['customer_id'])
    })

    itIfDb('JWT should work for user role', async () => {
      const userViewer = createTestViewer('user')
      userViewer.userId = testData.userId as any
      userViewer.orgId = testData.orgId as any

      const db = await getAuthenticatedDb(userViewer)

      // Initialize JWT session
      await initJwtSession(db)

      // Verify claims using auth functions
      const {rows} = await db.execute(sql`
        SELECT 
          auth.user_id() as user_id,
          auth.session()->'org_id' as org_id,
          auth.session()->'role' as role
      `)

      expect(rows.length).toBeGreaterThan(0)

      const userId =
        rows[0]?.['user_id'] != null && typeof rows[0]['user_id'] === 'string'
          ? rows[0]['user_id'].replace(/^"|"$/g, '')
          : rows[0]?.['user_id']

      expect(userId).toBe(userViewer.userId)

      // Clean up JSON string results
      const orgId =
        rows[0]?.['org_id'] != null && typeof rows[0]['org_id'] === 'string'
          ? rows[0]['org_id'].replace(/^"|"$/g, '')
          : rows[0]?.['org_id']

      const role =
        rows[0]?.['role'] != null && typeof rows[0]['role'] === 'string'
          ? rows[0]['role'].replace(/^"|"$/g, '')
          : rows[0]?.['role']

      expect(orgId).toBe(userViewer.orgId)
      expect(role).toBe('user')

      // Check our custom functions
      const {rows: customFuncs} = await db.execute(sql`
        SELECT 
          public.jwt_org_id() as org_id,
          public.jwt_sub() as sub
      `)

      expect(customFuncs.length).toBeGreaterThan(0)
      expect(customFuncs[0]?.['org_id']).toBe(userViewer.orgId)
      expect(customFuncs[0]?.['sub']).toBe(userViewer.userId)
    })
  })

  describe('Row Level Security', () => {
    itIfDb('customer should only see their own connections', async () => {
      const customerViewer = createTestViewer('customer')
      customerViewer.customerId = testData.customerId as any
      customerViewer.orgId = testData.orgId as any

      const db = await getAuthenticatedDb(customerViewer)

      // Initialize JWT session
      await initJwtSession(db)

      // Query using Drizzle
      const connections = await db
        .select()
        .from(connection)
        // @ts-expect-error
        .where(eq(connection.customer_id, testData.customerId))

      // Should see their connections
      expect(connections.length).toBeGreaterThan(0)
      expect(
        // @ts-expect-error
        connections.every((c) => c.customer_id === testData.customerId),
      ).toBe(true)

      // Should not see other customer's connections
      const otherCustomerConnections = await db
        .select()
        .from(connection)
        .where(eq(connection.customer_id, 'cust_nonexistent'))

      expect(otherCustomerConnections.length).toBe(0)
    })

    itIfDb('org should only see resources for their org', async () => {
      const orgViewer = createTestViewer('org')
      orgViewer.orgId = testData.orgId as any

      const db = await getAuthenticatedDb(orgViewer)

      // Initialize JWT session
      await initJwtSession(db)

      // Query using Drizzle
      const configs = await db
        .select()
        .from(connector_config)
        // @ts-expect-error
        .where(eq(connector_config.org_id, testData.orgId))

      // Should see configs for their org
      expect(configs.length).toBeGreaterThan(0)
      // @ts-expect-error
      expect(configs.every((c) => c.org_id === testData.orgId)).toBe(true)

      // Should not see other org's configs
      const otherOrgConfigs = await db
        .select()
        .from(connector_config)
        .where(eq(connector_config.org_id, 'org_nonexistent'))

      expect(otherOrgConfigs.length).toBe(0)
    })

    itIfDb('anon should not have access to protected resources', async () => {
      const anonViewer = createTestViewer('anon')

      const db = await getAuthenticatedDb(anonViewer)

      // Query using Drizzle
      const configs = await db.select().from(connector_config)

      // Should not see any configs
      expect(configs.length).toBe(0)

      const connections = await db.select().from(connection)

      // Should not see any connections
      expect(connections.length).toBe(0)
    })

    itIfDb('system role should bypass RLS', async () => {
      const systemViewer = createTestViewer('system')

      const db = await getAuthenticatedDb(systemViewer)

      // Query using Drizzle
      const configs = await db
        .select()
        .from(connector_config)
        // @ts-expect-error
        .where(eq(connector_config.org_id, testData.orgId))

      // Should see configs for the test org
      expect(configs.length).toBeGreaterThan(0)

      const connections = await db
        .select()
        .from(connection)
        // @ts-expect-error
        .where(eq(connection.customer_id, testData.customerId))

      // Should see connections for the test customer
      expect(connections.length).toBeGreaterThan(0)
    })
  })

  describe('Complex RLS scenarios', () => {
    itIfDb(
      'customer should see pipelines connected to their resources',
      async () => {
        const customerViewer = createTestViewer('customer')
        customerViewer.customerId = testData.customerId as any
        customerViewer.orgId = testData.orgId as any

        const db = await getAuthenticatedDb(customerViewer)

        // Initialize JWT session
        await initJwtSession(db)

        // First get the user's connections
        const connections = await db
          .select({
            id: connection.id,
          })
          .from(connection)
          // @ts-expect-error
          .where(eq(connection.customer_id, testData.customerId))

        // Should have connections
        expect(connections.length).toBeGreaterThan(0)

        // Get the connection IDs
        const connectionIds = connections.map((c) => c.id)

        // Now look for pipelines using these connections
        const pipes = await db
          .select()
          .from(pipeline)
          .where(
            sql`source_id = ANY(${connectionIds}) OR destination_id = ANY(${connectionIds})`,
          )

        // Should find pipelines
        expect(pipes.length).toBeGreaterThan(0)
      },
    )

    itIfDb('org should see all connections in their org', async () => {
      const orgViewer = createTestViewer('org')
      // @ts-expect-error
      orgViewer.orgId = testData.orgId

      const db = await getAuthenticatedDb(orgViewer)

      // Initialize JWT session
      await initJwtSession(db)

      // Get connector configs for this org
      const configs = await db
        .select({
          id: connector_config.id,
        })
        .from(connector_config)
        // @ts-expect-error
        .where(eq(connector_config.org_id, testData.orgId))

      // Should have configs
      expect(configs.length).toBeGreaterThan(0)

      // Get config IDs
      const configIds = configs.map((c) => c.id)

      // Get connections using these configs
      const connections = await db
        .select()
        .from(connection)
        .where(sql`connector_config_id = ANY(${configIds})`)

      // Should find connections using this org's configs
      expect(connections.length).toBeGreaterThan(0)
    })
  })
})
