// generated file. Do not modify by hand

// Generated by generateConnectorStories.ts
import type {ConnectorName} from '@openint/all-connectors/name'
import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {getConnectorModel} from '@openint/api-v1/models'
import {ConnectorCard} from '../domain-components/ConnectorCard'

function StoryWrapper(props: {name: ConnectorName}) {
  const def = defConnectors[props.name]
  if (!def) {
    throw new Error('Connector ' + props.name + ' not found')
  }
  const connector = getConnectorModel(def, {
    includeSchemas: true,
  })

  return <ConnectorCard connector={connector} />
}

const meta: Meta<typeof StoryWrapper> = {
  title: 'All Connectors/connector',
  component: StoryWrapper,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const acmeOauth2ConnectorCard: Story = {
  args: {name: 'acme-oauth2'},
}

export const sharepointonlineConnectorCard: Story = {
  args: {name: 'sharepointonline'},
}

export const slackConnectorCard: Story = {
  args: {name: 'slack'},
}

export const githubConnectorCard: Story = {
  args: {name: 'github'},
}

export const quickbooksConnectorCard: Story = {
  args: {name: 'quickbooks'},
}

export const googlemailConnectorCard: Story = {
  args: {name: 'googlemail'},
}

export const notionConnectorCard: Story = {
  args: {name: 'notion'},
}

export const linkedinConnectorCard: Story = {
  args: {name: 'linkedin'},
}

export const googledocsConnectorCard: Story = {
  args: {name: 'googledocs'},
}

export const aircallConnectorCard: Story = {
  args: {name: 'aircall'},
}

export const googlecalendarConnectorCard: Story = {
  args: {name: 'googlecalendar'},
}

export const googlesheetConnectorCard: Story = {
  args: {name: 'googlesheet'},
}

export const discordConnectorCard: Story = {
  args: {name: 'discord'},
}

export const hubspotConnectorCard: Story = {
  args: {name: 'hubspot'},
}

export const salesforceConnectorCard: Story = {
  args: {name: 'salesforce'},
}

export const linearConnectorCard: Story = {
  args: {name: 'linear'},
}

export const confluenceConnectorCard: Story = {
  args: {name: 'confluence'},
}

export const googledriveConnectorCard: Story = {
  args: {name: 'googledrive'},
}

export const airtableConnectorCard: Story = {
  args: {name: 'airtable'},
}

export const apolloConnectorCard: Story = {
  args: {name: 'apollo'},
}

export const brexConnectorCard: Story = {
  args: {name: 'brex'},
}

export const codaConnectorCard: Story = {
  args: {name: 'coda'},
}

export const finchConnectorCard: Story = {
  args: {name: 'finch'},
}

export const firebaseConnectorCard: Story = {
  args: {name: 'firebase'},
}

export const foreceiptConnectorCard: Story = {
  args: {name: 'foreceipt'},
}

export const greenhouseConnectorCard: Story = {
  args: {name: 'greenhouse'},
}

export const heronConnectorCard: Story = {
  args: {name: 'heron'},
}

export const lunchmoneyConnectorCard: Story = {
  args: {name: 'lunchmoney'},
}

export const mercuryConnectorCard: Story = {
  args: {name: 'mercury'},
}

export const mergeConnectorCard: Story = {
  args: {name: 'merge'},
}

export const mootaConnectorCard: Story = {
  args: {name: 'moota'},
}

export const onebrickConnectorCard: Story = {
  args: {name: 'onebrick'},
}

export const plaidConnectorCard: Story = {
  args: {name: 'plaid'},
}

export const postgresConnectorCard: Story = {
  args: {name: 'postgres'},
}

export const rampConnectorCard: Story = {
  args: {name: 'ramp'},
}

export const saltedgeConnectorCard: Story = {
  args: {name: 'saltedge'},
}

export const splitwiseConnectorCard: Story = {
  args: {name: 'splitwise'},
}

export const stripeConnectorCard: Story = {
  args: {name: 'stripe'},
}

export const tellerConnectorCard: Story = {
  args: {name: 'teller'},
}

export const togglConnectorCard: Story = {
  args: {name: 'toggl'},
}

export const twentyConnectorCard: Story = {
  args: {name: 'twenty'},
}

export const venmoConnectorCard: Story = {
  args: {name: 'venmo'},
}

export const wiseConnectorCard: Story = {
  args: {name: 'wise'},
}

export const yodleeConnectorCard: Story = {
  args: {name: 'yodlee'},
}
