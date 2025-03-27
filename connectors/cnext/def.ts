import {z} from 'zod'
import {zConnectorStage, zVerticalKey} from '../../kits/cdk'
import {zAPIKeyConnectorDef} from './_defaults/apikey'
import {zOAuthConfig} from './_defaults/oauth2'

// the idea is that this is provided by a CMS like payload and
// is searchable based on the connector name
const zlinks = z.object({
  web_url: z.string().url().describe("URL to the provider's website"),
  api_docs_url: z
    .string()
    .url()
    .describe("URL to the provider's API documentation")
    .optional(),
  other: z
    .array(
      z.object({
        description: z.string().describe('Description of the link'),
        url: z.string().url().describe('URL of the link'),
      }),
    )
    .describe('Other links relevant to the connector')
    .optional(),
})

export const zAudience = z
  .enum(['consumer', 'business', 'enterprise'])
  .describe('The target audience of the connector')

export type Audience = z.infer<typeof zAudience>

export const zJsonConnectorDef = z.object({
  audience: z.array(zAudience).describe('The audiences of the connector'),
  connector_name: z
    .string()
    .describe('The unique name of the provider in kebab-case'),
  stage: zConnectorStage.describe('The readiness level of the connector'),
  version: z
    .number()
    .int()
    .min(1)
    .max(20)
    .describe('The version of the connector'),
  display_name: z.string().describe('The display name of the provider'),
  verticals: z
    .array(zVerticalKey)
    .describe('The industry verticals this provider belongs to'),
  links: zlinks.optional(),
  auth: z.discriminatedUnion('type', [zOAuthConfig, zAPIKeyConnectorDef]),
})

export type JsonConnectorDef = z.infer<typeof zJsonConnectorDef>

const zAuthType = z
  .union([zOAuthConfig.shape.type, zAPIKeyConnectorDef.shape.type])
  .describe('Union of supported authentication types')

export type AuthType = z.infer<typeof zAuthType>
