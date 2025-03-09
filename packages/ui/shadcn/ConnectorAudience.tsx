import React from 'react'
import { Badge } from './Badge'
import { cn } from '../utils'

type VariantType = 'variant1' | 'variant2' | 'variant3' | 'variant4' | 'variant5' | 'default';
type VariantMapType = Record<VariantType, string>;

interface ConnectorAudienceProps {
  variant?: VariantType;
  children?: React.ReactNode;
  className?: string;
}

const ConnectorAudience: React.FC<ConnectorAudienceProps> = ({ 
  variant = 'default', 
  children = 'Badge', 
  ...props 
}) => {
  const variants: VariantMapType = {
    'default': 'bg-opacity-25 bg-violet-500 text-violet-600 hover:bg-violet-500 hover:bg-opacity-40',
    'variant1': 'bg-opacity-25 bg-violet-500 text-violet-600 hover:bg-violet-500 hover:bg-opacity-40',
    'variant2': 'bg-opacity-25 bg-slate-500 text-slate-600 hover:bg-slate-500 hover:bg-opacity-40',
    'variant3': 'bg-opacity-25 bg-stone-500 text-stone-600 hover:bg-stone-500 hover:bg-opacity-40',
    'variant4': 'bg-opacity-25 bg-neutral-500 text-neutral-600 hover:bg-neutral-500 hover:bg-opacity-40',
    'variant5': 'bg-opacity-25 bg-zinc-500 text-zinc-600 hover:bg-zinc-500 hover:bg-opacity-40',
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

export default ConnectorAudience 