// generated file. Do not modify by hand

import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import type {ConnectorName} from '@openint/all-connectors/name'
import {Card} from '@openint/shadcn/ui'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'

function FormWrapper(props: {name: ConnectorName}) {
  const schemas = defConnectors[props.name].schemas
  if (!('connectorConfig' in schemas)) {
    throw new Error(
      'Connector ' + props.name + ' does not have a connectorConfig',
    )
  }

  return (
    <Card className="w-md p-4">
      <h1 className="text-lg font-bold">{props.name} connectorConfig</h1>
      <hr />
      <JSONSchemaForm
        debugMode
        jsonSchema={zodToOas31Schema(schemas.connectorConfig)}
      />
    </Card>
  )
}

const meta: Meta<typeof FormWrapper> = {
  title: 'All Connectors/connectorConfig',
  component: FormWrapper,
  parameters: {layout: 'centered'},
}

export default meta
type Story = StoryObj<typeof meta>

export const aircallConnectorConfig: Story = {
  args: {name: 'aircall'},
}

export const brexConnectorConfig: Story = {
  args: {name: 'brex'},
}

export const confluenceConnectorConfig: Story = {
  args: {name: 'confluence'},
}

export const discordConnectorConfig: Story = {
  args: {name: 'discord'},
}

export const facebookConnectorConfig: Story = {
  args: {name: 'facebook'},
}

export const finchConnectorConfig: Story = {
  args: {name: 'finch'},
}

export const githubConnectorConfig: Story = {
  args: {name: 'github'},
}

export const gongConnectorConfig: Story = {
  args: {name: 'gong'},
}

export const googlecalendarConnectorConfig: Story = {
  args: {name: 'googlecalendar'},
}

export const googledocsConnectorConfig: Story = {
  args: {name: 'googledocs'},
}

export const googledriveConnectorConfig: Story = {
  args: {name: 'googledrive'},
}

export const googlemailConnectorConfig: Story = {
  args: {name: 'googlemail'},
}

export const googlesheetConnectorConfig: Story = {
  args: {name: 'googlesheet'},
}

export const heronConnectorConfig: Story = {
  args: {name: 'heron'},
}

export const hubspotConnectorConfig: Story = {
  args: {name: 'hubspot'},
}

export const instagramConnectorConfig: Story = {
  args: {name: 'instagram'},
}

export const intercomConnectorConfig: Story = {
  args: {name: 'intercom'},
}

export const jiraConnectorConfig: Story = {
  args: {name: 'jira'},
}

export const kustomerConnectorConfig: Story = {
  args: {name: 'kustomer'},
}

export const leverConnectorConfig: Story = {
  args: {name: 'lever'},
}

export const linearConnectorConfig: Story = {
  args: {name: 'linear'},
}

export const linkedinConnectorConfig: Story = {
  args: {name: 'linkedin'},
}

export const lunchmoneyConnectorConfig: Story = {
  args: {name: 'lunchmoney'},
}

export const mercuryConnectorConfig: Story = {
  args: {name: 'mercury'},
}

export const mergeConnectorConfig: Story = {
  args: {name: 'merge'},
}

export const microsoftConnectorConfig: Story = {
  args: {name: 'microsoft'},
}

export const mootaConnectorConfig: Story = {
  args: {name: 'moota'},
}

export const notionConnectorConfig: Story = {
  args: {name: 'notion'},
}

export const onebrickConnectorConfig: Story = {
  args: {name: 'onebrick'},
}

export const outreachConnectorConfig: Story = {
  args: {name: 'outreach'},
}

export const pipedriveConnectorConfig: Story = {
  args: {name: 'pipedrive'},
}

export const plaidConnectorConfig: Story = {
  args: {name: 'plaid'},
}

export const quickbooksConnectorConfig: Story = {
  args: {name: 'quickbooks'},
}

export const rampConnectorConfig: Story = {
  args: {name: 'ramp'},
}

export const redditConnectorConfig: Story = {
  args: {name: 'reddit'},
}

export const salesforceConnectorConfig: Story = {
  args: {name: 'salesforce'},
}

export const salesloftConnectorConfig: Story = {
  args: {name: 'salesloft'},
}

export const saltedgeConnectorConfig: Story = {
  args: {name: 'saltedge'},
}

export const sharepointonlineConnectorConfig: Story = {
  args: {name: 'sharepointonline'},
}

export const slackConnectorConfig: Story = {
  args: {name: 'slack'},
}

export const stripeConnectorConfig: Story = {
  args: {name: 'stripe'},
}

export const tellerConnectorConfig: Story = {
  args: {name: 'teller'},
}

export const twitterConnectorConfig: Story = {
  args: {name: 'twitter'},
}

export const venmoConnectorConfig: Story = {
  args: {name: 'venmo'},
}

export const xeroConnectorConfig: Story = {
  args: {name: 'xero'},
}

export const yodleeConnectorConfig: Story = {
  args: {name: 'yodlee'},
}

export const zohodeskConnectorConfig: Story = {
  args: {name: 'zohodesk'},
}
