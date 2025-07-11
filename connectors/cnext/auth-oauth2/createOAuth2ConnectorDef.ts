import type {ConnectorDef} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {JsonConnectorDef} from '../schema'

import {getConnectorDefaultCredentials} from '@openint/env'
import {z} from '@openint/util/zod-utils'
import {oauth2Schemas} from '.'

/**
 * Generates a connector definition based on the Json simplified connector def.
 * Currently only handles Oauth2 ccfgs and connection settings but in future we can switch and generate
 * depending on the def.auth.type
 */
export function createOAuth2ConnectorDef<
  N extends string,
  T extends JsonConnectorDef,
>(name: N, def: T) {
  const connectorConfig = () => {
    let schema = oauth2Schemas.connector_config
    // if there are any connector config overrides, we need to add them to the schema
    if (Object.keys(def.auth?.connector_config ?? {}).length > 0) {
      // TODO: does this need to do a deep merge of connectorConfig.oauth keys?
      schema = z.object({
        ...schema.shape,
        ...(def.auth?.connector_config?.shape as Record<string, Z.ZodTypeAny>),
      })
    }

    const defaultCredentialsConfigured = getConnectorDefaultCredentials(name)

    // if there are default credentials configured, we need to add a choice between using the default credentials and the user's own
    // in future only paid customers will get this option
    if (defaultCredentialsConfigured) {
      // Only use default_scopes if they exist, otherwise use an empty array
      const openintDefaultCredentialsScopes =
        def.auth?.type === 'OAUTH2'
          ? (def.auth?.openint_allowed_scopes ??
            def.auth?.openint_default_scopes)
          : []
      const zOpenIntDefaultScopes = z.array(
        z.enum(openintDefaultCredentialsScopes as [string, ...string[]]),
      )
      return z.object({
        // nest under oauth to keep the schema the same as with previous provider
        oauth: z
          .union([
            z
              .object({
                scopes: zOpenIntDefaultScopes.openapi({
                  title: 'Scopes',
                  description: 'Scopes for OpenInt Platform Credentials',
                }),
              })
              .strict() // This is required union to be non-overlapping and thus work correctly.
              // When using platform credentials, we need to ensure that scopes field is the ONLY field that is present
              // otherwise it will match scenario where user is using their own credentials
              // by stripping out all other fields except scopes...
              .openapi({
                title: 'Use OpenInt platform credentials',
              }),
            schema.shape.oauth.openapi({
              title: 'Use my own',
            }),
          ])
          .openapi({
            'ui:field': 'OAuthField',
            'ui:fieldReplacesAnyOrOneOf': true,
          }),
      })
    }
    return z.object({
      oauth: schema.shape.oauth,
      // make sure to merge in any additional connector config fields
      ...(def.auth?.connector_config?.shape as Record<string, Z.ZodTypeAny>),
    })
  }

  const connectionSettings = () => {
    const schema = oauth2Schemas.connection_settings
    if (def.auth?.connection_settings) {
      return (
        z
          .object({
            ...schema.innerType().shape,
            ...(def.auth?.connection_settings?.shape as Record<
              string,
              Z.ZodTypeAny
            >),
          })
          // TODO: Figure out how to remove this duplication of logic from schemas.ts
          .transform((settings) => {
            if (!settings.access_token) {
              settings.access_token = settings.oauth.credentials?.access_token
            }
            return settings
          })
          .openapi({effectType: 'input'})
      )
    }
    return schema
  }

  return {
    name,
    schemas: {
      ...oauth2Schemas,
      name: z.literal(name),
      connector_config: connectorConfig() as any,
      connection_settings: connectionSettings() as any,
    },
    metadata: {
      displayName: def.display_name,
      stage: def.stage,
      verticals: def.verticals,
      logoUrl: `/_assets/logo-${name}.svg`,
      authType: def.auth?.type,
      jsonDef: def,
    },
  } satisfies ConnectorDef<typeof oauth2Schemas & {name: Z.ZodLiteral<N>}>
}
