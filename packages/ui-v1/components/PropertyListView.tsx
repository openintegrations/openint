import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'

export interface PropertyItem {
  /**
   * The title or label of the property
   */
  title: string
  /**
   * The value or content of the property
   */
  value: React.ReactNode
  /**
   * Whether this property contains a CopyID component
   */
  isCopyID?: boolean
}

interface PropertyListViewProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The properties to display
   */
  properties: PropertyItem[]
  /**
   * Optional className for styling
   */
  className?: string
  /**
   * Whether to use modern styling with uppercase labels and grid layout
   */
  modern?: boolean
}

export function PropertyListView({
  properties,
  className,
  modern = false,
  ...props
}: PropertyListViewProps) {
  if (modern) {
    return (
      <div className={cn('grid grid-cols-1 gap-4', className)} {...props}>
        {properties.map((property, index) => (
          <div key={index}>
            <div className="mb-1 text-xs font-medium uppercase text-gray-500">
              {property.title}
            </div>
            <div
              className={cn(
                'text-sm font-medium text-gray-700',
                property.isCopyID ? '' : 'rounded-md bg-gray-50 px-3 py-1.5',
              )}>
              {property.value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Original styling
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {properties.map((property, index) => (
        <div
          key={index}
          className={cn(
            'flex gap-4',
            property.isCopyID ? 'items-center' : 'items-start justify-between',
          )}>
          <div className="text-sm font-medium text-gray-700">
            {property.title}
          </div>
          <div
            className={cn(
              'text-sm text-gray-500',
              property.isCopyID ? 'flex-1' : 'text-right',
            )}>
            {property.value}
          </div>
        </div>
      ))}
    </div>
  )
}
