// generated file. Do not modify by hand

import type {NoOverlappingKeys} from '@openint/util/type-utils'

import {serverConnectors as cnextConnectors} from '@openint/cnext/connectors.server'
import {default as connectorAirtable} from '@openint/connector-airtable/server'
import {default as connectorApollo} from '@openint/connector-apollo/server'
import {default as connectorBrex} from '@openint/connector-brex/server'
import {default as connectorCoda} from '@openint/connector-coda/server'
import {default as connectorFinch} from '@openint/connector-finch/server'
import {default as connectorFirebase} from '@openint/connector-firebase/server'
import {default as connectorForeceipt} from '@openint/connector-foreceipt/server'
import {default as connectorGreenhouse} from '@openint/connector-greenhouse/server'
import {default as connectorHeron} from '@openint/connector-heron/server'
import {default as connectorLunchmoney} from '@openint/connector-lunchmoney/server'
import {default as connectorMerge} from '@openint/connector-merge/server'
import {default as connectorMoota} from '@openint/connector-moota/server'
import {default as connectorOnebrick} from '@openint/connector-onebrick/server'
import {default as connectorPlaid} from '@openint/connector-plaid/server'
import {default as connectorPostgres} from '@openint/connector-postgres/server'
import {default as connectorRamp} from '@openint/connector-ramp/server'
import {default as connectorSaltedge} from '@openint/connector-saltedge/server'
import {default as connectorSplitwise} from '@openint/connector-splitwise/server'
import {default as connectorStripe} from '@openint/connector-stripe/server'
import {default as connectorTeller} from '@openint/connector-teller/server'
import {default as connectorToggl} from '@openint/connector-toggl/server'
import {default as connectorTwenty} from '@openint/connector-twenty/server'
import {default as connectorWise} from '@openint/connector-wise/server'
import {default as connectorYodlee} from '@openint/connector-yodlee/server'

export const customConnectors = {
  airtable: connectorAirtable,
  apollo: connectorApollo,
  brex: connectorBrex,
  coda: connectorCoda,
  finch: connectorFinch,
  firebase: connectorFirebase,
  foreceipt: connectorForeceipt,
  greenhouse: connectorGreenhouse,
  heron: connectorHeron,
  lunchmoney: connectorLunchmoney,
  merge: connectorMerge,
  moota: connectorMoota,
  onebrick: connectorOnebrick,
  plaid: connectorPlaid,
  postgres: connectorPostgres,
  ramp: connectorRamp,
  saltedge: connectorSaltedge,
  splitwise: connectorSplitwise,
  stripe: connectorStripe,
  teller: connectorTeller,
  toggl: connectorToggl,
  twenty: connectorTwenty,
  wise: connectorWise,
  yodlee: connectorYodlee,
}

export const serverConnectors = {
  ...cnextConnectors,
  ...customConnectors,
} satisfies NoOverlappingKeys<typeof cnextConnectors, typeof customConnectors>
