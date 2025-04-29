import type {ConnectorName, Core} from '@openint/api-v1/models'

import {ChevronRight} from 'lucide-react'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge} from '@openint/shadcn/ui'
import {ConnectorLogo} from './ConnectorLogo'

export interface ConnectorDisplayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connector: Core['connector']
  mode?: 'card' | 'row'
  ctaText?: string
  onCtaClick?: () => void
  displayBadges?: boolean
}

/**
 * ConnectorDisplay component displays connector information with a logo and badges.
 * It uses the Badge component from shadcn/ui.
 *
 * The component is responsive and will adapt to different screen sizes.
 * It includes a hover effect with darker border and background to indicate it's clickable.
 */
const ConnectorDisplay = ({
  className,
  connector,
  mode = 'card',
  ctaText = 'Connect',
  onCtaClick,
  displayBadges = false,
  ...props
}: ConnectorDisplayProps) => {
  const {name, display_name} = connector
  const isRowMode = mode === 'row'

  return (
    // TODO: @snrondina: Refactor to use the proper card component from our library
    <div
      className={cn(
        'group flex cursor-pointer rounded-lg transition-all',
        isRowMode
          ? 'w-full flex-row items-center gap-4 px-2 py-1'
          : 'w-full flex-col items-start gap-4 border border-gray-200 p-2 hover:border-gray-400 hover:bg-gray-50',
        className,
      )}
      {...props}>
      <div
        className={cn(
          'flex items-center gap-4',
          isRowMode ? 'w-full flex-row justify-between' : 'w-full flex-row',
        )}>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 transition-all group-hover:border-gray-300 group-hover:bg-gray-100/50">
            <ConnectorLogo
              connectorName={name as ConnectorName}
              className="object-contain"
            />
          </div>
          <div className={cn(isRowMode ? 'flex flex-col' : 'flex-1')}>
            <h3 className="line-clamp-2 text-base font-semibold transition-colors group-hover:text-gray-900">
              {display_name || name}
            </h3>
            {displayBadges && (
              <div className="mt-1 flex flex-wrap gap-2">
                {connector.stage && (
                  <Badge
                    variant={connector.stage === 'ga' ? 'default' : 'secondary'}
                    className={cn(
                      connector.stage === 'ga' &&
                        'bg-green-100 text-green-800 hover:bg-green-200',
                      connector.stage === 'beta' &&
                        'bg-blue-100 text-blue-800 hover:bg-blue-200',
                      connector.stage === 'alpha' &&
                        'bg-pink-100 text-pink-800 hover:bg-pink-200',
                    )}>
                    {connector.stage.toUpperCase()}
                  </Badge>
                )}
                {connector.platforms?.map((platform) => (
                  <Badge
                    key={platform}
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {isRowMode && (
          <div className="ml-2 flex-shrink-0">
            <ChevronRight
              className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-all duration-200 ease-in-out group-hover:translate-x-0.5"
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      {/* CTA button removed */}
    </div>
  )
}

ConnectorDisplay.displayName = 'ConnectorDisplay'

export {ConnectorDisplay}

// Export the ConnectorBadges component so it can be used in stories
export const ConnectorBadges = ({
  stage,
  platforms,
  className,
}: {
  stage?: Core['connector']['stage']
  platforms?: Core['connector']['platforms']
  className?: string
}) => {
  // Create an array of all badges
  const allBadges = [
    ...(stage ? [{type: 'stage', value: stage}] : []),
    ...(platforms?.map((platform) => ({type: 'platform', value: platform})) ||
      []),
  ]

  // Number of badges to show on mobile
  const visibleBadgesCount = 2

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Show all badges on desktop */}
      <div className="hidden md:flex md:flex-wrap md:gap-2">
        {stage && (
          <Badge
            variant={stage === 'ga' ? 'default' : 'secondary'}
            className={cn(
              stage === 'ga' &&
                'bg-green-100 text-green-800 hover:bg-green-200',
              stage === 'beta' && 'bg-blue-100 text-blue-800 hover:bg-blue-200',
              stage === 'alpha' &&
                'bg-pink-100 text-pink-800 hover:bg-pink-200',
            )}>
            {stage.toUpperCase()}
          </Badge>
        )}
        {platforms?.map((platform) => (
          <Badge
            key={platform}
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Badge>
        ))}
      </div>

      {/* Show limited badges on mobile */}
      <div className="flex flex-wrap gap-2 md:hidden">
        {allBadges.slice(0, visibleBadgesCount).map((badge, index) => (
          <Badge
            key={index}
            variant={
              badge.type === 'stage' && badge.value === 'ga'
                ? 'default'
                : 'secondary'
            }
            className={cn(
              badge.type === 'stage' &&
                badge.value === 'ga' &&
                'bg-green-100 text-green-800 hover:bg-green-200',
              badge.type === 'stage' &&
                badge.value === 'beta' &&
                'bg-blue-100 text-blue-800 hover:bg-blue-200',
              badge.type === 'stage' &&
                badge.value === 'alpha' &&
                'bg-pink-100 text-pink-800 hover:bg-pink-200',
              badge.type === 'platform' &&
                'bg-gray-100 text-gray-800 hover:bg-gray-200',
            )}>
            {badge.type === 'stage'
              ? badge.value.toUpperCase()
              : badge.value.charAt(0).toUpperCase() + badge.value.slice(1)}
          </Badge>
        ))}

        {/* Show +X indicator if there are more badges */}
        {allBadges.length > visibleBadgesCount && (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-50 text-gray-500">
            +{allBadges.length - visibleBadgesCount}
          </Badge>
        )}
      </div>
    </div>
  )
}
