import React from 'react'
import { cn } from '../utils'
import { Search as SearchIcon } from 'lucide-react'

export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn("relative", containerClassName)}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  ),
)
Search.displayName = 'Search'

export { Search } 