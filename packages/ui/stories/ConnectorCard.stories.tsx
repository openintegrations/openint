import React from 'react'
import {ConnectorCard} from '../components/ConnectorCard'

// Simple logo for the story
const SalesforceLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="36"
    height="36"
    fill="#1798c1">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
)

export default {
  title: 'UI/ConnectorCard',
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => (
  <ConnectorCard
    name="Salesforce"
    logo={<SalesforceLogo />}
    oauthType="oauth2"
    connectorType="CRM"
    releaseStage="GA"
    connectorVersion="V2"
    connectorAudience="B2B"
    onClick={() => console.log('clicked')}
  />
)

export const WithoutBadges = () => (
  <ConnectorCard
    name="Salesforce"
    logo={<SalesforceLogo />}
    onClick={() => console.log('clicked')}
  />
)

export const WithPartialBadges = () => (
  <ConnectorCard
    name="Salesforce"
    logo={<SalesforceLogo />}
    oauthType="oauth2"
    connectorType="CRM"
    onClick={() => console.log('clicked')}
  />
)
