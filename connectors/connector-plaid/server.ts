import {initSDK} from '@opensdks/runtime'
import type {PlaidSDKTypes} from '@opensdks/sdk-plaid'
import {plaidSdkDef} from '@opensdks/sdk-plaid'
import type {PlaidApi, PlaidError} from 'plaid'
import * as plaid from 'plaid'
import {CountryCode, Products} from 'plaid'
import type {ConnectorServer} from '@openint/cdk'
import type {IAxiosError} from '@openint/util/http/http-utils'
import type {plaidSchemas} from './def'
import {helpers as def} from './def'
import {inferPlaidEnvFromToken} from './plaid-utils'
import {getPlatformConfig, makePlaidClient, zWebhook} from './PlaidClient'
import {rxjs} from '@openint/util/observable-utils'

export function initPlaidSDK(options: PlaidSDKTypes['options']) {
  return initSDK(plaidSdkDef, options)
}
export type PlaidSDK = ReturnType<typeof initPlaidSDK>

export const plaidServerConnector = {
  // TODO: Do we actually need the preConnect and postConnect phase at all?
  // What if everything is encapsulated in useConnectHook and integrations each get to
  // expose trpc endpoints that the frontend can call at will?
  // That can solve for things like custom API endpoints that we do not have the right abstraction for
  // (such as sandboxFireWebhook, or sandboxLinkTokenCreate)
  // Should also be easier for newcomers to reason about
  // new methods
  // - prefetch
  // - connect
  // - commandsForResource
  preConnect: (
    config,
    {extCustomerId: userId, connection, integrationExternalId, ...ctx},
    input,
  ) => {
    if (input.sandboxPublicTokenCreate) {
      return makePlaidClient(config)
        .sandboxPublicTokenCreate({
          initial_products: [Products.Transactions],
          institution_id: 'ins_109508', // First Platipus bank
        })
        .then(({data: res}) => res)
    }
    return makePlaidClient(config)
      .linkTokenCreate({
        access_token: connection?.settings.accessToken, // Reconnecting
        // Not working as of the latest plaid api, need to think when this is relevant again.
        // https://share.cleanshot.com/5pKLdGh4
        // institution_id: integrationExternalId
        //   ? `${integrationExternalId}`
        //   : undefined, // Probably doesn't work, but we wish it does...
        user: {client_user_id: userId},
        client_name: config.clientName,
        language: input.language ?? config.language,
        ...(!connection?.settings.accessToken && {products: config.products}),
        country_codes: config.countryCodes,
        // Webhook and redirect_uri would be part of the `connection` already.
        // redirect_uri: ctx.redirectUrl,
        webhook: ctx.webhookBaseUrl,
      })
      .then(({data: res}) => {
        console.log('willConnect response', res)
        return res
      })
  },

  postConnect: async ({publicToken: public_token, meta}, config) => {
    const client: PlaidApi = makePlaidClient(config)

    const [{data: res}, {data: insRes}] = await Promise.all([
      client.itemPublicTokenExchange({public_token}),
      meta?.institution?.institution_id && config.envName
        ? client.institutionsGetById({
            institution_id: meta.institution.institution_id,
            // Is this right? Get all country codes...
            country_codes: [
              CountryCode.Us,
              CountryCode.Gb,
              CountryCode.Es,
              CountryCode.Nl,
              CountryCode.Fr,
              CountryCode.Ie,
              CountryCode.Ca,
              CountryCode.De,
              CountryCode.It,
            ],
            options: {include_optional_metadata: true},
          })
        : {data: null},
    ])
    console.log('[Plaid post connect]', res, insRes)
    // We will wait to sync the institution until later
    const settings = def._type('connectionSettings', {
      itemId: res.item_id,
      accessToken: res.access_token,
      institution: insRes?.institution,
    })

    // Emit itemId
    return {
      connectionExternalId: res.item_id,
      settings,
      integration: insRes?.institution && {
        externalId: insRes.institution.institution_id,
        data: insRes.institution,
      },
      source$: rxjs.from(
        (meta?.accounts ?? []).map((a) =>
          def._opData('account', a.id, {
            account_id: a.id,
            name: a.name,
            mask: a.mask,
            official_name: a.name,
            balances: {
              available: null,
              current: null,
              limit: null,
              iso_currency_code: null,
              unofficial_currency_code: null,
            },
            type: a.type as plaid.AccountBase['type'],
            subtype: a.subtype as plaid.AccountBase['subtype'],
            verification_status:
              a.verification_status as plaid.AccountBase['verification_status'],
          }),
        ),
      ),
      triggerDefaultSync: true,
    }
  },

  checkConnection: async ({config, settings, options, context}) => {
    console.log('[Plaid] checkConnection', options, context)
    const client = makePlaidClient(config)

    const itemId: string =
      settings.itemId ??
      settings.item?.item_id ??
      (await client
        .itemGet({access_token: settings.accessToken})
        .then((r) => r.data.item.item_id))
    const connUpdate = {connectionExternalId: itemId}

    if (options.updateWebhook) {
      await client.itemWebhookUpdate({
        access_token: settings.accessToken,
        webhook: context.webhookBaseUrl,
      })
      return {
        ...connUpdate,
        triggerDefaultSync: true, // to update settings.item.webhook
        // postgres deepMerge is not implemented yet
        // settings: {item: {webhook: context.webhookBaseUrl}},
      }
    }
    if (options.sandboxSimulateUpdate) {
      await client.sandboxItemFireWebhook({
        access_token: settings.accessToken,
        // webbook_type defaults to `ITEM`, but if `ITEM` is explicitly
        // passed in, it would unfortunately error @see https://share.cleanshot.com/ZfZU3U
        // webhook_type: plaid.WebhookType.Item,
        webhook_code:
          plaid.SandboxItemFireWebhookRequestWebhookCodeEnum.DefaultUpdate,
      })
    }
    if (options.sandboxSimulateDisconnect) {
      await client.sandboxItemResetLogin({access_token: settings.accessToken})
      // To immediate get item to be in a loginRequired state, as it is hard for us to
      // generate an item error and put it inside settings.item.
      // And because this call does nto appear to trigger any webhook
      return {...connUpdate, triggerDefaultSync: true}
    }
    return connUpdate
  },

  revokeConnection: (settings, config) =>
    makePlaidClient(config)
      .itemRemove({access_token: settings.accessToken})
      .catch((err: IAxiosError) => {
        // TODO: Centralize me inside PlaidClient...
        if (
          err.isAxiosError &&
          (err.response?.data as PlaidError | undefined)?.error_code ===
            'ITEM_NOT_FOUND'
        ) {
          console.log('plaidError', err.response?.data)
          return
        }
        throw err
      }),

  // TODO(P2): Verify Plaid webhook authenticity for added security.
  // https://plaid.com/docs/#webhook-verification
  handleWebhook: (input) => {
    const webhook = zWebhook.parse(input.body)
    console.log('[plaid] Received webhook', webhook)
    const DEFAULT_SYNC = def._webhookReturn(webhook.item_id, {
      triggerDefaultSync: true,
    })
    switch (webhook.webhook_type) {
      case 'ITEM': {
        switch (webhook.webhook_code) {
          case 'WEBHOOK_UPDATE_ACKNOWLEDGED':
            return {connectionUpdates: []}
          case 'ERROR':
            // delegate.patchResource({error: webhook.error})
            // await delegate.commit()
            console.error('[plaid] ITEM webhook error', webhook)
            return def._webhookReturn(webhook.item_id, {
              source$: rxjs.of(
                def._opRes(webhook.item_id, {
                  settings: {webhookItemError: webhook.error},
                }),
              ),
            })
        }
      }
      case 'TRANSACTIONS': {
        switch (webhook.webhook_code) {
          case 'INITIAL_UPDATE':
          case 'HISTORICAL_UPDATE':
            return DEFAULT_SYNC
          // return [{connectionExternalId, triggerDefaultSync: true}] // Incremental false?
          case 'DEFAULT_UPDATE':
            return DEFAULT_SYNC
          case 'TRANSACTIONS_REMOVED':
            return def._webhookReturn(webhook.item_id, {
              source$: rxjs.from(
                webhook.removed_transactions.map((tid) =>
                  def._opData('transaction', tid, null),
                ),
              ),
            })
        }
      }
      case 'HOLDINGS': {
        switch (webhook.webhook_code) {
          case 'DEFAULT_UPDATE':
            return DEFAULT_SYNC
        }
      }
      case 'INVESTMENTS_TRANSACTIONS': {
        switch (webhook.webhook_code) {
          case 'DEFAULT_UPDATE':
            return DEFAULT_SYNC
        }
      }
    }

    console.warn('[plaid] Unhandled webhook', webhook)
    return {connectionUpdates: []}
  },
  newInstance: ({config, settings}) => {
    const env = inferPlaidEnvFromToken(settings.accessToken)
    // https://plaid.com/docs/api/#api-host
    const creds = config.credentials ?? getPlatformConfig(env)
    const sdk = initSDK(plaidSdkDef, {
      baseUrl: `https://${env}.plaid.com`,
      headers: {
        'PLAID-CLIENT-ID': creds.clientId,
        'PLAID-SECRET': creds.clientSecret,
        'Content-Type': 'application/json',
      },
      // TODO: Solve this with link
      // links: (defaultLinks) => {
      //   const links: FetchLink[] = [
      //     (req, next) =>
      //       next(
      //         modifyRequest(req, {
      //           duplex: 'half',
      //             body: JSON.stringify({
      //               ...body,
      //               access_token: settings.accessToken,
      // }),
      //         }),
      //       ),

      //     ...defaultLinks,
      //   ]
      //   return Array.isArray(opts.links)
      //     ? opts.links
      //     : opts.links
      //       ? opts.links(links)
      //       : links
      // },
    })
    return {...sdk, accessToken: settings.accessToken}
  },
} satisfies ConnectorServer<typeof plaidSchemas, PlaidSDK>

export default plaidServerConnector
