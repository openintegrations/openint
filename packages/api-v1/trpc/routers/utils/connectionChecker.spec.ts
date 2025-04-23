import type {
  ConnectorServer,
  CustomerId,
  ExtCustomerId,
  Viewer,
} from '@openint/cdk'
import type {Database} from '@openint/db'
import type {RouterContext} from '../../context'

import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {TRPCError} from '@trpc/server'
import * as allConnectors from '@openint/all-connectors/connectors.server'
import {makeId} from '@openint/cdk'
import {schema} from '@openint/db'
import * as env from '@openint/env'
import {z, Z} from '@openint/util/zod-utils'
import {getApiV1URL} from '../../../lib/typed-routes'
import {core} from '../../../models'
import {checkConnection, connectionExpired} from './connectionChecker'

// Mocks
jest.mock('@openint/all-connectors/connectors.server')
jest.mock('@openint/env')
jest.mock('../../../lib/typed-routes')

// Use jest.mocked for correctly typed mocks
const mockServerConnectors = jest.mocked(allConnectors.serverConnectors)
const mockGetBaseURLs = jest.mocked(env.getBaseURLs)
const mockGetApiV1URL = jest.mocked(getApiV1URL)

// Simplified mock connection helper focusing on relevant fields
const createMockConnection = (
  overrides: Partial<Z.infer<typeof core.connection_select>> = {},
): Z.infer<typeof core.connection_select> => ({
  id: makeId('conn', 'test', '123'),
  connector_name: 'greenhouse',
  connector_config_id: makeId('ccfg', 'test', '123'),
  customer_id: 'cus_test123' as CustomerId,
  created_at: new Date(),
  updated_at: new Date(),
  status: null,
  status_message: null,
  settings: {},
  metadata: null,
  raw_state: null,
  disabled: null,
  display_name: null,
  integration_id: null,
  ...overrides,
})

// Simplified mock context helper focusing only on used properties
const createMockContext = (
  overrides: Partial<RouterContext> = {},
): RouterContext => {
  const mockViewer: Viewer = {
    role: 'customer',
    customerId: 'cus_test123' as CustomerId,
    orgId: 'org_test123',
  }

  const mockWhere = jest.fn().mockResolvedValue({})
  const mockSet = jest.fn().mockReturnValue({where: mockWhere})
  const mockUpdate = jest.fn().mockReturnValue({set: mockSet})

  const mockDb = {
    query: {
      connector_config: {
        findFirst: jest.fn(),
      },
    },
    update: mockUpdate,
    set: mockSet,
    where: mockWhere,
  } as unknown as Database

  const mockFetch = jest
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(null, {status: 200}))

  return {
    viewer: mockViewer,
    asOrgIfCustomer: {db: mockDb} as any,
    fetch: mockFetch,
    remoteProcedureContext: {},
    db: mockDb,
    ...overrides,
  }
}

describe('connectionExpired', () => {
  test('should return true for expired OAuth credentials', () => {
    const expiredConnection = createMockConnection({
      settings: {
        oauth: {
          credentials: {
            access_token: 'expired_token',
            expires_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        },
      },
    })
    expect(connectionExpired(expiredConnection)).toBe(true)
  })

  test('should return false for valid OAuth credentials', () => {
    const validConnection = createMockConnection({
      settings: {
        oauth: {
          credentials: {
            access_token: 'valid_token',
            expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
          },
        },
      },
    })
    expect(connectionExpired(validConnection)).toBe(false)
  })

  test('should return false for missing expires_at', () => {
    const connectionNoExpiry = createMockConnection({
      settings: {
        oauth: {
          credentials: {
            access_token: 'token_no_expiry',
          },
        },
      },
    })
    expect(connectionExpired(connectionNoExpiry)).toBe(false)
  })

  test('should return false for non-OAuth connection', () => {
    const nonOauthConnection = createMockConnection({
      settings: {apiKey: 'some_key'},
    })
    expect(connectionExpired(nonOauthConnection)).toBe(false)
  })

  test('should return false for missing credentials', () => {
    const missingCredsConnection = createMockConnection({
      settings: {
        oauth: {},
      },
    })
    expect(connectionExpired(missingCredsConnection)).toBe(false)
  })

  test('should return false for null settings', () => {
    const nullSettingsConnection = createMockConnection({
      settings: null,
    })
    expect(connectionExpired(nullSettingsConnection)).toBe(false)
  })
})

describe('checkConnection', () => {
  let mockCtx: RouterContext
  let mockCheckConnectionFn: jest.Mock
  let mockNewInstanceFn: jest.Mock
  let mockConnectorConfig: NonNullable<
    Awaited<ReturnType<Database['query']['connector_config']['findFirst']>>
  >

  beforeEach(() => {
    jest.clearAllMocks()
    mockCtx = createMockContext()
    mockCheckConnectionFn = jest.fn()
    mockNewInstanceFn = jest.fn().mockReturnValue({})

    const connectorName = 'greenhouse'

    // @ts-expect-error - Assigning mock for test
    mockServerConnectors[connectorName] = {
      checkConnection: mockCheckConnectionFn,
      newInstance: mockNewInstanceFn,
      schemas: {
        config: z.object({}),
        settings: z.object({}),
        connectOutput: z.object({}),
        resourceSettings: z.object({}).optional(),
      },
    } as unknown as ConnectorServer

    mockGetBaseURLs.mockReturnValue({
      api: 'http://localhost/api',
      console: 'http://localhost/console',
      connect: 'http://localhost/connect',
    })
    mockGetApiV1URL.mockReturnValue(
      `http://localhost/api/v1/webhook/${connectorName}`,
    )

    mockConnectorConfig = {
      id: makeId('ccfg', connectorName, 'test1234'),
      org_id: mockCtx.viewer.orgId,
      connector_name: connectorName,
      config: {someConfig: 'value'},
      created_at: new Date(),
      updated_at: new Date(),
      env_name: null,
    }
    ;(
      mockCtx.asOrgIfCustomer.db.query.connector_config.findFirst as jest.Mock
    ).mockResolvedValue(mockConnectorConfig)
    ;(mockCtx.asOrgIfCustomer.db.update as jest.Mock).mockClear()
    ;(mockCtx.asOrgIfCustomer.db.set as jest.Mock).mockClear()
    ;(mockCtx.asOrgIfCustomer.db.where as jest.Mock).mockClear()
  })

  test.skip('should call connector.checkConnection and update status on success', async () => {
    const connection = createMockConnection()
    const checkResult = {
      status: 'healthy' as const,
      status_message: 'All good!',
      settings: {refreshed: 'data'},
    }
    mockCheckConnectionFn.mockResolvedValue(checkResult)

    const result = await checkConnection(connection, mockCtx)

    expect(mockNewInstanceFn).toHaveBeenCalledWith(
      expect.objectContaining({
        config: mockConnectorConfig.config,
        settings: undefined,
        context: expect.objectContaining({
          webhookBaseUrl: `http://localhost/api/v1/webhook/${connection.connector_name}`,
          extCustomerId: mockCtx.viewer.customerId,
        }),
      }),
    )
    expect(mockCheckConnectionFn).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: connection.settings,
        config: mockConnectorConfig.config,
        instance: {},
        context: expect.objectContaining({
          webhookBaseUrl: `http://localhost/api/v1/webhook/${connection.connector_name}`,
        }),
      }),
    )
    expect(mockCtx.asOrgIfCustomer.db.update).toHaveBeenCalledWith(
      schema.connection,
    )
    expect(mockCtx.asOrgIfCustomer.db.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: checkResult.status,
        status_message: checkResult.status_message,
        settings: checkResult.settings,
        updated_at: expect.any(String),
      }),
    )
    expect(mockCtx.asOrgIfCustomer.db.where).toHaveBeenCalledWith(
      expect.anything(),
    )

    expect(result).toEqual({
      ...checkResult,
      id: connection.id,
      status: checkResult.status,
      status_message: checkResult.status_message,
    })
  })

  test.skip('should throw TRPCError if connector not found', async () => {
    const connection = createMockConnection({connector_name: 'nonExistent'})
    // @ts-expect-error - Deleting mock property for test
    delete mockServerConnectors.nonExistent

    await expect(checkConnection(connection, mockCtx)).rejects.toThrow(
      new TRPCError({
        code: 'NOT_FOUND',
        message: `Connector not found for connection ${connection.id}`,
      }),
    )
  })

  test.skip('should throw TRPCError if connector_config_id is missing', async () => {
    const connection = createMockConnection({connector_config_id: null})

    await expect(checkConnection(connection, mockCtx)).rejects.toThrow(
      new TRPCError({
        code: 'NOT_FOUND',
        message: `Connector config not found for connection ${connection.id}`,
      }),
    )
  })

  test.skip('should throw TRPCError if connector config not found in db', async () => {
    const connection = createMockConnection()
    ;(
      mockCtx.asOrgIfCustomer.db.query.connector_config.findFirst as jest.Mock
    ).mockResolvedValue(undefined)

    await expect(checkConnection(connection, mockCtx)).rejects.toThrow(
      new TRPCError({
        code: 'NOT_FOUND',
        message: `Connector config ${connection.connector_config_id} not found`,
      }),
    )
  })

  test.skip('should throw TRPCError if connector does not implement checkConnection', async () => {
    const connectorName = 'noCheckConn'
    const connection = createMockConnection({
      connector_name: connectorName,
      connector_config_id: makeId('ccfg', connectorName, '456'),
    })

    // @ts-expect-error - Assigning mock for test
    mockServerConnectors[connectorName] = {
      schemas: {config: z.object({}), settings: z.object({})},
      newInstance: jest.fn(),
    } as unknown as ConnectorServer
    ;(
      mockCtx.asOrgIfCustomer.db.query.connector_config.findFirst as jest.Mock
    ).mockResolvedValue({
      id: connection.connector_config_id,
      org_id: mockCtx.viewer.orgId,
      connector_name: connectorName,
      config: {},
      created_at: new Date(),
      updated_at: new Date(),
      env_name: null,
    })

    await expect(checkConnection(connection, mockCtx)).rejects.toThrow(
      new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: `Connector ${connectorName} does not support check_connection`,
      }),
    )
  })

  test.skip('should handle checkConnection result with null status/message', async () => {
    const connection = createMockConnection()
    const checkResult = {status: null, status_message: null}
    mockCheckConnectionFn.mockResolvedValue(checkResult)

    const result = await checkConnection(connection, mockCtx)

    expect(mockCtx.asOrgIfCustomer.db.update).toHaveBeenCalledWith(
      schema.connection,
    )
    expect(mockCtx.asOrgIfCustomer.db.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: null,
        status_message: null,
        updated_at: expect.any(String),
      }),
    )
    expect(mockCtx.asOrgIfCustomer.db.set).not.toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.anything(),
      }),
    )

    expect(result).toEqual({
      id: connection.id,
      status: null,
      status_message: null,
    })
  })

  test.skip('should handle checkConnection result without settings', async () => {
    const connection = createMockConnection({settings: {initial: 'setting'}})
    const checkResult = {status: 'healthy' as const, status_message: 'OK'}
    mockCheckConnectionFn.mockResolvedValue(checkResult)

    const result = await checkConnection(connection, mockCtx)

    expect(mockCtx.asOrgIfCustomer.db.update).toHaveBeenCalledWith(
      schema.connection,
    )
    expect(mockCtx.asOrgIfCustomer.db.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: checkResult.status,
        status_message: checkResult.status_message,
        updated_at: expect.any(String),
      }),
    )
    expect(mockCtx.asOrgIfCustomer.db.set).not.toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.anything(),
      }),
    )

    expect(result).toEqual({
      ...checkResult,
      id: connection.id,
      status: checkResult.status,
      status_message: checkResult.status_message,
    })
  })
})
