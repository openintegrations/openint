import React from 'react'
import ConnectorAudience from '../components/ConnectorAudience'

export default {
  title: 'UI/Badges/ConnectorAudience',
  component: ConnectorAudience,
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => <ConnectorAudience>Badge</ConnectorAudience>

export const Variant1 = () => (
  <ConnectorAudience variant="variant1">Variant 1</ConnectorAudience>
)

export const Variant2 = () => (
  <ConnectorAudience variant="variant2">Variant 2</ConnectorAudience>
)

export const Variant3 = () => (
  <ConnectorAudience variant="variant3">Variant 3</ConnectorAudience>
)

export const Variant4 = () => (
  <ConnectorAudience variant="variant4">Variant 4</ConnectorAudience>
)

export const Variant5 = () => (
  <ConnectorAudience variant="variant5">Variant 5</ConnectorAudience>
)
