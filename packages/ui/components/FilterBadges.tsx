import React from 'react'
import {X} from 'lucide-react'
import {parseCategory} from '../utils'

interface FilterBadgesProps {
  filters: string[]
  onClick: (filter: string) => void
}

export function FilterBadges({ filters, onClick }: FilterBadgesProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <div
          key={filter}
          className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800"
        >
          {parseCategory(filter)}
          <button
            onClick={() => onClick(filter)}
            className="ml-1.5 inline-flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
