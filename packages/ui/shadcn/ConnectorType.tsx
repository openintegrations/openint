import React from 'react'
import { Badge } from './Badge'
import { cn } from '../utils'

type VariantType = 'variant1' | 'variant2' | 'variant3' | 'variant4' | 'variant5' | 'default';
type VariantMapType = Record<VariantType, string>;

interface ConnectorTypeProps {
  variant?: VariantType;
  children?: React.ReactNode;
  className?: string;
}

const ConnectorType: React.FC<ConnectorTypeProps> = ({ 
  variant = 'default', 
  children = 'Badge', 
  ...props 
}) => {
  const variants: VariantMapType = {
    'default': 'bg-opacity-25 bg-green-500 text-green-600 hover:bg-green-500 hover:bg-opacity-40',
    'variant1': 'bg-opacity-25 bg-green-500 text-green-600 hover:bg-green-500 hover:bg-opacity-40',
    'variant2': 'bg-opacity-25 bg-blue-400 text-blue-500 hover:bg-blue-400 hover:bg-opacity-40',
    'variant3': 'bg-opacity-25 bg-red-400 text-red-500 hover:bg-red-400 hover:bg-opacity-40',
    'variant4': 'bg-opacity-25 bg-purple-400 text-purple-500 hover:bg-purple-400 hover:bg-opacity-40',
    'variant5': 'bg-opacity-25 bg-orange-400 text-orange-500 hover:bg-orange-400 hover:bg-opacity-40',
  }
  
  return (
    <Badge 
      className={cn(
        variants[variant], 
        'rounded-md border-0 font-medium', 
        props.className
      )} 
      {...props}
    >
      {children}
    </Badge>
  )
}

export default ConnectorType 