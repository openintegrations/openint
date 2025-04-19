import type {ConnectionExpanded} from '@openint/api-v1/models'

import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Settings,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import {useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge, Card, CardContent} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util/string-utils'

export interface ConnectionCardProps {
  connection: ConnectionExpanded
  onPress?: () => void
  className?: string
  variant?: 'default' | 'developer'
  children?: React.ReactNode
}

export function ConnectionCard({
  connection,
  onPress,
  className,
  variant = 'default',
  children,
}: ConnectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const logoUrl =
    connection.integration?.logo_url || connection.connector?.logo_url

  const displayName =
    connection.integration?.name ||
    connection.connector?.display_name ||
    titleCase(connection.connector_name)

  const {
    icon: StatusIcon,
    label,
    color,
    borderColor,
  } = getStatusStyles(connection.status)

  return (
    <Card
      className={cn(
        'border-card-border bg-card relative h-[150px] w-[150px] rounded-lg border p-0',
        onPress &&
          'hover:border-button hover:bg-button-light cursor-pointer transition-colors duration-300 ease-in-out',
        borderColor,
        className,
      )}
      onMouseEnter={() => onPress && setIsHovered(true)}
      onMouseLeave={() => onPress && setIsHovered(false)}>
      <CardContent
        className="flex h-full flex-col items-center justify-center p-4 py-2"
        onClick={onPress}>
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          {isHovered && onPress ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Settings className="text-button" size={24} />
              <span className="text-button mt-2 font-sans text-[14px] font-semibold">
                Manage
              </span>
            </div>
          ) : (
            <>
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={64}
                  height={64}
                  className="rounded-lg"
                />
              )}
              <p className="mt-2 w-full break-words text-center text-sm font-semibold">
                {displayName}
              </p>
              {variant === 'developer' && (
                <pre
                  className="text-muted-foreground w-full truncate text-center text-xs"
                  title={connection.id}>
                  {connection.id}
                </pre>
              )}
              <Badge variant="secondary" className={cn('mt-2 gap-1', color)}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </Badge>
            </>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

const getStatusStyles = (status: ConnectionExpanded['status']) => {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle2,
        label: 'Connected',
        color: 'bg-green-100 text-green-800 hover:bg-green-100/80',
        borderColor: 'border-green-200',
      }
    case 'error':
      return {
        icon: AlertCircle,
        label: 'Error',
        color: 'bg-red-100 text-red-800 hover:bg-red-100/80',
        borderColor: 'border-red-200',
      }
    case 'disconnected':
      return {
        icon: XCircle,
        label: 'Disconnected',
        color: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80',
        borderColor: 'border-amber-200',
      }
    case 'manual':
    default:
      return {
        icon: HelpCircle,
        label: 'Manual',
        color: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80',
        borderColor: 'border-gray-200',
      }
  }
}
