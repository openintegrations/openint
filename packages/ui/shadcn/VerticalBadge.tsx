import React from 'react'
import { Badge } from './Badge'
import { cn } from '../utils'
import {VERTICAL_BY_KEY, VerticalKey} from '@openint/cdk';

interface VerticalBadge {
  vertical: VerticalKey;
  className?: string;
}

const VerticalBadge: React.FC<VerticalBadge> = ({ 
  vertical,
  className,
}) => {
  
  return (
    <Badge 
      className={cn( 
        'bg-opacity-25 bg-gray-500 text-gray-600 hover:bg-green-500 hover:bg-opacity-40',
        'rounded-md border-0 font-medium', 
        className
      )} 
    >
      {VERTICAL_BY_KEY[vertical].name}
    </Badge>
  )
}

export default VerticalBadge 