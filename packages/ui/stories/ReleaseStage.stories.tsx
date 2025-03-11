import React from 'react'
import ReleaseStage from '../components/ReleaseStage'

export default {
  title: 'UI/Badges/ReleaseStage',
  component: ReleaseStage,
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => <ReleaseStage>Badge</ReleaseStage>

export const Variant1 = () => (
  <ReleaseStage variant="variant1">Variant 1</ReleaseStage>
)

export const Variant2 = () => (
  <ReleaseStage variant="variant2">Variant 2</ReleaseStage>
)

export const Variant3 = () => (
  <ReleaseStage variant="variant3">Variant 3</ReleaseStage>
)

export const Variant4 = () => (
  <ReleaseStage variant="variant4">Variant 4</ReleaseStage>
)

export const Variant5 = () => (
  <ReleaseStage variant="variant5">Variant 5</ReleaseStage>
)
