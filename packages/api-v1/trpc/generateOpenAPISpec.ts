import {generateOpenApiDocument} from 'trpc-to-openapi'
import {appRouter} from '../routers'

export function generateOpenAPISpec({
  baseUrl = 'https://api.openint.dev/v1',
  removePrivateEndpoints = false,
}: {
  baseUrl?: string
  removePrivateEndpoints?: boolean
}) {
  const oas = generateOpenApiDocument(appRouter, {
    title: 'OpenInt',
    version: '1.0.0',
    openApiVersion: '3.1.0',
    baseUrl,
    securitySchemes: {
      ApiKey: {
        type: 'http',
        scheme: 'bearer',
        description:
          'Organization API key generated in the OpenInt Console and passed in the `authorization` header with format: `Bearer {apiKey}`',
      },
      CustomerToken: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Customer authentication token created using the create customer token API and passed in the `authorization` header with format: `Bearer {token}`',
      },
    },
  })

  // Remove the event endpoint which is a draft one that will be changed and not ready for public use
  // TODO: Use router meta.internal to filter for endpoint that should be removed, hard-code
  // rather than hard-coding here
  if (removePrivateEndpoints && oas.paths) {
    delete oas.paths['/event']
  }

  if (oas.components?.schemas) {
    // sort schemas object based on key name and add titles
    const sortedSchemas = Object.keys(oas.components.schemas)
      .sort()
      .reduce(
        (acc, key) => {
          // Get the original schema
          const schema = oas.components!.schemas![key]

          // Add a title if it doesn't already have one
          if (schema && typeof schema === 'object' && !('title' in schema)) {
            // Extract just the connector name (e.g., "aircall" from "connectors.aircall.connectionSettings")
            const parts = key.split('.')
            const connectorName =
              parts.length > 1 && parts[1] ? parts[1].toLowerCase() : key

            acc[key] = {...schema, title: connectorName}
          } else {
            acc[key] = schema
          }

          return acc
        },
        {} as Record<string, any>,
      )

    oas.components.schemas = sortedSchemas
  }
  // TODO: Add webhook and others..>
  return oas
}
