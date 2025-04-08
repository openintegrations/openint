// generated file. Do not modify by hand

import {defConnectors as cnextConnectors} from '@openint/cnext/connectors.def'
import {default as connectorBrex} from '@openint/connector-brex/def'
import {default as connectorGreenhouse} from '@openint/connector-greenhouse/def'
import {default as connectorMercury} from '@openint/connector-mercury/def'
import {default as connectorMerge} from '@openint/connector-merge/def'
import {default as connectorMicrosoft} from '@openint/connector-microsoft/def'
import {default as connectorOnebrick} from '@openint/connector-onebrick/def'
import {default as connectorPlaid} from '@openint/connector-plaid/def'
import {default as connectorPostgres} from '@openint/connector-postgres/def'
import {default as connectorTeller} from '@openint/connector-teller/def'
import {default as connectorYodlee} from '@openint/connector-yodlee/def'
import type {NoOverlappingKeys} from '@openint/util/type-utils'

export const customConnectors = {
  brex: connectorBrex,
  greenhouse: connectorGreenhouse,
  mercury: connectorMercury,
  merge: connectorMerge,
  microsoft: connectorMicrosoft,
  onebrick: connectorOnebrick,
  plaid: connectorPlaid,
  postgres: connectorPostgres,
  teller: connectorTeller,
  yodlee: connectorYodlee,
}

export const defConnectors = {
  ...cnextConnectors,
  ...customConnectors,
} satisfies NoOverlappingKeys<typeof cnextConnectors, typeof customConnectors>
