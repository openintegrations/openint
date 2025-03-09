import React from 'react'
import {cn} from '../utils'

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({className, label, description, error, ...props}, ref) => {
    return (
      <div className="field-container space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
Field.displayName = 'Field'

export {Field} 