'use client'

import {useEffect, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@openint/shadcn/ui'
import {Icon} from './Icon'

/**
 * Size variants for the CopyID component
 * - 'default': Largest size
 * - 'medium': Standard size (default)
 * - 'compact': Smallest size, for use in PropertyListView
 * - 'justicon': Shows only the icon button without the text value
 */
export type CopyIDSize = 'default' | 'medium' | 'compact' | 'justicon'

interface CopyIDProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The ID or code to be displayed and copied
   */
  value: string
  /**
   * Optional label to display before the ID
   */
  label?: string
  /**
   * Optional tooltip text to display on copy success
   */
  tooltipCopiedText?: string
  /**
   * Optional tooltip text to display before copying
   */
  tooltipDefaultText?: string
  /**
   * Width of the component container
   * @default 320px
   */
  width?: string | number
  /**
   * Size variant of the component
   * @default 'medium'
   */
  size?: CopyIDSize
  /**
   * Whether to use a compact size (deprecated, use size="compact" instead)
   * @deprecated
   */
  compact?: boolean
  /**
   * Whether to disable the Shadcn/UI tooltip and use a custom implementation
   * Use this when the component is inside a Popover to prevent tooltip issues
   * @default false
   */
  disableTooltip?: boolean
  /**
   * Delay in ms before the component is fully mounted
   * Use this to prevent tooltip flickering in Popovers
   * @default 0
   */
  mountDelay?: number
  /**
   * Optional className for styling
   */
  className?: string
}

export function CopyID({
  value,
  label,
  tooltipCopiedText = 'Copied!',
  tooltipDefaultText = 'Copy to clipboard',
  width = '320px',
  size = 'medium',
  compact = false,
  disableTooltip = false,
  mountDelay = 0,
  className,
  ...props
}: CopyIDProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(mountDelay === 0)
  const [showTooltip, setShowTooltip] = useState(false)

  // For backwards compatibility
  const resolvedSize = compact ? 'compact' : size

  // Check if we should render only the icon
  const isJustIcon = resolvedSize === 'justicon'

  // Handle delayed mounting (useful for Popovers)
  useEffect(() => {
    if (mountDelay > 0) {
      const timer = setTimeout(() => {
        setMounted(true)
      }, mountDelay)

      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [mountDelay])

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!mounted) return

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true)
        if (disableTooltip) setShowTooltip(true)

        setTimeout(() => {
          setCopied(false)
          if (disableTooltip) setShowTooltip(false)
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  // Determine padding and icon size based on the component size
  const getPadding = () => {
    switch (resolvedSize) {
      case 'compact':
        return 'px-2 py-1'
      case 'medium':
        return 'px-2.5 py-1.5'
      case 'justicon':
        // Equal padding for a more balanced, square button
        return 'px-1.5 py-1.5'
      default:
        return 'px-3 py-2'
    }
  }

  const getIconSize = () => {
    switch (resolvedSize) {
      case 'compact':
        return 14
      case 'medium':
        return 16
      case 'justicon':
        // Keep the icon same size as medium size
        return 16
      default:
        return 18
    }
  }

  // If it's just the icon variant, only show the icon button
  if (isJustIcon && mounted) {
    // With custom tooltip implementation
    if (disableTooltip) {
      return (
        <div
          className={cn(
            'relative rounded border border-gray-200 bg-gray-50',
            getPadding(),
            className,
          )}
          {...props}>
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Copy to clipboard"
            onMouseEnter={() => !copied && setShowTooltip(true)}
            onMouseLeave={() => !copied && setShowTooltip(false)}>
            <Icon name={copied ? 'Check' : 'Copy'} size={getIconSize()} />
          </button>

          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-1.5">
              <div className="bg-primary whitespace-nowrap rounded px-2 py-1 text-xs text-white shadow-sm">
                {copied ? tooltipCopiedText : tooltipDefaultText}
              </div>
              <div className="bg-primary absolute right-[10px] top-full -mt-[2px] h-2 w-2 rotate-45 transform"></div>
            </div>
          )}
        </div>
      )
    }

    // With Shadcn/UI tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className={cn(
                'flex-shrink-0 rounded border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:text-gray-600',
                getPadding(),
                className,
              )}
              aria-label="Copy to clipboard">
              <Icon name={copied ? 'Check' : 'Copy'} size={getIconSize()} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? tooltipCopiedText : tooltipDefaultText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // If not yet mounted, show a placeholder that looks the same
  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500',
          getPadding(),
          className,
        )}
        style={{width: typeof width === 'number' ? `${width}px` : width}}
        {...props}>
        {label && <span className="text-gray-400">{label}</span>}
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
          {value}
        </span>
        <span className="flex-shrink-0 text-gray-400">
          <Icon name="Copy" size={getIconSize()} />
        </span>
      </div>
    )
  }

  // Use a custom tooltip implementation when inside Popovers
  if (disableTooltip) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500',
          getPadding(),
          className,
        )}
        style={{width: typeof width === 'number' ? `${width}px` : width}}
        {...props}>
        {label && <span className="text-gray-400">{label}</span>}
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
          {value}
        </span>
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Copy to clipboard"
            onMouseEnter={() => !copied && setShowTooltip(true)}
            onMouseLeave={() => !copied && setShowTooltip(false)}>
            <Icon name={copied ? 'Check' : 'Copy'} size={getIconSize()} />
          </button>

          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-1.5">
              <div className="bg-primary whitespace-nowrap rounded px-2 py-1 text-xs text-white shadow-sm">
                {copied ? tooltipCopiedText : tooltipDefaultText}
              </div>
              <div className="bg-primary absolute right-[10px] top-full -mt-[2px] h-2 w-2 rotate-45 transform"></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Use the Shadcn/UI tooltip in normal cases
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500',
        getPadding(),
        className,
      )}
      style={{width: typeof width === 'number' ? `${width}px` : width}}
      {...props}>
      {label && <span className="text-gray-400">{label}</span>}
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
        {value}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Copy to clipboard">
              <Icon name={copied ? 'Check' : 'Copy'} size={getIconSize()} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? tooltipCopiedText : tooltipDefaultText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
