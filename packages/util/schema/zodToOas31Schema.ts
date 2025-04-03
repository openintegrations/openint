/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {oas30, oas31} from 'zod-openapi'
import {createDocument} from 'zod-openapi'
import type {ZodOpenApiMetadataDef} from 'zod-openapi/dist/extendZodTypes'
import type {OpenAPIObject} from 'zod-openapi/dist/openapi3-ts/dist/oas31'
import type {Z} from '../zod-utils'

export type Oas31Schema = oas31.SchemaObject & {$schema?: string}
export type Oas30Schema = oas30.SchemaObject & {$schema?: string}

/**
 * Convert to JSONSchema using OpenAPI 3.1 spec, which is a superset of JSONSchema Draft 2020-12
 * This is preferred over zod-to-json-schema because it allows for metadata such as title
 * and summary to be specified via the `.openapi()` method.
 */
export function zodToOas31Schema(
  zodSchema: Z.ZodTypeAny,
  zodDefinitions?: Record<string, Z.ZodTypeAny>,
): Oas31Schema {
  let oas: OpenAPIObject = {
    openapi: '3.1.0', // Only 3.1 is basically fully compatible with JSON-schema
    info: {title: '', version: ''},
    components: {
      schemas: {},
    },
  }
  try {
    oas = createDocument({
      openapi: '3.1.0', // Only 3.1 is basically fully compatible with JSON-schema
      info: {title: '', version: ''},
      components: {
        schemas: {...zodDefinitions, schema: zodSchema},
      },
    })
  } catch (err) {
    console.error('Failed to convert zodSchema to oas31Schema', err, zodSchema)
  }
  const roofMeta =
    // Due to the fact that we still have multiple zod-openapi versions due to util/zod
    // Should upgrade at one point at once.
    (zodSchema._def as ZodOpenApiMetadataDef).openapi ??
    (zodSchema._def as Z.ZodTypeDef).zodOpenApi?.openapi

  const {
    schema = {$ref: `#/components/schemas/${roofMeta?.ref}`},
    ...definitions
  } = oas.components?.schemas ?? {}
  return {
    ...schema,
    // Normally jsonschema uses an idiomatic `definitions` key,
    // but we use `components.schemas` to not need to modify any and all refs
    ...(Object.keys(definitions).length && {
      components: {schemas: definitions},
    }),
    /**
     * Superset of the [JSON Schema Specification Draft 2020-12](https://json-schema.org/draft/2020-12/schema)
     * Technically at https://spec.openapis.org/oas/3.1/dialect/base, but many tools don't support meta schemas
     * so we forget it for now.
     */
    // $schema: 'https://json-schema.org/draft/2020-12/schema,'
    // $schema: 'https://spec.openapis.org/oas/3.1/dialect/base',
  }
}
