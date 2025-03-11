import {X} from 'lucide-react'
import React from 'react'
import {Badge} from '../shadcn/Badge'
import {cn} from '../utils'

interface FilterBadgeProps {
  /**
   * The label text to display in the badge
   */
  label: string
  /**
   * Optional callback function when the remove button is clicked
   */
  onRemove?: () => void
  /**
   * Optional CSS class name
   */
  className?: string
}

const FilterBadge: React.FC<FilterBadgeProps> = ({
  label,
  onRemove,
  className,
  ...props
}) => {
  return (
    <Badge
      className={cn(
        'inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800',
        'border-0',
        className,
      )}
      {...props}>
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="relative top-[1px] ml-1.5 inline-flex items-center justify-center"
          aria-label={`Remove ${label} filter`}>
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}

export default FilterBadge
