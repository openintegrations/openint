import React from 'react'
import {Search} from '../components/Search'

export default {
  title: 'UI/Search',
  component: Search,
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => <Search placeholder="Search..." />

export const Disabled = () => <Search placeholder="Search..." disabled />

export const WithCustomWidth = () => (
  <Search placeholder="Search..." className="w-[300px]" />
)
