import React from 'react'
import ConnectorVersion from '../components/ConnectorVersion'

export default {
  title: 'UI/Badges/ConnectorVersion',
  component: ConnectorVersion,
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => <ConnectorVersion>Badge</ConnectorVersion>

export const Variant1 = () => (
  <ConnectorVersion variant="variant1">Variant 1</ConnectorVersion>
)

export const Variant2 = () => (
  <ConnectorVersion variant="variant2">Variant 2</ConnectorVersion>
)

export const Variant3 = () => (
  <ConnectorVersion variant="variant3">Variant 3</ConnectorVersion>
)

export const Variant4 = () => (
  <ConnectorVersion variant="variant4">Variant 4</ConnectorVersion>
)

export const Variant5 = () => (
  <ConnectorVersion variant="variant5">Variant 5</ConnectorVersion>
)
