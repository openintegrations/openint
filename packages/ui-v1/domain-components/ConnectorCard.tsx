import React from 'react'
import type {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge} from '@openint/shadcn/ui'
import type {ConnectorTemporary} from './__stories__/fixtures'

export interface ConnectorCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connector: ConnectorTemporary
}

/**
 * ConnectorCard component displays connector information with a logo and badges.
 * It uses the Badge component from shadcn/ui.
 *
 * The component is responsive and will adapt to different screen sizes.
 * It includes a hover effect with darker border and background to indicate it's clickable.
 */
const ConnectorCard = ({
  className,
  connector,
  ...props
}: ConnectorCardProps) => {
  const {name, logo_url, display_name} = connector

  return (
    <div
      className={cn(
        'group flex w-full max-w-md cursor-pointer items-center gap-6 rounded-lg border border-gray-200 p-6 transition-all hover:border-gray-400 hover:bg-gray-50 md:max-w-lg',
        className,
      )}
      {...props}>
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 transition-all group-hover:border-gray-300 group-hover:bg-gray-100/50">
        {logo_url && (
          <img
            src={logo_url}
            alt={`${name} logo`}
            className="h-12 w-12 object-contain"
          />
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold transition-colors group-hover:text-gray-900">
          {display_name || name}
        </h3>
        <ConnectorBadges connector={connector} />
      </div>
    </div>
  )
}

ConnectorCard.displayName = 'ConnectorCard'

export {ConnectorCard}

// Export the ConnectorBadges component so it can be used in stories
export const ConnectorBadges = ({
  connector: {stage, platforms},
}: {
  connector: Core['connector']
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
    <div className="flex flex-wrap gap-2">
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
