// generated file. Do not modify by hand

import {serverConnectors as cnextConnectors} from '@openint/cnext/connectors.server'
import {default as connectorBrex} from '@openint/connector-brex/server'
import {default as connectorFinch} from '@openint/connector-finch/server'
import {default as connectorGreenhouse} from '@openint/connector-greenhouse/server'
import {default as connectorMerge} from '@openint/connector-merge/server'
import {default as connectorMicrosoft} from '@openint/connector-microsoft/server'
import {default as connectorOnebrick} from '@openint/connector-onebrick/server'
import {default as connectorPlaid} from '@openint/connector-plaid/server'
import {default as connectorPostgres} from '@openint/connector-postgres/server'
import {default as connectorTeller} from '@openint/connector-teller/server'
import {default as connectorYodlee} from '@openint/connector-yodlee/server'
import type {NoOverlappingKeys} from '@openint/util/type-utils'

export const customConnectors = {
  brex: connectorBrex,
  finch: connectorFinch,
  greenhouse: connectorGreenhouse,
  merge: connectorMerge,
  microsoft: connectorMicrosoft,
  onebrick: connectorOnebrick,
  plaid: connectorPlaid,
  postgres: connectorPostgres,
  teller: connectorTeller,
  yodlee: connectorYodlee,
}

export const serverConnectors = {
  ...cnextConnectors,
  ...customConnectors,
} satisfies NoOverlappingKeys<typeof cnextConnectors, typeof customConnectors>
