import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import type {ConnectorSchemas} from '@openint/cdk'

export type NonEmptyArray<T> = [T, ...T[]]

// Dedupe this with `ConnectorSchemas` type would be nice
const schemaKeys = [
  'connectorConfig',
  'connectionSettings',
  'integrationData',
  'webhookInput',
  'preConnectInput',
  'connectInput',
  'connectOutput',
] as const

// Maybe this belongs in the all-connectors package?
export const connectorSchemas = Object.fromEntries(
  schemaKeys.map((key) => [
    key,
    Object.entries(defConnectors).map(([name, def]) => {
      const schemas = def.schemas as ConnectorSchemas
      return z.object({
        connector_name: z.literal(name),
        [key]:
        // Have to do this due to zod version mismatch
        // Also declaring .openapi on mismatched zod does not work due to
        // differing registration holders in zod-openapi
          (schemas[key] as unknown as z.ZodTypeAny | undefined) ?? z.null(),
      })
    }),
  ]),
) as {
  [Key in (typeof schemaKeys)[number]]: NonEmptyArray<
    z.ZodObject<
      {connector_name: z.ZodLiteral<string>} & {
        [k in Key]: z.ZodTypeAny
      }
    >
  >
}
