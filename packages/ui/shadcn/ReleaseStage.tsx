import React from 'react'
import { Badge } from './Badge'
import { cn } from '../utils'

type VariantType = 'variant1' | 'variant2' | 'variant3' | 'variant4' | 'variant5' | 'default';
type VariantMapType = Record<VariantType, string>;

interface ReleaseStageProps {
  variant?: VariantType;
  children?: React.ReactNode;
  className?: string;
}

const ReleaseStage: React.FC<ReleaseStageProps> = ({ 
  variant = 'default', 
  children = 'Badge', 
  ...props 
}) => {
  const variants: VariantMapType = {
    'default': 'bg-opacity-25 bg-pink-500 text-pink-600 hover:bg-pink-500 hover:bg-opacity-40',
    'variant1': 'bg-opacity-25 bg-pink-500 text-pink-600 hover:bg-pink-500 hover:bg-opacity-40',
    'variant2': 'bg-opacity-25 bg-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:bg-opacity-40',
    'variant3': 'bg-opacity-25 bg-teal-500 text-teal-600 hover:bg-teal-500 hover:bg-opacity-40',
    'variant4': 'bg-opacity-25 bg-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:bg-opacity-40',
    'variant5': 'bg-opacity-25 bg-rose-500 text-rose-600 hover:bg-rose-500 hover:bg-opacity-40',
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

export default ReleaseStage 