'use client'

import type {FC, ReactNode} from 'react'

import {Check, Info, Search, X} from 'lucide-react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@openint/shadcn/ui'

interface ScopeLookup {
  scope: string
  display_name: string
  description: string
}

interface ConnectorScopesProps {
  availableScopes?: string[]
  editable?: boolean
  className?: string
  children?: ReactNode
  hideCustomInput?: boolean
  onRemoveScope?: (scope: string) => void
  onAddScope?: (scope: string) => void
  onClearAllScopes?: () => void
  scopeLookup?: Record<string, ScopeLookup>
  scopes: string[]
  maxVisible?: number
}

const RequestLink: FC<{className?: string}> = ({className}) => (
  <div
    className={cn(
      'text-muted-foreground flex items-center text-xs',
      className,
    )}>
    <Info className="mr-1 size-3" />
    <span>Need new scopes?</span>
    <a
      href="https://cal.com/ap-openint/discovery"
      className="ml-1 text-blue-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer">
      Request Scopes
    </a>
  </div>
)

const ScopeTooltip = ({
  scope,
  scopeLookup,
  children,
}: {
  scope: string
  scopeLookup?: Record<string, ScopeLookup>
  children: ReactNode
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Tooltip open={isHovered}>
      <TooltipTrigger asChild>
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {scopeLookup && scopeLookup[scope] ? (
          <div className="max-w-xs">
            <p className="mb-1 font-medium">
              {scopeLookup[scope].display_name || scope}
            </p>
            <p className="text-xs">{scopeLookup[scope].description}</p>
          </div>
        ) : (
          scope
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export function ConnectorScopes({
  availableScopes = [],
  children,
  className,
  editable = false,
  hideCustomInput = false,
  onRemoveScope,
  onAddScope,
  onClearAllScopes,
  scopeLookup,
  scopes,
  maxVisible = 8,
}: ConnectorScopesProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredScope, setHoveredScope] = useState<string | null>(null)

  useEffect(() => {
    if (hideCustomInput) {
      setSearchQuery('')
    }
  }, [hideCustomInput])

  // Reset hovered scope when popover closes
  useEffect(() => {
    if (!isPopoverOpen) {
      setHoveredScope(null)
    }
  }, [isPopoverOpen])

  const handleRemoveScope = useCallback(
    (scope: string) => {
      onRemoveScope?.(scope)
    },
    [onRemoveScope],
  )

  const handleAddScope = useCallback(
    (scope: string) => {
      onAddScope?.(scope)
    },
    [onAddScope],
  )

  const isScopeAdded = useCallback(
    (scope: string) => scopes.includes(scope),
    [scopes],
  )

  const handleToggleScope = useCallback(
    (scope: string) => {
      isScopeAdded(scope) ? handleRemoveScope(scope) : handleAddScope(scope)
    },
    [isScopeAdded, handleRemoveScope, handleAddScope],
  )

  const handleAddCustomScope = useCallback(() => {
    if (searchQuery && searchQuery.trim() && onAddScope) {
      onAddScope(searchQuery.trim())
      setSearchQuery('')
    }
  }, [searchQuery, onAddScope])

  const filteredScopes = useMemo(() => {
    if (hideCustomInput || !searchQuery.trim()) {
      return availableScopes
    } else {
      const query = searchQuery.trim().toLowerCase()
      return availableScopes.filter((scope) =>
        scope.toLowerCase().includes(query),
      )
    }
  }, [availableScopes, searchQuery, hideCustomInput])

  const visibleScopes = scopes.slice(0, maxVisible)
  const hiddenScopesCount = scopes.length - maxVisible
  const hasHiddenScopes = hiddenScopesCount > 0

  const handleClearAllScopes = useCallback(() => {
    if (onClearAllScopes) {
      onClearAllScopes()
    }
  }, [onClearAllScopes])

  const renderScopeBadge = (scope: string) => {
    // Determine if the scope is a URL (starts with http:// or https://)
    const isUrl = /^https?:\/\//.test(scope)

    // Format the display text with more aggressive truncation
    const displayText = () => {
      // For URLs, show domain plus minimal path info
      if (isUrl) {
        try {
          const url = new URL(scope)
          const domain = url.hostname.replace(/^www\./, '')

          // For googleapis.com URLs, extract the service name
          if (domain.includes('googleapis.com')) {
            // Extract service name (e.g., gmail, sheets, etc.)
            const parts = url.pathname.split('/')
            const service = parts.length > 1 ? parts[1] : ''
            return service ? `${service}:${parts[2] || ''}` : domain
          }

          // For other URLs, show domain with minimal path
          return domain.length > 15 ? domain.substring(0, 12) + '...' : domain
        } catch (e) {
          // If URL parsing fails, fall back to standard truncation
          return scope.length > 20 ? scope.substring(0, 17) + '...' : scope
        }
      }

      // For non-URLs, use more aggressive truncation
      // Special case for scopes with colon format (service:action)
      if (scope.includes(':')) {
        const [service, action] = scope.split(':', 2)
        return `${service}:${action}`
      }

      return scope.length > 20 ? scope.substring(0, 17) + '...' : scope
    }

    return (
      <ScopeTooltip key={scope} scope={scope} scopeLookup={scopeLookup}>
        <Badge
          variant="secondary"
          className="relative inline-flex h-6 w-full items-center justify-center whitespace-nowrap rounded-sm px-6 text-xs">
          <span className="max-w-[85%] truncate text-center">
            {displayText()}
          </span>
          {editable && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveScope(scope)
              }}
              className="absolute right-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
              <X className="text-secondary-foreground size-3" />
            </button>
          )}
        </Badge>
      </ScopeTooltip>
    )
  }

  const renderAvailableScope = (scope: string) => {
    const isAdded = isScopeAdded(scope)

    return (
      <TooltipProvider key={scope}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'hover:bg-secondary/30 flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs',
                isAdded
                  ? 'bg-secondary/20 text-muted-foreground'
                  : 'text-foreground',
              )}
              onClick={() => handleToggleScope(scope)}>
              <span className="flex-1 truncate pr-1.5">{scope}</span>
              {isAdded ? (
                <X className="text-muted-foreground size-3.5 flex-shrink-0" />
              ) : (
                <Check className="text-muted-foreground size-3.5 flex-shrink-0" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {scopeLookup && scopeLookup[scope] ? (
              <div className="max-w-xs">
                <p className="mb-1 font-medium">
                  {scopeLookup[scope].display_name || scope}
                </p>
                <p className="text-xs">{scopeLookup[scope].description}</p>
              </div>
            ) : (
              scope
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        {/* Title with Add button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium">Scopes</div>
          {editable && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Manage scopes
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[280px] p-2"
                align="end"
                side="left"
                onOpenAutoFocus={(e) => e.preventDefault()}>
                {!hideCustomInput && (
                  <div className="mb-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search scopes"
                        className="border-input h-7 w-full rounded border pl-7 pr-2 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter' &&
                            filteredScopes.length === 0
                          ) {
                            handleAddCustomScope()
                          }
                        }}
                      />
                      <Search className="text-muted-foreground absolute left-2 top-1/2 size-3.5 -translate-y-1/2" />
                    </div>
                  </div>
                )}
                <div className="max-h-[250px]">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium">Available scopes</div>
                    <Badge
                      variant={scopes.length > 0 ? 'secondary' : 'outline'}
                      className={cn(
                        'text-xs font-normal',
                        scopes.length === 0 &&
                          'text-muted-foreground border-dashed',
                      )}>
                      {scopes.length} selected
                    </Badge>
                  </div>

                  <div
                    className="border-border mb-3 max-h-[170px] space-y-1 overflow-y-auto rounded-sm border p-1.5"
                    role="listbox"
                    tabIndex={0}
                    style={{
                      scrollbarWidth: 'thin',
                      WebkitOverflowScrolling: 'touch',
                    }}
                    onWheel={(e) => e.stopPropagation()}>
                    {filteredScopes.length > 0 ? (
                      filteredScopes.map(renderAvailableScope)
                    ) : (
                      <div className="flex flex-col items-center py-3">
                        <div className="text-muted-foreground mb-1 text-xs">
                          No scopes found
                        </div>
                        {searchQuery.trim() && !hideCustomInput && (
                          <div className="mt-2 flex flex-col items-center">
                            <div className="text-muted-foreground mb-1.5 text-xs">
                              Add custom scope?
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={handleAddCustomScope}>
                              Add &quot;{searchQuery.trim()}&quot;
                            </Button>
                          </div>
                        )}
                        <div className="border-border mt-4 w-full border-t pt-3">
                          <RequestLink className="justify-center" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-8 w-full text-xs',
                      scopes.length === 0
                        ? 'text-muted-foreground cursor-not-allowed opacity-50'
                        : 'text-destructive hover:bg-destructive/10',
                    )}
                    disabled={scopes.length === 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClearAllScopes()
                    }}>
                    Clear all scopes
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {children || (
          <>
            {/* List of scopes */}
            <div className="mb-3">
              {scopes.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {visibleScopes.map(renderScopeBadge)}
                  {hasHiddenScopes && (
                    <Popover
                      open={isMorePopoverOpen}
                      onOpenChange={setIsMorePopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="w-full">
                          <Badge
                            variant="outline"
                            className="bg-secondary/10 hover:bg-secondary/20 inline-flex h-6 w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-sm border-dashed text-xs transition-colors">
                            +{hiddenScopesCount} more
                          </Badge>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[320px] max-w-[90vw] p-3"
                        align="center">
                        <span className="mb-2 block text-sm font-medium">
                          All Scopes
                        </span>
                        <div
                          className="block max-h-[250px] overflow-y-auto p-2"
                          role="listbox"
                          tabIndex={0}
                          style={{
                            scrollbarWidth: 'thin',
                            WebkitOverflowScrolling: 'touch',
                          }}
                          onWheel={(e) => e.stopPropagation()}>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {scopes.map(renderScopeBadge)}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs italic">
                  No scopes added
                </div>
              )}
            </div>

            {/* Request Scopes link with divider */}
            <div className="border-border mt-4 border-t pt-3">
              <div className="flex justify-start">
                <RequestLink />
              </div>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
