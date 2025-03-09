import React from 'react'
import { Badge } from './Badge'
import { cn } from '../utils'

type VariantType = 'variant1' | 'variant2' | 'variant3' | 'variant4' | 'variant5' | 'default';
type VariantMapType = Record<VariantType, string>;

interface OAuthLabelTypeProps {
  variant?: VariantType;
  children?: React.ReactNode;
  className?: string;
}

const OAuthLabelType: React.FC<OAuthLabelTypeProps> = ({ 
  variant = 'default', 
  children = 'Badge', 
  ...props 
}) => {
  const variants: VariantMapType = {
    'default': 'bg-opacity-25 bg-red-500 text-red-600 hover:bg-red-500 hover:bg-opacity-40',
    'variant1': 'bg-opacity-25 bg-red-500 text-red-600 hover:bg-red-500 hover:bg-opacity-40',
    'variant2': 'bg-opacity-25 bg-orange-500 text-orange-600 hover:bg-orange-500 hover:bg-opacity-40',
    'variant3': 'bg-opacity-25 bg-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:bg-opacity-40',
    'variant4': 'bg-opacity-25 bg-blue-500 text-blue-600 hover:bg-blue-500 hover:bg-opacity-40',
    'variant5': 'bg-opacity-25 bg-purple-500 text-purple-600 hover:bg-purple-500 hover:bg-opacity-40',
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

export default OAuthLabelType 