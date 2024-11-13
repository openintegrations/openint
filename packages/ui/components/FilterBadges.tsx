import {X} from 'lucide-react'
import {Badge} from '../shadcn'
import {parseCategory} from '../utils'

export function FilterBadges({
  filters,
  onClick,
}: {
  filters: string[]
  onClick: (filter: string) => void
}) {
  return (
    <div
      className={`flex flex-row flex-wrap gap-2 border-b px-4 pt-0 ${
        filters.length > 0 ? 'pb-2' : ''
      }`}>
      {filters.map((filter) => (
        <Badge key={filter} variant="button">
          {parseCategory(filter)}
          <X className="ml-1 size-4" onClick={() => onClick(filter)} />
        </Badge>
      ))}
    </div>
  )
}
