import {type PlaidSDKTypes} from '@openint/connector-plaid'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type Plaid = PlaidSDKTypes['oas']['components']['schemas']

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
    vendor_id: (t) => t.merchant_entity_id ?? '',
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
        .join(''),
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
    zCast<{merchant_entity_id: string; name: string}>(),
    unified.vendor,
    {
      id: 'merchant_entity_id',
      name: 'name',
      url: () => null,
    },
  ),
}
