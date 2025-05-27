import type {Viewer} from '@openint/cdk'

import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
import {connectorRouter} from './connector'

const logger = false

jest.setTimeout(1000 * 60 * 15)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return connectorRouter.createCaller(routerContextFromViewer({db, viewer}), {
      onError,
    })
  }

  const asOrg = getCaller({role: 'org', orgId: 'org_222'})

  test('list connectors', async () => {
    const res = await asOrg.listConnectors()

    expect(res.items.length).toBeGreaterThan(1)
  })

  // NOTE: AP: I disabled this test because it fails every time we add a connector if we don't update the snapshot and I don't see the value of it.
  // test('list connectors with schemas', async () => {
  //   const res = await asOrg.listConnectors({expand: ['schemas']})
  //   expect(
  //     res.items.sort((a, b) => a.name.localeCompare(b.name)),
  //   ).toMatchSnapshot()
  // })

  test('get connector by with invalid name returns error', async () => {
    await expect(
      asOrg.getConnectorByName({name: 'foo' as never}),
    ).rejects.toThrow() // TODO: check for /Input validation failed/ but its somehow sometimes throwing a different /invalid_enum_value/ error
  })

  test('get connector by name', async () => {
    const res = await asOrg.getConnectorByName({
      name: 'google-drive',
      expand: ['schemas'],
    })

    expect(res).toMatchObject({
      name: 'google-drive',
      display_name: 'Google Drive',
      logo_url: expect.any(String),
      schemas: {
        connector_config: expect.any(Object),
        connection_settings: expect.any(Object),
        connect_input: expect.any(Object),
        connect_output: expect.any(Object),
      },
    })
  })

  test('oauth2 connectors have valid scope structure', async () => {
    const res = await asOrg.listConnectors({
      limit: 200,
    })
    const oauth2Connectors = res.items.filter(
      (connector) => connector.auth_type === 'OAUTH2',
    )

    expect(oauth2Connectors.length).toBeGreaterThan(0)

    const errors: string[] = []

    oauth2Connectors.forEach((connector) => {
      // Check that they are arrays
      if (!Array.isArray(connector.openint_default_scopes)) {
        errors.push(`${connector.name}: openint_default_scopes is not an array`)
      }
      if (!Array.isArray(connector.openint_allowed_scopes)) {
        errors.push(`${connector.name}: openint_allowed_scopes is not an array`)
      }
      if (!Array.isArray(connector.scopes)) {
        errors.push(`${connector.name}: scopes is not an array`)
      }

      // Check that required scopes are subset of default scopes
      connector.required_scopes?.forEach((scope) => {
        if (!connector.openint_default_scopes?.includes(scope)) {
          errors.push(`${connector.name}: required scope "${scope}" is not in default scopes`)
        }
      })

      // Check that default scopes are subset of allowed scopes
      connector.openint_default_scopes?.forEach((scope) => {
        if (!connector.openint_allowed_scopes?.includes(scope)) {
          errors.push(`${connector.name}: default scope "${scope}" is not in allowed scopes`)
        }
      })

      // Check that allowed scopes are subset of available scopes
      const availableScopes = connector.scopes?.map((s) => s.scope)
      connector.openint_allowed_scopes?.forEach((scope) => {
        if (!availableScopes?.includes(scope)) {
          errors.push(`${connector.name}: allowed scope "${scope}" is not in available scopes`)
        }
      })

      // Check that scopes have required properties
      connector.scopes?.forEach((scope) => {
        if (!('scope' in scope)) {
          errors.push(`${connector.name}: scope object missing 'scope' property`)
        }
        if (!('description' in scope)) {
          errors.push(`${connector.name}: scope object missing 'description' property`)
        }
      })
    })

    if (errors.length > 0) {
      throw new Error(`Found ${errors.length} validation errors:\n${errors.join('\n')}`);
    }
  })
})
