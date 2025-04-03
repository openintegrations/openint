'use client'

import type {Table} from '@tanstack/react-table'
import {Trash2, X} from 'lucide-react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Button} from '@openint/shadcn/ui'

interface MultiSelectActionBarProps {
  selectedCount: number
  onDelete: () => void
  onClear: () => void
  className?: string
}

export function MultiSelectActionBar({
  selectedCount,
  onDelete,
  onClear,
  className,
}: MultiSelectActionBarProps) {
  // Track visibility state for animation
  const [isVisible, setIsVisible] = useState(false)
  // Track if component should be in DOM (for exit animation)
  const [isInDOM, setIsInDOM] = useState(false)

  // Handle animation timing
  useEffect(() => {
    let showTimer: NodeJS.Timeout | undefined
    let hideTimer: NodeJS.Timeout | undefined

    // When items are selected, show immediately
    if (selectedCount > 0) {
      setIsInDOM(true)
      // Small delay before showing to allow DOM insertion
      showTimer = setTimeout(() => {
        setIsVisible(true)
      }, 10)
    }
    // When items are deselected, animate out first then remove from DOM
    else if (selectedCount === 0 && isVisible) {
      setIsVisible(false)
      // Wait for animation to complete before removing from DOM
      hideTimer = setTimeout(() => {
        setIsInDOM(false)
      }, 300) // Match this with the duration-300 in the CSS
    }

    // Cleanup function
    return () => {
      if (showTimer) clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [selectedCount, isVisible])

  // Handle clear button with animation
  const handleClear = useCallback(() => {
    setIsVisible(false)
    // Wait for animation to complete before calling onClear
    setTimeout(() => {
      onClear()
    }, 300)
  }, [onClear])

  // Don't render anything when there's nothing selected and not animating
  if (!isInDOM && selectedCount === 0) return null

  return (
    <div
      className={cn(
        'bg-background ring-border fixed bottom-4 left-1/2 z-50 flex h-14 -translate-x-1/2 transform items-center justify-between rounded-lg px-4 shadow-lg ring-1 transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0',
        className,
      )}
      style={{minWidth: '300px'}}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{selectedCount} Selected</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClear}
          aria-label="Clear selection">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Vertical divider */}
      <div className="bg-border/50 mx-2 h-8 w-px"></div>

      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="gap-2 px-4">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  )
}

// Create a hook that can be used with the DataTable to get selected rows
export function useTableRowSelection<TData>(
  table: Table<TData>,
  onDelete: (
    selectedRows: Record<string, boolean>,
    selectedItems: TData[],
  ) => void,
) {
  const selectedRows = table.getState().rowSelection
  const selectedCount = Object.keys(selectedRows).length

  const selectedItems = useMemo(() => {
    const rows = table.getFilteredSelectedRowModel().rows
    return rows.map((row) => row.original)
  }, [table])

  // Handler for clearing selection
  const handleClear = useCallback(() => {
    // With animation, we need to create a copy of the current selection
    // So we can safely reset it after animation
    const currentSelection = {...selectedRows}
    if (Object.keys(currentSelection).length > 0) {
      // Let the animation finish before actually clearing
      setTimeout(() => {
        table.resetRowSelection()
      }, 300)
    }
  }, [table, selectedRows])

  // Handler for deletion
  const handleDelete = useCallback(() => {
    // Store the current selection before it gets reset
    const currentSelection = {...selectedRows}
    const currentItems = [...selectedItems]

    // Call the delete function with the stored values
    onDelete(currentSelection, currentItems)

    // Reset selection after animation completes
    setTimeout(() => {
      table.resetRowSelection()
    }, 300)
  }, [onDelete, selectedRows, selectedItems, table])

  return {
    selectedCount,
    handleClear,
    handleDelete,
    selectedItems,
    selectedRows,
  }
}
