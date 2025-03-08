import React from 'react'
import { Button as ShadcnButton } from '../shadcn/Button'
import { cn } from '../utils'

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  asChild = false,
  ...props
}: ButtonProps) {
  // Filter out 'icon' size as it's not supported by ShadcnButton
  const buttonSize = size === 'icon' ? 'sm' : size
  
  return (
    <ShadcnButton
      variant={variant}
      size={buttonSize as 'default' | 'sm' | 'lg'}
      className={cn(className, size === 'icon' ? 'p-2 h-10 w-10' : '')}
      {...props}
    />
  )
}

export default Button 