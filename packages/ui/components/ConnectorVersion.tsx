import React from 'react'
import {Badge} from '../shadcn/Badge'
import {cn} from '../utils'

type VariantType =
  | 'variant1'
  | 'variant2'
  | 'variant3'
  | 'variant4'
  | 'variant5'
  | 'default'
type VariantMapType = Record<VariantType, string>

interface ConnectorVersionProps {
  variant?: VariantType
  children?: React.ReactNode
  className?: string
}

const ConnectorVersion: React.FC<ConnectorVersionProps> = ({
  variant = 'default',
  children = 'Badge',
  ...props
}) => {
  const variants: VariantMapType = {
    default:
      'bg-opacity-25 bg-lime-500 text-lime-600 hover:bg-lime-500 hover:bg-opacity-40',
    variant1:
      'bg-opacity-25 bg-lime-500 text-lime-600 hover:bg-lime-500 hover:bg-opacity-40',
    variant2:
      'bg-opacity-25 bg-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:bg-opacity-40',
    variant3:
      'bg-opacity-25 bg-fuchsia-500 text-fuchsia-600 hover:bg-fuchsia-500 hover:bg-opacity-40',
    variant4:
      'bg-opacity-25 bg-amber-500 text-amber-600 hover:bg-amber-500 hover:bg-opacity-40',
    variant5:
      'bg-opacity-25 bg-sky-500 text-sky-600 hover:bg-sky-500 hover:bg-opacity-40',
  }

  return (
    <Badge
      className={cn(
        variants[variant],
        'rounded-md border-0 font-medium',
        props.className,
      )}
      {...props}>
      {children}
    </Badge>
  )
}

export default ConnectorVersion
