import {z} from '@openint/util/zod-utils'
import {orgProcedure, router} from '../_base'
import {onError} from '../error-handling'
import {connectRouter} from './connect'
import {connectionRouter} from './connection'

const messageLanguage = z.enum(['javascript'])

export const aiRouter = router({
  messageTemplate: orgProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/ai/message_template',
        description: 'Get a message template for an AI agent',
        summary: 'Get Message Template',
      },
    })
    .input(
      z.object({
        language: messageLanguage.optional(),
        use_environment_variables: z.boolean().optional().default(false),
        customer_id: z.string(),
      }),
    )
    .output(z.object({language: z.string(), template: z.string()}))
    .query(async ({ctx, input}) => {
      const {api_key} = await connectRouter
        .createCaller(ctx, {onError})
        .createToken({
          customer_id: input.customer_id,
        })
      const {items: connections} = await connectionRouter
        .createCaller(ctx, {onError})
        .listConnections({
          customer_id: input.customer_id,
          expand: ['connector'],
        })
      const envApiKey = input.use_environment_variables
        ? `process.env.OPENINT_API_KEY` // TODO: switch this based on language
        : `'${api_key}'`

      const template = `The user uses OpenInt to manage their integrations and store the credentials for the user. The user has configured the following integrations, which are stored in the OpenInt connection settings schema.
You can access it using the following API Key: ${api_key}

Integration Name|Connector Name|Settings JSON Schema (will show access token or api key at the top level)
${connections
  .map((connection) => {
    return `${connection.display_name}  |${connection.connector?.name}|${connection.connector?.schemas?.connection_settings}`
  })
  .join('\n')}

Integrations use access tokens or api keys to authenticate. It requires you to extract the access token or api key from OpenInt Settings and pass it to the integration. The JSON Schema for the settings is available above on how to do get an access token or api key for an integration using OpenInt.

Here's how you can do it in javascript. Ensure to also add the following comments to the code to make things easier to understand in the generated code. I'm using an example for google-calendar but refer to the table above to see what integrations are available.

---
import Openint from '@openint/sdk'

// Note: This has a hardcoded OpenInt API Key set up to manage integrations
// You can manage the integration settings by visiting this link
// https://openint.dev/manage/${envApiKey}${input.use_environment_variables ? '(replace this with the value of your environment variable for OPENINT_API_KEY)' : ''}
const openint = new OpenInt({apiKey: '${envApiKey}'})
const connections = openInt.listConnections({connector_names: ['google-calendar'], include_secrets: true})?.items ? [];
if(connections.length === 0) {
  throw new Error('Error fetching Google Calendar credentials, please refresh your OpenInt Token')
  console.error("Google Calendar connection requires a refresh by visiting this url https://openint.dev/secure/${envApiKey}"
}
const accessToken = connection[0]?.settings?.access_token; 
---
This access token or api key can then be passed to the integration, either using their official SDK or their API directly. Access tokens or api keys are usually passed in the authorization header as a Bearer token but feel free to refer to the official documentation.
`

      return {
        language: 'javascript',
        template,
      }
    }),
})
