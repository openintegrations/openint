'use client'

import type {FC, ReactNode} from 'react'

import {Check, Info, Search, X} from 'lucide-react'
import {useCallback, useMemo, useState} from 'react'
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
      href="mailto:support@openint.dev?subject=Add%20OpenInt%20scopes%20request"
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
}) => (
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
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
    if (!searchQuery.trim()) return availableScopes
    const query = searchQuery.trim().toLowerCase()
    return availableScopes.filter((scope) =>
      scope.toLowerCase().includes(query),
    )
  }, [availableScopes, searchQuery])

  const visibleScopes = scopes.slice(0, maxVisible)
  const hiddenScopesCount = scopes.length - maxVisible
  const hasHiddenScopes = hiddenScopesCount > 0

  const handleClearAllScopes = useCallback(() => {
    // Check if there are scopes to remove
    if (scopes.length === 0) return

    // If custom clear function provided, use it
    if (onClearAllScopes) {
      onClearAllScopes()
      return
    }

    // Otherwise, remove scopes one by one
    // Create a copy to avoid issues with the array changing during iteration
    const scopesToRemove = [...scopes]

    if (onRemoveScope) {
      scopesToRemove.forEach((scope) => {
        onRemoveScope(scope)
      })
    }

    // Don't close the popover, keep it open so user can see and select new scopes
  }, [scopes, onRemoveScope, onClearAllScopes])

  const renderScopeBadge = (scope: string) => {
    // Determine if the scope is a URL (starts with http:// or https://)
    const isUrl = /^https?:\/\//.test(scope)

    return (
      <ScopeTooltip key={scope} scope={scope} scopeLookup={scopeLookup}>
        <Badge
          variant="secondary"
          className="inline-flex h-6 w-full items-center whitespace-nowrap rounded-sm text-xs">
          <span
            className={cn(
              'truncate px-1.5',
              isUrl ? 'max-w-[280px]' : 'max-w-[180px]',
            )}>
            {scope}
          </span>
          {editable && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveScope(scope)
              }}
              className="hover:bg-secondary ml-auto flex-shrink-0 rounded-full p-0.5">
              <X className="text-muted-foreground size-2.5" />
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
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'hover:bg-secondary/30 flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs',
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
        <div className="mb-2 flex items-center justify-between">
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
                align="start"
                side="top"
                avoidCollisions={true}
                sticky="always">
                {!hideCustomInput && (
                  <div className="border-border mb-3 border-b pb-2">
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
                <div className="flex max-h-[350px] flex-col overflow-hidden">
                  <div className="mb-1.5 flex items-center justify-between px-1">
                    <div className="text-muted-foreground text-xs font-medium">
                      Available scopes
                    </div>
                    {scopes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5">
                          {scopes.length} selected
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClearAllScopes()
                          }}>
                          Clear all
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="-mr-1.5 max-h-[300px] flex-1 overflow-y-auto pr-1.5">
                    {filteredScopes.length > 0 ? (
                      <div className="space-y-1">
                        {filteredScopes.map(renderAvailableScope)}
                      </div>
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
                <div className="grid grid-cols-2 gap-2">
                  {/* First column - First 4 scopes */}
                  <div className="space-y-2">
                    {visibleScopes
                      .slice(0, Math.min(4, visibleScopes.length))
                      .map(renderScopeBadge)}
                  </div>

                  {/* Second column - Next 4 scopes (or fewer) */}
                  {visibleScopes.length > 4 && (
                    <div className="space-y-2">
                      {visibleScopes.slice(4).map(renderScopeBadge)}

                      {hasHiddenScopes && (
                        <Popover
                          open={isMorePopoverOpen}
                          onOpenChange={setIsMorePopoverOpen}>
                          <PopoverTrigger asChild>
                            <div className="flex w-full">
                              <Badge
                                variant="outline"
                                className="bg-secondary/20 hover:bg-secondary/30 inline-flex h-6 w-full cursor-pointer items-center whitespace-nowrap rounded-sm border-dashed text-xs">
                                <span className="mx-auto">
                                  +{hiddenScopesCount} more
                                </span>
                              </Badge>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto max-w-[400px] p-3"
                            align="center"
                            sideOffset={5}>
                            <div className="mb-2 text-sm font-medium">
                              All Scopes
                            </div>
                            <div className="flex max-h-[250px] flex-wrap gap-2 overflow-y-auto">
                              {scopes.map(renderScopeBadge)}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
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
