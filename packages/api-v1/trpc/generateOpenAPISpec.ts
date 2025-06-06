import {generateOpenApiDocument} from 'trpc-to-openapi'
import {appRouter} from './routers'

export function generateOpenAPISpec({
  baseURL = 'https://api.openint.dev/v1',
}: {
  baseURL?: string
}) {
  const oas = generateOpenApiDocument(appRouter, {
    title: 'OpenInt',
    version: '1.0.0',
    openApiVersion: '3.1.0',
    baseUrl: baseURL,
    securitySchemes: {
      token: {
        type: 'http',
        scheme: 'bearer',
        description:
          'Organization API Key available in the settings page of the OpenInt Console or Customer API Key or Token Customer authentication token created using the create customer token API. It is passed in the `authorization` header with format: `Bearer {token}`',
      },
    },
  })

  if (oas.components?.schemas) {
    // sort schemas object based on key name and add titles
    const sortedSchemas = Object.keys(oas.components.schemas)
      .sort()
      .reduce<Record<string, any>>((acc, key) => {
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
      }, {})

    oas.components.schemas = sortedSchemas
  }
  // TODO: Add webhook and others..>
  return oas
}
