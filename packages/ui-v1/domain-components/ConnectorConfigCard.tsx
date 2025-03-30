import Image from 'next/image'
import type {ConnectorConfig} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util'

export interface ConnectorConfigCardProps {
  connectorConfig: ConnectorConfig<'connector'>
  onPress?: () => void
  className?: string
}

export function ConnectorConfigCard({
  connectorConfig,
  onPress,
  className,
}: ConnectorConfigCardProps) {
  return (
    <Card
      className={cn(
        'border-card-border bg-card relative h-[150px] w-[150px] rounded-lg border p-0',
        onPress &&
          'hover:border-button hover:bg-button-light cursor-pointer transition-colors duration-300 ease-in-out',
        className,
      )}
      onClick={onPress}>
      <CardContent className="flex h-full flex-col items-center justify-center p-4 py-2">
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          {connectorConfig.connector?.logo_url && (
            <Image
              src={connectorConfig.connector.logo_url}
              alt="Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
          )}
          <p className="m-0 w-full break-words text-center text-sm font-semibold">
            {connectorConfig.display_name ||
              titleCase(connectorConfig.connector?.name)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
