import {generateOpenApiDocument} from 'trpc-to-openapi'
import {appRouter} from './routers'

export function generateOpenAPISpec({
  baseUrl = 'https://api.openint.dev/v1',
}: {
  baseUrl?: string
}) {
  const oas = generateOpenApiDocument(appRouter, {
    title: 'OpenInt',
    version: '1.0.0',
    openApiVersion: '3.1.0',
    baseUrl,
    securitySchemes: {
      organizationAuth: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
        description:
          'Organization API key passed in the authorization header with format: Bearer {apiKey}',
      },
      customerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Customer JWT token passed in the authorization header with format: Bearer {token}',
      },
    },
  })

  if (oas.components?.schemas) {
    // sort schemas object based on key name
    const sortedSchemas = Object.keys(oas.components.schemas)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = oas.components!.schemas![key]
          return acc
        },
        {} as Record<string, any>,
      )

    oas.components.schemas = sortedSchemas
  }
  // TODO: Add webhook and others..>
  return oas
}
