import React from 'react'
import {Badge} from '../shadcn/Badge'

// Create a StatusBadge component that wraps Badge with status functionality
type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'disabled'

interface StatusBadgeProps {
  status: StatusType
  text?: string
}

const StatusBadge = ({status, text}: StatusBadgeProps) => {
  const statusConfig: Record<
    StatusType,
    {
      label: string
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
    }
  > = {
    success: {label: text || 'Success', variant: 'default'},
    error: {label: text || 'Error', variant: 'destructive'},
    warning: {label: text || 'Warning', variant: 'secondary'},
    info: {label: text || 'Info', variant: 'outline'},
    default: {label: text || 'Default', variant: 'default'},
    disabled: {label: text || 'Disabled', variant: 'outline'},
  }

  const {label, variant} = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

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

export const CustomText = () => (
  <StatusBadge status="success" text="Completed" />
)

export const AllVariants = () => (
  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
    <StatusBadge status="success" />
    <StatusBadge status="error" />
    <StatusBadge status="warning" />
    <StatusBadge status="info" />
    <StatusBadge status="default" />
    <StatusBadge status="disabled" />
  </div>
)
