'use client'

import type {FC, ReactNode} from 'react'

import {Check, Info, X} from 'lucide-react'
import {useCallback, useState} from 'react'
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
}

const RequestLink: FC<{className?: string}> = ({className}) => (
  <div className={cn('flex items-center text-sm text-gray-500', className)}>
    <Info className="mr-1 size-4" />
    <span>Need new scopes?</span>
    {/* TODO: @rodrigo - Add connector name to the email title and body */}
    <a
      href={`mailto:support@openint.dev?subject=Add%20OpenInt%20scopes%20to%20&body=I%20require%20the%20following%20scopes%20to%20be%20added%20to%20:\n\n`}
      className="text-primary ml-1 cursor-pointer border-none bg-transparent p-1 hover:underline">
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
      <p>
        {scopeLookup && scopeLookup[scope] ? (
          <>
            <span className="block font-medium">
              {scopeLookup[scope].display_name || scopeLookup[scope].scope}
            </span>
            {scopeLookup[scope].description}
          </>
        ) : (
          scope
        )}
      </p>
    </TooltipContent>
  </Tooltip>
)

interface ScopesListProps {
  scopes: string[]
  editable: boolean
  handleRemoveScope: (scope: string) => void
  scopeLookup: Record<string, ScopeLookup>
}

const ScopesList: FC<ScopesListProps> = ({
  scopes,
  editable,
  handleRemoveScope,
  scopeLookup,
}) => (
  <div className="w-full">
    <div className="flex flex-wrap gap-4">
      {scopes.map((scope) => (
        <ScopeTooltip key={scope} scope={scope} scopeLookup={scopeLookup}>
          <Badge variant="secondary" className="inline-flex items-center gap-4">
            <span className="flex max-w-[350px] grow truncate p-2">
              {scope}
            </span>
            {editable && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveScope(scope)
                }}
                className="ml-auto flex-shrink-0 rounded-full p-0.5 hover:bg-gray-200">
                <X className="size-3.5" />
              </button>
            )}
          </Badge>
        </ScopeTooltip>
      ))}
    </div>
  </div>
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
}: ConnectorScopesProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [customScope, setCustomScope] = useState('')

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
    if (customScope && onAddScope) {
      onAddScope(customScope)
      setCustomScope('')
    }
  }, [customScope, onAddScope])

  return (
    <TooltipProvider>
      <div className={cn('flex w-full flex-col gap-4', className)}>
        <span className="text-md font-bold">Scopes</span>
        {children || (
          <>
            <ScopesList
              scopes={scopes}
              editable={editable}
              handleRemoveScope={handleRemoveScope}
              scopeLookup={scopeLookup || {}}
            />
            {editable && (
              <div className="flex items-center">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="default" size="sm">
                      Add scope
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-96 p-0"
                    align="start"
                    side="right">
                    <div className="p-4">
                      <h4 className="mb-3 font-medium">Add scopes</h4>
                      {!hideCustomInput && (
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Enter custom scope"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={customScope}
                            onChange={(e) => {
                              setCustomScope(e.target.value)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCustomScope()
                              }
                            }}
                          />
                        </div>
                      )}
                      <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1">
                        {availableScopes.map((scope) => {
                          const isAdded = isScopeAdded(scope)
                          return (
                            <ScopeTooltip
                              key={scope}
                              scope={scope}
                              scopeLookup={scopeLookup}>
                              <button
                                className={cn(
                                  'flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 hover:bg-gray-100',
                                  isAdded && 'bg-gray-50',
                                  'group',
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleScope(scope)
                                }}>
                                <span className="mr-2 truncate text-sm">
                                  {scope}
                                </span>
                                {isAdded ? (
                                  <X className="size-3.5 flex-shrink-0 text-gray-500" />
                                ) : (
                                  <Check className="size-3.5 flex-shrink-0 text-gray-500 opacity-0 group-hover:opacity-100" />
                                )}
                              </button>
                            </ScopeTooltip>
                          )
                        })}
                      </div>
                      <RequestLink className="justify-center" />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <RequestLink />
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
