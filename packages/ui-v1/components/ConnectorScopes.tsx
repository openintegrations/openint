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

  const renderScopeBadge = (scope: string) => (
    <ScopeTooltip key={scope} scope={scope} scopeLookup={scopeLookup}>
      <Badge
        variant="secondary"
        className="my-0.5 inline-flex h-6 items-center whitespace-nowrap text-xs">
        <span className="max-w-[180px] truncate px-1.5">{scope}</span>
        {editable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveScope(scope)
            }}
            className="hover:bg-secondary ml-0.5 flex-shrink-0 rounded-full p-0.5">
            <X className="text-muted-foreground size-2.5" />
          </button>
        )}
      </Badge>
    </ScopeTooltip>
  )

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
        {/* Title */}
        <div className="mb-2 text-sm font-medium">Scopes</div>

        {children || (
          <>
            {/* List of scopes */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {scopes.length > 0 ? (
                <>
                  {visibleScopes.map(renderScopeBadge)}

                  {hasHiddenScopes && (
                    <Popover
                      open={isMorePopoverOpen}
                      onOpenChange={setIsMorePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-secondary/20 hover:bg-secondary/30 my-0.5 h-6 cursor-pointer border-dashed text-xs">
                          +{hiddenScopesCount} more
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto max-w-[400px] p-3"
                        align="center"
                        sideOffset={5}>
                        <div className="mb-2 text-sm font-medium">
                          All Scopes
                        </div>
                        <div className="flex max-h-[250px] flex-wrap gap-1.5 overflow-y-auto">
                          {scopes.map(renderScopeBadge)}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-xs italic">
                  No scopes added
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div>
                {editable && (
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs">
                        Add scope
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
                      <div className="flex max-h-[280px] flex-col">
                        <div className="text-muted-foreground mb-1.5 px-1 text-xs font-medium">
                          Available scopes
                        </div>
                        <div className="-mr-1.5 flex-1 overflow-y-auto pr-1.5">
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
              <RequestLink />
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
