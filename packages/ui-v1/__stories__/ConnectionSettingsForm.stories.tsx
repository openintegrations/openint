// generated file. Do not modify by hand

import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import type {ConnectorName} from '@openint/all-connectors/name'
import {Card} from '@openint/shadcn/ui'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'

function FormWrapper(props: {name: ConnectorName}) {
  const schemas = defConnectors[props.name].schemas
  if (!('connection_settings' in schemas)) {
    throw new Error(
      'Connector ' + props.name + ' does not have a connection_settings',
    )
  }

  return (
    <Card className="w-md p-4">
      <h1 className="text-lg font-bold">{props.name} connection_settings</h1>
      <hr />
      <JSONSchemaForm
        debugMode
        jsonSchema={zodToOas31Schema(schemas.connection_settings)}
      />
    </Card>
  )
}

const meta: Meta<typeof FormWrapper> = {
  title: 'All Connectors/connection_settings',
  component: FormWrapper,
  parameters: {layout: 'centered'},
}

export default meta
type Story = StoryObj<typeof meta>

export const dummyOauth2ConnectionSettings: Story = {
  args: {name: 'dummy-oauth2'},
}

export const sharepointonlineConnectionSettings: Story = {
  args: {name: 'sharepointonline'},
}

export const slackConnectionSettings: Story = {
  args: {name: 'slack'},
}

export const githubConnectionSettings: Story = {
  args: {name: 'github'},
}

export const quickbooksConnectionSettings: Story = {
  args: {name: 'quickbooks'},
}

export const googlemailConnectionSettings: Story = {
  args: {name: 'googlemail'},
}

export const notionConnectionSettings: Story = {
  args: {name: 'notion'},
}

export const linkedinConnectionSettings: Story = {
  args: {name: 'linkedin'},
}

export const googledocsConnectionSettings: Story = {
  args: {name: 'googledocs'},
}

export const aircallConnectionSettings: Story = {
  args: {name: 'aircall'},
}

export const googlecalendarConnectionSettings: Story = {
  args: {name: 'googlecalendar'},
}

export const googlesheetConnectionSettings: Story = {
  args: {name: 'googlesheet'},
}

export const discordConnectionSettings: Story = {
  args: {name: 'discord'},
}

export const hubspotConnectionSettings: Story = {
  args: {name: 'hubspot'},
}

export const salesforceConnectionSettings: Story = {
  args: {name: 'salesforce'},
}

export const linearConnectionSettings: Story = {
  args: {name: 'linear'},
}

export const confluenceConnectionSettings: Story = {
  args: {name: 'confluence'},
}

export const googledriveConnectionSettings: Story = {
  args: {name: 'googledrive'},
}

export const airtableConnectionSettings: Story = {
  args: {name: 'airtable'},
}

export const apolloConnectionSettings: Story = {
  args: {name: 'apollo'},
}

export const brexConnectionSettings: Story = {
  args: {name: 'brex'},
}

export const codaConnectionSettings: Story = {
  args: {name: 'coda'},
}

export const facebookConnectionSettings: Story = {
  args: {name: 'facebook'},
}

export const finchConnectionSettings: Story = {
  args: {name: 'finch'},
}

export const firebaseConnectionSettings: Story = {
  args: {name: 'firebase'},
}

export const foreceiptConnectionSettings: Story = {
  args: {name: 'foreceipt'},
}

export const gongConnectionSettings: Story = {
  args: {name: 'gong'},
}

export const greenhouseConnectionSettings: Story = {
  args: {name: 'greenhouse'},
}

export const instagramConnectionSettings: Story = {
  args: {name: 'instagram'},
}

export const intercomConnectionSettings: Story = {
  args: {name: 'intercom'},
}

export const jiraConnectionSettings: Story = {
  args: {name: 'jira'},
}

export const kustomerConnectionSettings: Story = {
  args: {name: 'kustomer'},
}

export const leverConnectionSettings: Story = {
  args: {name: 'lever'},
}

export const mergeConnectionSettings: Story = {
  args: {name: 'merge'},
}

export const microsoftConnectionSettings: Story = {
  args: {name: 'microsoft'},
}

export const onebrickConnectionSettings: Story = {
  args: {name: 'onebrick'},
}

export const outreachConnectionSettings: Story = {
  args: {name: 'outreach'},
}

export const pipedriveConnectionSettings: Story = {
  args: {name: 'pipedrive'},
}

export const plaidConnectionSettings: Story = {
  args: {name: 'plaid'},
}

export const postgresConnectionSettings: Story = {
  args: {name: 'postgres'},
}

export const rampConnectionSettings: Story = {
  args: {name: 'ramp'},
}

export const redditConnectionSettings: Story = {
  args: {name: 'reddit'},
}

export const salesloftConnectionSettings: Story = {
  args: {name: 'salesloft'},
}

export const saltedgeConnectionSettings: Story = {
  args: {name: 'saltedge'},
}

export const splitwiseConnectionSettings: Story = {
  args: {name: 'splitwise'},
}

export const stripeConnectionSettings: Story = {
  args: {name: 'stripe'},
}

export const tellerConnectionSettings: Story = {
  args: {name: 'teller'},
}

export const togglConnectionSettings: Story = {
  args: {name: 'toggl'},
}

export const twentyConnectionSettings: Story = {
  args: {name: 'twenty'},
}

export const twitterConnectionSettings: Story = {
  args: {name: 'twitter'},
}

export const venmoConnectionSettings: Story = {
  args: {name: 'venmo'},
}

export const wiseConnectionSettings: Story = {
  args: {name: 'wise'},
}

export const xeroConnectionSettings: Story = {
  args: {name: 'xero'},
}

export const yodleeConnectionSettings: Story = {
  args: {name: 'yodlee'},
}

export const zohodeskConnectionSettings: Story = {
  args: {name: 'zohodesk'},
}
