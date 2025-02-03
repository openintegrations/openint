import {type PlaidSDKTypes} from '@openint/connector-plaid'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type Plaid = PlaidSDKTypes['oas']['components']['schemas']

export const mappers = {
  account: mapper(zCast<Plaid['AccountBase']>(), unified.account, {
    id: 'account_id',
    name: 'name',
    type: () => 'asset', // TODO
    // type: 'Classification',
    // number: 'AccountType'
  }),
}
