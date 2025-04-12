import type {Core} from '@openint/api-v1/models'

import {cn} from '@openint/shadcn/lib/utils'
import {Badge} from '@openint/shadcn/ui'

// Debug component to see what's in the data
const DebugData = ({data}: {data: any}) => (
  <div style={{display: 'none'}}>{JSON.stringify(data)}</div>
)

export const ConnectorTableCell = ({
  connector,
  showStage = true,
  showPlatforms = true,
}: {
  connector: Core['connector']
  showStage?: boolean
  showPlatforms?: boolean
}) => {
  // Add null check for connector
  if (!connector) {
    console.error('ConnectorTableCell received null connector')
    return <div>No connector data</div>
  }

  // For debugging
  console.log('ConnectorTableCell received connector:', connector)

  // Create a safe connector object with fallbacks for all required properties
  const safeConnector = {
    name: connector.name || 'unknown',
    display_name:
      connector.display_name || connector.name || 'Unknown Connector',
    logo_url: connector.logo_url || '',
    stage: connector.stage || 'ga',
    platforms: connector.platforms || [],
  }

  return (
    <div className="flex items-center gap-2">
      <DebugData data={connector} />
      {safeConnector.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeConnector.logo_url}
          alt={`${safeConnector.display_name} logo`}
          className="h-8 w-8 flex-shrink-0 rounded-xl object-contain"
        />
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
          {safeConnector.display_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="font-medium">{safeConnector.display_name}</div>
      {(showStage || showPlatforms) && (
        <div className="ml-2 flex gap-1">
          {showStage && safeConnector.stage && (
            <Badge
              variant="outline"
              className={cn(
                safeConnector.stage === 'ga' && 'bg-green-50 text-green-700',
                safeConnector.stage === 'beta' && 'bg-blue-50 text-blue-700',
                safeConnector.stage === 'alpha' && 'bg-pink-50 text-pink-700',
              )}>
              {safeConnector.stage}
            </Badge>
          )}
          {showPlatforms &&
            safeConnector.platforms?.map((platform: string, i: number) => (
              <Badge key={i} variant="secondary" className="bg-gray-100">
                {platform}
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}
