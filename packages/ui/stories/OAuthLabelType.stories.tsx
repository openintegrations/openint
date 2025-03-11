import React from 'react'
import OAuthLabelType from '../components/OAuthLabelType'

export default {
  title: 'UI/Badges/OAuthLabelType',
  component: OAuthLabelType,
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => <OAuthLabelType>Badge</OAuthLabelType>

export const Variant1 = () => (
  <OAuthLabelType variant="variant1">Variant 1</OAuthLabelType>
)

export const Variant2 = () => (
  <OAuthLabelType variant="variant2">Variant 2</OAuthLabelType>
)

export const Variant3 = () => (
  <OAuthLabelType variant="variant3">Variant 3</OAuthLabelType>
)

export const Variant4 = () => (
  <OAuthLabelType variant="variant4">Variant 4</OAuthLabelType>
)

export const Variant5 = () => (
  <OAuthLabelType variant="variant5">Variant 5</OAuthLabelType>
)
