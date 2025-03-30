import Image from 'next/image'
import type {ConnectorConfig} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util'

export interface ConnectorConfigCardProps {
  connectorConfig: ConnectorConfig<'connector'>
  onPress?: () => void
  className?: string
  /** Location of the display name relative to the logo */
  displayNameLocation?: 'bottom' | 'right'
  /** Optional children to render below the card content */
  children?: React.ReactNode
}

export function ConnectorConfigCard({
  connectorConfig,
  onPress,
  className,
  displayNameLocation = 'bottom',
  children,
}: ConnectorConfigCardProps) {
  return (
    <Card
      className={cn(
        cn(
          'border-card-border bg-card relative rounded-lg border p-0',
          displayNameLocation === 'bottom' ? 'h-[150px] w-[150px]' : 'py-2',
        ),
        onPress &&
          'hover:border-button hover:bg-button-light cursor-pointer transition-colors duration-300 ease-in-out',
        className,
      )}
      onClick={onPress}>
      <CardContent
        className={cn(
          'flex h-full items-center gap-4 p-4 py-2',
          displayNameLocation === 'bottom'
            ? 'flex-col justify-center'
            : 'flex-row',
        )}>
        {connectorConfig.connector?.logo_url && (
          <Image
            src={connectorConfig.connector.logo_url}
            alt="Logo"
            width={64}
            height={64}
            className="rounded-lg"
          />
        )}
        <p
          className={cn(
            'm-0 break-words text-sm font-semibold',
            displayNameLocation === 'bottom'
              ? 'w-full text-center'
              : 'text-left',
          )}>
          {connectorConfig.display_name ||
            titleCase(connectorConfig.connector?.name)}
        </p>
        {children}
      </CardContent>
    </Card>
  )
}
