'use client'

import {Check, Info, X} from 'lucide-react'
import React, {createContext, useContext, useState} from 'react'
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

// Context for sharing state between compound components
interface ConnectorScopesContextValue {
  scopeLookup?: Record<string, ScopeLookup>
  scopes: string[]
  availableScopes: string[]
  editable: boolean
  hideCustomInput?: boolean
  onRemoveScope?: (scope: string) => void
  onAddScope?: (scope: string) => void
  isPopoverOpen: boolean
  setIsPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>
  customScope: string
  setCustomScope: React.Dispatch<React.SetStateAction<string>>
  handleRemoveScope: (scope: string) => void
  handleAddScope: (scope: string) => void
  handleToggleScope: (scope: string) => void
  handleAddCustomScope: () => void
  isScopeAdded: (scopeId: string) => boolean
}

const ConnectorScopesContext = createContext<
  ConnectorScopesContextValue | undefined
>(undefined)

// Hook to use the context
const useConnectorScopes = () => {
  const context = useContext(ConnectorScopesContext)
  if (!context) {
    throw new Error(
      'ConnectorScopes compound components must be used within a ConnectorScopes component',
    )
  }
  return context
}

// Root component props
export interface ConnectorScopesProps {
  scopeLookup?: Record<string, ScopeLookup>
  scopes: string[]
  onRemoveScope?: (scope: string) => void
  onAddScope?: (scope: string) => void
  availableScopes?: string[]
  editable?: boolean
  hideCustomInput?: boolean
  className?: string
  children?: React.ReactNode
}

// Root component
const ConnectorScopesRoot: React.FC<ConnectorScopesProps> = ({
  scopeLookup,
  scopes,
  onRemoveScope,
  onAddScope,
  availableScopes = [],
  editable = false,
  className,
  children,
  hideCustomInput = false,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [customScope, setCustomScope] = useState('')

  const handleRemoveScope = (scope: string) => {
    if (onRemoveScope) {
      onRemoveScope(scope)
    }
  }

  const handleAddScope = (scope: string) => {
    if (onAddScope) {
      onAddScope(scope)
    }
  }

  const handleToggleScope = (scope: string) => {
    const isAdded = isScopeAdded(scope)
    if (isAdded) {
      handleRemoveScope(scope)
    } else {
      handleAddScope(scope)
    }
  }

  const handleAddCustomScope = () => {
    if (customScope && onAddScope) {
      onAddScope(customScope)
      setCustomScope('')
    }
  }

  // Check if a scope is already added
  const isScopeAdded = (scope: string) => scopes.includes(scope)

  const contextValue: ConnectorScopesContextValue = {
    scopes,
    scopeLookup,
    availableScopes,
    editable,
    hideCustomInput,
    onRemoveScope,
    onAddScope,
    isPopoverOpen,
    setIsPopoverOpen,
    customScope,
    setCustomScope,
    handleRemoveScope,
    handleAddScope,
    handleToggleScope,
    handleAddCustomScope,
    isScopeAdded,
  }

  return (
    <ConnectorScopesContext.Provider value={contextValue}>
      <TooltipProvider>
        <div className={cn('w-full', className)}>
          {children || (
            <>
              {editable && <AddScopeButton />}
              <ScopesList />
            </>
          )}
        </div>
      </TooltipProvider>
    </ConnectorScopesContext.Provider>
  )
}

const ScopeTooltipContent = ({
  scope,
  scopeLookup,
}: {
  scope: string
  scopeLookup?: Record<string, ScopeLookup>
}) => (
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
)

// Add Scope Button component
interface AddScopeButtonProps {
  className?: string
}

const AddScopeButton: React.FC<AddScopeButtonProps> = ({className}) => {
  const {
    availableScopes,
    isPopoverOpen,
    setIsPopoverOpen,
    customScope,
    setCustomScope,
    handleToggleScope,
    handleAddCustomScope,
    isScopeAdded,
    scopeLookup,
    hideCustomInput,
  } = useConnectorScopes()

  return (
    <div className={cn('flex items-center', className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="default" size="sm" className="mb-4">
            Add scope
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start" side="right">
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
                  <Tooltip key={scope} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 hover:bg-gray-100',
                          isAdded && 'bg-gray-50',
                        )}
                        onClick={() => {
                          handleToggleScope(scope)
                        }}>
                        <span className="mr-2 truncate text-sm">{scope}</span>
                        {isAdded ? (
                          <X className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <ScopeTooltipContent
                      scope={scope}
                      scopeLookup={scopeLookup}
                    />
                  </Tooltip>
                )
              })}
            </div>
            <div className="flex items-center justify-center border-t border-gray-100 pt-3 text-xs text-gray-500">
              <Info className="mr-1 h-3 w-3" />
              <span>Need a new scope?</span>
              <button
                className="text-primary ml-1 cursor-pointer border-none bg-transparent hover:underline"
                onClick={() => {
                  // Handle request for new scopes
                }}>
                Request it
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Scopes List component
interface ScopesListProps {
  className?: string
}

const ScopesList: React.FC<ScopesListProps> = ({className}) => {
  const {scopes, editable, handleRemoveScope, scopeLookup} =
    useConnectorScopes()

  const BadgeContent = (scope: string) => (
    <Badge
      key={scope}
      variant="secondary"
      className="inline-flex items-center gap-4">
      <span className="flex max-w-[350px] grow truncate p-2">{scope}</span>
      {editable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRemoveScope(scope)
          }}
          className="ml-auto flex-shrink-0 rounded-full p-0.5 hover:bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </Badge>
  )

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap gap-2">
        {scopes.map((scope) => (
          <Tooltip key={scope} delayDuration={300}>
            <TooltipTrigger asChild>{BadgeContent(scope)}</TooltipTrigger>
            <ScopeTooltipContent scope={scope} scopeLookup={scopeLookup} />
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

// Request Link component - kept for backward compatibility but not used by default
interface RequestLinkProps {
  className?: string
}

const RequestLink: React.FC<RequestLinkProps> = ({className}) => (
  <div className={cn('flex items-center p-2 text-sm text-gray-500', className)}>
    <Info className="mr-1 h-4 w-4" />
    <span>Need new scopes?</span>
    <button
      className="text-primary ml-1 cursor-pointer border-none bg-transparent p-1 hover:underline"
      onClick={() => {
        // Handle request for new scopes
      }}>
      Request it
    </button>
  </div>
)

// Compound component
const ConnectorScopes = Object.assign(ConnectorScopesRoot, {
  AddButton: AddScopeButton,
  List: ScopesList,
  RequestLink,
})

export {ConnectorScopes}
export default ConnectorScopes
