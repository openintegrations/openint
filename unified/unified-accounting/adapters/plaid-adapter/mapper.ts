import {type PlaidSDKTypes} from '@openint/connector-plaid'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type Plaid = PlaidSDKTypes['oas']['components']['schemas']

export const mappers = {
  account: mapper(zCast<Plaid['AccountBase']>(), unified.qboAccount, {
    id: 'account_id',
    name: 'name',
    type: () => 'asset', // TODO
    // type: 'Classification',
    // number: 'AccountType'
  }),
}
