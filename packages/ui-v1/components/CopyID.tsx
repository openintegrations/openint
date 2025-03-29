import {useState} from 'react'
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
 */
export type CopyIDSize = 'default' | 'medium' | 'compact'

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
  className,
  ...props
}: CopyIDProps) {
  const [copied, setCopied] = useState(false)

  // For backwards compatibility
  const resolvedSize = compact ? 'compact' : size

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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
      default:
        return 18
    }
  }

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
