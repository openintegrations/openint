// generated file. Do not modify by hand

import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {Card} from '@openint/shadcn/ui'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'

const meta: Meta<typeof JSONSchemaForm> = {
  title: 'All Connectors/ConnectionSettingsForm',
  component: JSONSchemaForm,
  parameters: {layout: 'centered'},
  decorators: [
    (Story) => (
      <Card className="max-w-lg p-4">
        <Story />
      </Card>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const aircallConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['aircall'].schemas.connectionSettings,
    ),
  },
}

export const airtableConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['airtable'].schemas.connectionSettings,
    ),
  },
}

export const apolloConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['apollo'].schemas.connectionSettings,
    ),
  },
}

export const brexConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['brex'].schemas.connectionSettings,
    ),
  },
}

export const codaConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['coda'].schemas.connectionSettings,
    ),
  },
}

export const confluenceConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['confluence'].schemas.connectionSettings,
    ),
  },
}

export const discordConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['discord'].schemas.connectionSettings,
    ),
  },
}

export const facebookConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['facebook'].schemas.connectionSettings,
    ),
  },
}

export const finchConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['finch'].schemas.connectionSettings,
    ),
  },
}

export const firebaseConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['firebase'].schemas.connectionSettings,
    ),
  },
}

export const foreceiptConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['foreceipt'].schemas.connectionSettings,
    ),
  },
}

export const githubConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['github'].schemas.connectionSettings,
    ),
  },
}

export const gongConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['gong'].schemas.connectionSettings,
    ),
  },
}

export const googlecalendarConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googlecalendar'].schemas.connectionSettings,
    ),
  },
}

export const googledocsConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googledocs'].schemas.connectionSettings,
    ),
  },
}

export const googledriveConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googledrive'].schemas.connectionSettings,
    ),
  },
}

export const googlemailConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googlemail'].schemas.connectionSettings,
    ),
  },
}

export const googlesheetConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googlesheet'].schemas.connectionSettings,
    ),
  },
}

export const greenhouseConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['greenhouse'].schemas.connectionSettings,
    ),
  },
}

export const hubspotConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['hubspot'].schemas.connectionSettings,
    ),
  },
}

export const instagramConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['instagram'].schemas.connectionSettings,
    ),
  },
}

export const intercomConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['intercom'].schemas.connectionSettings,
    ),
  },
}

export const jiraConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['jira'].schemas.connectionSettings,
    ),
  },
}

export const kustomerConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['kustomer'].schemas.connectionSettings,
    ),
  },
}

export const leverConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['lever'].schemas.connectionSettings,
    ),
  },
}

export const linearConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['linear'].schemas.connectionSettings,
    ),
  },
}

export const linkedinConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['linkedin'].schemas.connectionSettings,
    ),
  },
}

export const mergeConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['merge'].schemas.connectionSettings,
    ),
  },
}

export const microsoftConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['microsoft'].schemas.connectionSettings,
    ),
  },
}

export const notionConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['notion'].schemas.connectionSettings,
    ),
  },
}

export const onebrickConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['onebrick'].schemas.connectionSettings,
    ),
  },
}

export const outreachConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['outreach'].schemas.connectionSettings,
    ),
  },
}

export const pipedriveConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['pipedrive'].schemas.connectionSettings,
    ),
  },
}

export const plaidConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['plaid'].schemas.connectionSettings,
    ),
  },
}

export const postgresConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['postgres'].schemas.connectionSettings,
    ),
  },
}

export const quickbooksConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['quickbooks'].schemas.connectionSettings,
    ),
  },
}

export const rampConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['ramp'].schemas.connectionSettings,
    ),
  },
}

export const redditConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['reddit'].schemas.connectionSettings,
    ),
  },
}

export const salesforceConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['salesforce'].schemas.connectionSettings,
    ),
  },
}

export const salesloftConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['salesloft'].schemas.connectionSettings,
    ),
  },
}

export const saltedgeConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['saltedge'].schemas.connectionSettings,
    ),
  },
}

export const sharepointonlineConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['sharepointonline'].schemas.connectionSettings,
    ),
  },
}

export const slackConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['slack'].schemas.connectionSettings,
    ),
  },
}

export const splitwiseConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['splitwise'].schemas.connectionSettings,
    ),
  },
}

export const stripeConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['stripe'].schemas.connectionSettings,
    ),
  },
}

export const tellerConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['teller'].schemas.connectionSettings,
    ),
  },
}

export const togglConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['toggl'].schemas.connectionSettings,
    ),
  },
}

export const twentyConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['twenty'].schemas.connectionSettings,
    ),
  },
}

export const twitterConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['twitter'].schemas.connectionSettings,
    ),
  },
}

export const venmoConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['venmo'].schemas.connectionSettings,
    ),
  },
}

export const wiseConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['wise'].schemas.connectionSettings,
    ),
  },
}

export const xeroConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['xero'].schemas.connectionSettings,
    ),
  },
}

export const yodleeConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['yodlee'].schemas.connectionSettings,
    ),
  },
}

export const zohodeskConnectionSettings: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['zohodesk'].schemas.connectionSettings,
    ),
  },
}
