import React from 'react'
import StatusBadge from './StatusBadge'

export default {
  title: 'UI/Badges/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
}

export const Success = () => <StatusBadge status="success" />

export const Error = () => <StatusBadge status="error" />

export const Warning = () => <StatusBadge status="warning" />

export const Info = () => <StatusBadge status="info" />

export const Default = () => <StatusBadge status="default" />

export const Disabled = () => <StatusBadge status="disabled" />

export const CustomText = () => <StatusBadge status="success" text="Completed" />

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    <StatusBadge status="success" />
    <StatusBadge status="error" />
    <StatusBadge status="warning" />
    <StatusBadge status="info" />
    <StatusBadge status="default" />
    <StatusBadge status="disabled" />
  </div>
) 