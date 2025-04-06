// generated file. Do not modify by hand

import {defConnectors as cnextConnectors} from '@openint/cnext/connectors.def'
import {default as connectorAirtable} from '@openint/connector-airtable/def'
import {default as connectorApollo} from '@openint/connector-apollo/def'
import {default as connectorBrex} from '@openint/connector-brex/def'
import {default as connectorCoda} from '@openint/connector-coda/def'
import {default as connectorFacebook} from '@openint/connector-facebook/def'
import {default as connectorFinch} from '@openint/connector-finch/def'
import {default as connectorFirebase} from '@openint/connector-firebase/def'
import {default as connectorForeceipt} from '@openint/connector-foreceipt/def'
import {default as connectorGong} from '@openint/connector-gong/def'
import {default as connectorGreenhouse} from '@openint/connector-greenhouse/def'
import {default as connectorHeron} from '@openint/connector-heron/def'
import {default as connectorInstagram} from '@openint/connector-instagram/def'
import {default as connectorIntercom} from '@openint/connector-intercom/def'
import {default as connectorJira} from '@openint/connector-jira/def'
import {default as connectorKustomer} from '@openint/connector-kustomer/def'
import {default as connectorLever} from '@openint/connector-lever/def'
import {default as connectorLunchmoney} from '@openint/connector-lunchmoney/def'
import {default as connectorMercury} from '@openint/connector-mercury/def'
import {default as connectorMerge} from '@openint/connector-merge/def'
import {default as connectorMicrosoft} from '@openint/connector-microsoft/def'
import {default as connectorMoota} from '@openint/connector-moota/def'
import {default as connectorOnebrick} from '@openint/connector-onebrick/def'
import {default as connectorOutreach} from '@openint/connector-outreach/def'
import {default as connectorPipedrive} from '@openint/connector-pipedrive/def'
import {default as connectorPlaid} from '@openint/connector-plaid/def'
import {default as connectorPostgres} from '@openint/connector-postgres/def'
import {default as connectorRamp} from '@openint/connector-ramp/def'
import {default as connectorReddit} from '@openint/connector-reddit/def'
import {default as connectorSalesloft} from '@openint/connector-salesloft/def'
import {default as connectorSaltedge} from '@openint/connector-saltedge/def'
import {default as connectorSplitwise} from '@openint/connector-splitwise/def'
import {default as connectorStripe} from '@openint/connector-stripe/def'
import {default as connectorTeller} from '@openint/connector-teller/def'
import {default as connectorToggl} from '@openint/connector-toggl/def'
import {default as connectorTwenty} from '@openint/connector-twenty/def'
import {default as connectorTwitter} from '@openint/connector-twitter/def'
import {default as connectorVenmo} from '@openint/connector-venmo/def'
import {default as connectorWise} from '@openint/connector-wise/def'
import {default as connectorXero} from '@openint/connector-xero/def'
import {default as connectorYodlee} from '@openint/connector-yodlee/def'
import {default as connectorZohodesk} from '@openint/connector-zohodesk/def'
import type {NoOverlappingKeys} from '@openint/util/type-utils'

const customConnectors = {
  airtable: connectorAirtable,
  apollo: connectorApollo,
  brex: connectorBrex,
  coda: connectorCoda,
  facebook: connectorFacebook,
  finch: connectorFinch,
  firebase: connectorFirebase,
  foreceipt: connectorForeceipt,
  gong: connectorGong,
  greenhouse: connectorGreenhouse,
  heron: connectorHeron,
  instagram: connectorInstagram,
  intercom: connectorIntercom,
  jira: connectorJira,
  kustomer: connectorKustomer,
  lever: connectorLever,
  lunchmoney: connectorLunchmoney,
  mercury: connectorMercury,
  merge: connectorMerge,
  microsoft: connectorMicrosoft,
  moota: connectorMoota,
  onebrick: connectorOnebrick,
  outreach: connectorOutreach,
  pipedrive: connectorPipedrive,
  plaid: connectorPlaid,
  postgres: connectorPostgres,
  ramp: connectorRamp,
  reddit: connectorReddit,
  salesloft: connectorSalesloft,
  saltedge: connectorSaltedge,
  splitwise: connectorSplitwise,
  stripe: connectorStripe,
  teller: connectorTeller,
  toggl: connectorToggl,
  twenty: connectorTwenty,
  twitter: connectorTwitter,
  venmo: connectorVenmo,
  wise: connectorWise,
  xero: connectorXero,
  yodlee: connectorYodlee,
  zohodesk: connectorZohodesk,
}

export const defConnectors = {
  ...cnextConnectors,
  ...customConnectors,
} satisfies NoOverlappingKeys<typeof cnextConnectors, typeof customConnectors>
