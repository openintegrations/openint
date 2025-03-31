import {initSDK} from '@opensdks/runtime'
import type {QBOSDKTypes} from '@opensdks/sdk-qbo'
import {qboSdkDef} from '@opensdks/sdk-qbo'
import type {ConnectorServer} from '@openint/cdk'
import type {qboSchemas} from './def'

export function initQBOSdk(options: QBOSDKTypes['options']) {
  const sdk = initSDK(qboSdkDef, options)
  // TODO: Should add options to sdk itself
  return {realmId: options.realmId, ...sdk}
}

export type QBOSDK = ReturnType<typeof initQBOSdk>

export const qboServer = {} satisfies ConnectorServer<
  typeof qboSchemas,
  ReturnType<typeof initQBOSdk>
>

export default qboServer
