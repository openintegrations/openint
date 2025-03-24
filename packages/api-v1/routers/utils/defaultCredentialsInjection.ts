import {TRPCError} from '@trpc/server'
import {AnyConnectorImpl, oauthBaseSchema} from '@openint/cdk'

export function injectDefaultCredentials(
  connector: AnyConnectorImpl,
  input: {config?: Record<string, unknown>},
  defaultCredentials?: Record<string, string>,
) {
  const inputClone = Object.assign({}, input)

  if (connector.metadata?.authType) {
    if (
      connector.metadata?.authType === 'OAUTH2' ||
      connector.metadata?.authType === 'OAUTH2CC'
      // NOTE: the schema should be the same once we add oauth1 support
      // connector.metadata.authType === 'OAUTH1'
    ) {
      // attempt to validate it against the oauth preexisting previous provider schema
      const parsedConfig = oauthBaseSchema.connectorConfig.safeParse({
        ...inputClone.config,
        oauth: {
          ...(inputClone.config as any)?.['oauth'],
          ...defaultCredentials,
        },
      })
      if (!parsedConfig.success) {
        console.warn(
          'invalid connector config with merged default credentials',
          parsedConfig.error,
        )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid connector config for ${connector.name}`,
        })
      }
      inputClone.config = {
        ...inputClone.config,
        ...parsedConfig.data,
        oauth: {
          ...(inputClone.config as any)?.['oauth'],
          ...(parsedConfig.data?.oauth || {}),
        },
      }
    }
  } else {
    // else just inject the default credentials without validating
    // TODO: generalize for non oauth and have strong validation for things like api keys
    inputClone.config = {
      ...input.config,
      ...defaultCredentials,
    }
  }

  return inputClone
}
