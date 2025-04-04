// generated file. Do not modify by hand

import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {Card} from '@openint/shadcn/ui'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'

const meta: Meta<typeof JSONSchemaForm> = {
  title: 'All Connectors/ConnectorConfigForm',
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

export const aircallConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['aircall'].schemas.connectorConfig,
    ),
  },
}

export const brexConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(defConnectors['brex'].schemas.connectorConfig),
  },
}

export const confluenceConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['confluence'].schemas.connectorConfig,
    ),
  },
}

export const discordConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['discord'].schemas.connectorConfig,
    ),
  },
}

export const facebookConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['facebook'].schemas.connectorConfig,
    ),
  },
}

export const finchConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['finch'].schemas.connectorConfig,
    ),
  },
}

export const githubConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['github'].schemas.connectorConfig,
    ),
  },
}

export const gongConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(defConnectors['gong'].schemas.connectorConfig),
  },
}

export const googlecalendarConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googlecalendar'].schemas.connectorConfig,
    ),
  },
}

export const googledocsConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googledocs'].schemas.connectorConfig,
    ),
  },
}

export const googledriveConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googledrive'].schemas.connectorConfig,
    ),
  },
}

export const googlemailConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googlemail'].schemas.connectorConfig,
    ),
  },
}

export const googlesheetConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['googlesheet'].schemas.connectorConfig,
    ),
  },
}

export const heronConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['heron'].schemas.connectorConfig,
    ),
  },
}

export const hubspotConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['hubspot'].schemas.connectorConfig,
    ),
  },
}

export const instagramConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['instagram'].schemas.connectorConfig,
    ),
  },
}

export const intercomConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['intercom'].schemas.connectorConfig,
    ),
  },
}

export const jiraConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(defConnectors['jira'].schemas.connectorConfig),
  },
}

export const kustomerConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['kustomer'].schemas.connectorConfig,
    ),
  },
}

export const leverConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['lever'].schemas.connectorConfig,
    ),
  },
}

export const linearConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['linear'].schemas.connectorConfig,
    ),
  },
}

export const linkedinConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['linkedin'].schemas.connectorConfig,
    ),
  },
}

export const lunchmoneyConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['lunchmoney'].schemas.connectorConfig,
    ),
  },
}

export const mercuryConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['mercury'].schemas.connectorConfig,
    ),
  },
}

export const mergeConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['merge'].schemas.connectorConfig,
    ),
  },
}

export const microsoftConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['microsoft'].schemas.connectorConfig,
    ),
  },
}

export const mootaConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['moota'].schemas.connectorConfig,
    ),
  },
}

export const notionConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['notion'].schemas.connectorConfig,
    ),
  },
}

export const onebrickConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['onebrick'].schemas.connectorConfig,
    ),
  },
}

export const outreachConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['outreach'].schemas.connectorConfig,
    ),
  },
}

export const pipedriveConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['pipedrive'].schemas.connectorConfig,
    ),
  },
}

export const plaidConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['plaid'].schemas.connectorConfig,
    ),
  },
}

export const quickbooksConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['quickbooks'].schemas.connectorConfig,
    ),
  },
}

export const rampConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(defConnectors['ramp'].schemas.connectorConfig),
  },
}

export const redditConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['reddit'].schemas.connectorConfig,
    ),
  },
}

export const salesforceConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['salesforce'].schemas.connectorConfig,
    ),
  },
}

export const salesloftConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['salesloft'].schemas.connectorConfig,
    ),
  },
}

export const saltedgeConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['saltedge'].schemas.connectorConfig,
    ),
  },
}

export const sharepointonlineConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['sharepointonline'].schemas.connectorConfig,
    ),
  },
}

export const slackConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['slack'].schemas.connectorConfig,
    ),
  },
}

export const stripeConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['stripe'].schemas.connectorConfig,
    ),
  },
}

export const tellerConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['teller'].schemas.connectorConfig,
    ),
  },
}

export const twitterConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['twitter'].schemas.connectorConfig,
    ),
  },
}

export const venmoConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['venmo'].schemas.connectorConfig,
    ),
  },
}

export const xeroConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(defConnectors['xero'].schemas.connectorConfig),
  },
}

export const yodleeConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['yodlee'].schemas.connectorConfig,
    ),
  },
}

export const zohodeskConnectorConfig: Story = {
  args: {
    jsonSchema: zodToOas31Schema(
      defConnectors['zohodesk'].schemas.connectorConfig,
    ),
  },
}
