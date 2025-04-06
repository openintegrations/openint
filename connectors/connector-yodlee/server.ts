import type {ConnectorServer} from '@openint/cdk'
import type {yodleeSchemas} from './def'
import {makeYodleeClient} from './YodleeClient'

export const yodleeServer = {
  // TODO: handle reconnecting scenario
  preConnect: async ({config, context}) => {
    const loginName =
      config.envName === 'sandbox' ? config?.sandboxLoginName : context.extCustomerId
    if (!loginName) {
      throw new Error('[Yodlee] Sandbox login name not configured')
    }
    const accessToken = await makeYodleeClient(config, {
      role: 'admin',
    }).generateAccessToken(loginName)
    return {accessToken, envName: config.envName}
  },
  // Without closure we get type issues in openint.config.ts, not sure why
  // https://share.cleanshot.com/X3cQDA

  postConnect: async ({connectOutput, config, context}) => {
    // Should we get accessToken & loginName from the preConnect phase?
    const loginName =
      config.envName === 'sandbox' ? config?.sandboxLoginName : context.extCustomerId
    if (!loginName) {
      throw new Error('[Yodlee] Sandbox login name not configured')
    }
    const yodlee = makeYodleeClient(config, {role: 'user', loginName})
    const [providerAccount, provider, user] = await Promise.all([
      yodlee.getProviderAccount(connectOutput.providerAccountId),
      yodlee.getProvider(connectOutput.providerId),
      yodlee.getUser(),
    ])

    return {
      connectionExternalId: connectOutput.providerAccountId,
      settings: {
        loginName,
        providerAccountId: connectOutput.providerAccountId,
        provider,
        providerAccount,
        user,
        accessToken: yodlee.accessToken,
      },
      integration: provider
        ? {externalId: connectOutput.providerId, data: {...provider}}
        : undefined,
    }
  },
} satisfies ConnectorServer<typeof yodleeSchemas>

export default yodleeServer
