import {type PlaidSDKTypes} from '@openint/connector-plaid'
import {md5Hash} from '@openint/util'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type Plaid = PlaidSDKTypes['oas']['components']['schemas']

/**
 * Derive a merchant entity ID from a name.
 * This is a synthetic ID that is not actually a real merchant entity ID.
 * It is a hash of the name to avoid collisions with real merchant entity IDs.
 * It is prefixed with "synthetic_" to indicate that it is a synthetic ID.
 * @param name - The name of the merchant.
 * @returns The merchant entity ID.
 */
export function deriveMerchantEntityId(name: string): string {
  return `synthetic_${md5Hash(name.toLowerCase().trim())}`
}

export const mappers = {
  account: mapper(zCast<Plaid['AccountBase']>(), unified.account, {
    id: 'account_id',
    name: 'name',

    classification: (a) => {
      switch (a.subtype) {
        case 'credit card':
          return 'liability'
        case 'checking':
        case 'savings':
          return 'asset'
        case 'paypal':
          return 'asset'
        case 'hsa':
          return 'asset'
      }
      switch (a.type) {
        case 'depository':
          return 'asset'
        case 'investment':
          return 'asset'
        case 'loan':
          return 'liability'
        case 'credit':
          return 'liability'
        case 'other':
        default:
          return 'asset'
      }
    },
    updated_at: (a) => a.balances?.last_updated_datetime ?? undefined,
    // created_at: (a) => a.balances?.last_updated_datetime ?? undefined,
  }),
  transaction: mapper(zCast<Plaid['Transaction']>(), unified.transaction, {
    id: 'transaction_id',
    date: 'date',
    // for some reason `null` causes vendor_id to be quoted, probably encoded as json, does not add up but...
    vendor_id: (t) =>
      t.merchant_entity_id ??
      (t.merchant_name ? deriveMerchantEntityId(t.merchant_name) : ''),
    account_id: 'account_id',
    amount: 'amount',
    currency: 'iso_currency_code',
    memo: 'original_description',
    bank_category: (t) =>
      [
        t.personal_finance_category?.primary,
        t.personal_finance_category?.detailed,
      ]
        .filter((c) => !!c)
        .join('/'),
    // Plaid transactions are single entry and therefore unbalanced
    // We should probably not set any "lines" at all in this case.
    // Would also need some semantic to communicate set if null, aka set default value,
    lines: (t) => [
      {
        account_id: '',
        amount: t.amount * -1,
        currency: t.iso_currency_code ?? t.unofficial_currency_code ?? 'USD',
      },
    ],
    // created_at: (t) => t.datetime ?? new Date().toISOString(),
    // updated_at: (t) => t.datetime ?? new Date().toISOString(),
  }),
  merchant: mapper(
    zCast<{merchant_entity_id?: string; name?: string}>(),
    unified.vendor,
    {
      id: (m) =>
        m.merchant_entity_id ?? (m.name ? deriveMerchantEntityId(m.name) : ''),
      name: (m) => m.name ?? '',
      url: () => null,
    },
  ),
}
