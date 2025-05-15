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
  view?: 'card' | 'no-card'
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
      className="text-primary hover:text-muted-foreground ml-1 hover:underline"
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
  view = 'card',
}: ConnectorScopesProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (hideCustomInput) {
      setSearchQuery('')
    }
  }, [hideCustomInput])

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
    // Determine scope type based on length
    const getScopeStyle = () => {
      if (scope.length > 50) return 'max-w-full flex-shrink-0 flex-grow-0' // Very long (full width)
      if (scope.length > 25) return 'max-w-[320px] flex-shrink-0 flex-grow-0' // Medium-long
      if (scope.length > 15) return 'max-w-[200px] flex-shrink-0 flex-grow-0' // Medium
      return 'flex-shrink-0 flex-grow-0' // Short
    }

    // Format the display text with appropriate truncation but preserve full URLs
    const displayText = () => {
      // Increased truncation limit for better readability
      return scope.length > 60 ? scope.substring(0, 57) + '...' : scope
    }

    return (
      <ScopeTooltip key={scope} scope={scope} scopeLookup={scopeLookup}>
        <Badge
          variant="secondary"
          className={cn(
            'bg-secondary/50 hover:bg-secondary/100 relative mb-2 mr-2 inline-flex h-8 items-center justify-start whitespace-nowrap rounded-md px-3 text-xs',
            getScopeStyle(),
          )}>
          <span className="truncate pr-5 text-left">{displayText()}</span>
          {editable && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveScope(scope)
              }}
              className="hover:bg-secondary/50 absolute right-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
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
                'flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors',
                isAdded
                  ? 'bg-primary/10 text-foreground'
                  : 'hover:bg-secondary/20 text-foreground',
              )}
              onClick={() => handleToggleScope(scope)}>
              <span className="max-w-[300px] flex-1 truncate pr-1.5">
                {scope}
              </span>
              <div
                className={cn(
                  'flex size-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors',
                  isAdded
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40',
                )}>
                {isAdded && (
                  <Check className="text-primary-foreground size-2.5" />
                )}
              </div>
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
    <div
      className={cn(
        view === 'card' && 'border-border bg-card rounded-lg border shadow-sm',
        view === 'no-card' && 'bg-transparent',
      )}>
      {view === 'card' && (
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
          <div className="text-card-foreground text-base font-medium">
            Scopes
          </div>
          {editable && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-medium">
                  Manage scopes
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[380px] p-2"
                align="end"
                side="left"
                onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="flex flex-col">
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
                      'mt-auto h-8 w-full text-xs',
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
      )}

      <div className={cn('w-full', view === 'card' ? 'p-5' : 'p-0', className)}>
        {children || (
          <>
            {/* List of scopes */}
            <div className={cn('mb-6', view === 'no-card' && 'mb-0')}>
              {scopes.length > 0 ? (
                <div className="flex flex-wrap">
                  {visibleScopes.map(renderScopeBadge)}
                  {hasHiddenScopes && (
                    <Popover
                      open={isMorePopoverOpen}
                      onOpenChange={setIsMorePopoverOpen}>
                      <PopoverTrigger asChild>
                        <div>
                          <Badge
                            variant="outline"
                            className="bg-muted/50 hover:bg-muted mb-2 inline-flex h-8 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border-dashed px-4 text-xs transition-colors">
                            +{hiddenScopesCount} more
                          </Badge>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[450px] max-w-[90vw] p-3"
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
                          <div className="flex flex-wrap">
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
            {view === 'card' && (
              <div className="border-border mt-5 border-t pt-4">
                <div className="flex justify-start">
                  <RequestLink />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
