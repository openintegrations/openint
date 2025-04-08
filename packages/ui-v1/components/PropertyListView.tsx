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
}

export function PropertyListView({
  properties,
  className,
  ...props
}: PropertyListViewProps) {
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
