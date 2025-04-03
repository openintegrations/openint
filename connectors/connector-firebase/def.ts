import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, type Z} from '@openint/util/zod-utils'

export const zFirebaseConfig = z.object({
  projectId: z.string(),
  apiKey: z.string(),
  appId: z.string(),
  authDomain: z.string(),
  databaseURL: z.string(),
  storageBucket: z.string().optional(),
  measurementId: z.string().optional(),
  messagingSenderId: z.string().optional(),
})

/**
 * Can be obtained by executing the following in the browser
 * `console.log(JSON.stringify(fba.auth().currentUser.toJSON(), null, 2))`
 */
export type AuthUserJson = Z.infer<typeof zAuthUserJson>
export const zAuthUserJson = z
  .object({
    uid: z.string(),
    appName: z.string(),
    stsTokenManager: z.record(z.unknown()),
  })
  .catchall(z.unknown())

export const zAuthData = z.discriminatedUnion('method', [
  z.object({method: z.literal('userJson'), userJson: zAuthUserJson}),
  z.object({method: z.literal('customToken'), customToken: z.string()}),
  z.object({
    method: z.literal('emailPassword'),
    email: z.string(),
    password: z.string(),
  }),
])

export const zFirebaseUserConfig = z.object({
  firebaseConfig: zFirebaseConfig,
  authData: zAuthData,
})

export const zServiceAccount = z
  .object({project_id: z.string()})
  .catchall(z.unknown())

export const zSettings = z.discriminatedUnion('role', [
  z.object({role: z.literal('admin'), serviceAccount: zServiceAccount}),
  z.object({role: z.literal('user')}).merge(zFirebaseUserConfig),
])

export const firebaseSchemas = {
  name: z.literal('firebase'),
  connectionSettings: zSettings,
} satisfies ConnectorSchemas

export const firebaseHelpers = connHelpers(firebaseSchemas)

export const firebaseDef = {
  name: 'firebase',
  metadata: {verticals: ['database'], logoUrl: '/_assets/logo-firebase.svg'},
  schemas: firebaseSchemas,
} satisfies ConnectorDef<typeof firebaseSchemas>

export default firebaseDef
