import {jest} from '@jest/globals'
import {initOpenIntSDK, type OpenIntSDK} from '@openint/sdk'

describe('connectionRouter', () => {
  describe('listConnection', () => {
    jest.setTimeout(20000)
    let openint: OpenIntSDK
    let ccfgId: string
    // let connectionId: string

    beforeAll(async () => {
      openint = initOpenIntSDK({
        baseUrl: 'http://localhost:4000/api/v0',
        headers: {
          'x-apikey': process.env.OPENINT_API_KEY ?? '',
        },
      })
    })

    it('should list connections', async () => {
      try {
        const response = await openint.GET('/core/connection')
        expect(response.response.status).toBe(200)
        expect(response.data.length).toBe(0)
      } catch (err) {
        console.error('Error:', err)
        throw err
      }
    })

    it('should create a connector config', async () => {
      try {
        const response = await openint.POST('/core/connector_config', {
          body: {
            config: {},
            defaultPipeOut: {},
            connectorName: 'greenhouse',
            orgId: 'org_2r7t02yvrfEhad6NtXaJdUcgIyc',
          },
        })
        ccfgId = response.data.id
        expect(response.response.status).toBe(200)
        expect(response.data.id).toBeDefined()
      } catch (err) {
        console.error('Error:', err)
        throw err
      }
    })

    it('should create a connection', async () => {
      const response = await openint.POST('/core/connection', {
        body: {
          connectorConfigId: ccfgId,
          settings: {
            apiKey: 'e5a6a86e28e17bd5d17307e6fcbb3683-8',
          },
          displayName: 'Greenhouse Test',
          disabled: false,
          customerId: 'cust_test',
          metadata: {},
          integrationId: 'int_test',
        },
      })

      console.log('response:', response)

      expect(response.response.status).toBe(200)
    })

    // it('should delete a connector config', async () => {
    //   const options = {
    //     method: 'DELETE',
    //     headers: {'x-apikey': '<api-key>', 'x-connection-id': '<api-key>'},
    //   }

    //   const response = await openint.DELETE(
    //     `/core/connector_config/${ccfgId}` as '/core/connector_config/{id}',
    //     {params: {path: {id: ccfgId}}, ...options},
    //   )
    //   expect(response.response.status).toBe(200)
    // })
  })
})
