import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from './CopyID'
import {StatusType} from './StatusDot'

interface BaseTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name to display
   */
  name: string
  /**
   * Logo/icon component or element
   */
  logo: React.ReactNode
  /**
   * ID to be displayed and copied (optional for simple variant)
   */
  id?: string
  /**
   * Status of the entity
   */
  status?: StatusType
  /**
   * Whether to show the simple variant (logo and name only)
   */
  simple?: boolean
  /**
   * Optional className for styling
   */
  className?: string
}

export function BaseTableCell({
  name,
  logo,
  id,
  status = 'healthy',
  simple = false,
  className,
  ...props
}: BaseTableCellProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        simple ? 'py-1' : 'py-2',
        className,
      )}
      {...props}>
      <div className="relative flex-shrink-0">{logo}</div>
      {simple ? (
        <div className="flex items-center">
          <div className="text-sm font-medium">{name || 'Unknown'}</div>
        </div>
      ) : (
        <div className="flex h-[55px] flex-col justify-between">
          <div className="text-sm font-medium">{name || 'Unknown'}</div>
          {id && <CopyID value={id} width={280} size="medium" />}
        </div>
      )}
    </div>
  )
}
