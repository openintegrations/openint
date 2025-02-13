import {generateOpenApiDocument} from 'trpc-to-openapi'
import {appRouter} from './routers'

export function generateOpenAPISpec({
  baseUrl = 'http://localhost:3000',
}: {
  baseUrl?: string
}) {
  const oas = generateOpenApiDocument(appRouter, {
    title: 'OpenInt',
    version: '1.0.0',
    baseUrl,
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
