// generated file. Do not modify by hand

import type {NoOverlappingKeys} from '@openint/util/type-utils'
import {defConnectors as cnextConnectors} from '@openint/cnext/connectors.def'
import {default as connectorAirtable} from '@openint/connector-airtable/def'
import {default as connectorApollo} from '@openint/connector-apollo/def'
import {default as connectorBrex} from '@openint/connector-brex/def'
import {default as connectorCoda} from '@openint/connector-coda/def'
import {default as connectorFinch} from '@openint/connector-finch/def'
import {default as connectorFirebase} from '@openint/connector-firebase/def'
import {default as connectorForeceipt} from '@openint/connector-foreceipt/def'
import {default as connectorGreenhouse} from '@openint/connector-greenhouse/def'
import {default as connectorHeron} from '@openint/connector-heron/def'
import {default as connectorLunchmoney} from '@openint/connector-lunchmoney/def'
import {default as connectorMercury} from '@openint/connector-mercury/def'
import {default as connectorMerge} from '@openint/connector-merge/def'
import {default as connectorMoota} from '@openint/connector-moota/def'
import {default as connectorOnebrick} from '@openint/connector-onebrick/def'
import {default as connectorPlaid} from '@openint/connector-plaid/def'
import {default as connectorPostgres} from '@openint/connector-postgres/def'
import {default as connectorRamp} from '@openint/connector-ramp/def'
import {default as connectorSaltedge} from '@openint/connector-saltedge/def'
import {default as connectorSplitwise} from '@openint/connector-splitwise/def'
import {default as connectorStripe} from '@openint/connector-stripe/def'
import {default as connectorTeller} from '@openint/connector-teller/def'
import {default as connectorToggl} from '@openint/connector-toggl/def'
import {default as connectorTwenty} from '@openint/connector-twenty/def'
import {default as connectorVenmo} from '@openint/connector-venmo/def'
import {default as connectorWise} from '@openint/connector-wise/def'
import {default as connectorYodlee} from '@openint/connector-yodlee/def'

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
  mercury: connectorMercury,
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
  venmo: connectorVenmo,
  wise: connectorWise,
  yodlee: connectorYodlee,
}

export const defConnectors = {
  ...cnextConnectors,
  ...customConnectors,
} satisfies NoOverlappingKeys<typeof cnextConnectors, typeof customConnectors>
