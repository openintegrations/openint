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
    // TODO: Sometimes we do not have created / updated at. should make these fields optional...
    created_at: (a) =>
      a.balances?.last_updated_datetime ?? new Date().toISOString(),
    updated_at: (a) =>
      a.balances?.last_updated_datetime ?? new Date().toISOString(),
  }),
  transaction: mapper(zCast<Plaid['Transaction']>(), unified.transaction, {
    id: 'transaction_id',
    date: 'date',
    account_id: 'account_id',
    amount: 'amount',
    currency: 'iso_currency_code',
    memo: 'original_description',
    bank_category: (t) => t.personal_finance_category?.primary,
    // Plaid transactions are single entry and therefore unbalanced
    // We should probably not set any "lines" at all in this case.
    // Would also need some semantic to communicate set if null, aka set default value,
    lines: () => [],
    created_at: (t) => t.datetime ?? new Date().toISOString(),
    updated_at: (t) => t.datetime ?? new Date().toISOString(),
  }),
}
