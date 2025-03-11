import React from 'react'
import { cn } from '../utils'
import OAuthLabelType from './OAuthLabelType'
import ConnectorVerticalBadge from './VerticalBadge'
import ReleaseStage from './ReleaseStage'
import ConnectorVersion from './ConnectorVersion'
import ConnectorAudience from './ConnectorAudience'

export interface ConnectorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  logo: React.ReactNode;
  name: string;
  oauthType?: string;
  connectorType?: string;
  releaseStage?: string;
  connectorVersion?: string;
  connectorAudience?: string;
}

/**
 * ConnectorCard component displays connector information with a logo and badges.
 * It uses the custom badge components we created earlier:
 * - OAuthLabelType
 * - ConnectorType
 * - ReleaseStage
 * - ConnectorVersion
 * - ConnectorAudience
 * 
 * The component is responsive and will adapt to different screen sizes.
 * It includes a hover effect with darker border and background to indicate it's clickable.
 */
const ConnectorCard = React.forwardRef<HTMLDivElement, ConnectorCardProps>(
  ({ 
    className, 
    logo, 
    name, 
    oauthType, 
    connectorType, 
    releaseStage, 
    connectorVersion, 
    connectorAudience, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group flex items-center gap-6 rounded-lg border border-gray-200 p-6 w-full max-w-md md:max-w-lg transition-all cursor-pointer hover:border-gray-400 hover:bg-gray-50",
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 transition-all group-hover:border-gray-300 group-hover:bg-gray-100/50">
          {logo}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold group-hover:text-gray-900 transition-colors">{name}</h3>
          <div className="flex flex-wrap gap-2">
            {oauthType && (
              <OAuthLabelType variant={
                oauthType === 'oauth2' ? 'variant1' : 
                oauthType === 'aggregator' ? 'variant2' : 'default'
              }>
                {oauthType}
              </OAuthLabelType>
            )}
            
            {connectorType && (
              <ConnectorVerticalBadge variant={
                connectorType === 'CRM' ? 'variant1' : 
                connectorType === 'File Storage' ? 'variant2' : 'default'
              }>
                {connectorType}
              </ConnectorVerticalBadge>
            )}
            
            {releaseStage && (
              <ReleaseStage variant={
                releaseStage === 'GA' ? 'variant1' : 
                releaseStage === 'Beta' ? 'variant2' : 'default'
              }>
                {releaseStage}
              </ReleaseStage>
            )}
            
            {connectorVersion && (
              <ConnectorVersion variant={
                connectorVersion === 'V2' ? 'variant1' : 
                connectorVersion === 'V1' ? 'variant2' : 'default'
              }>
                {connectorVersion}
              </ConnectorVersion>
            )}
            
            {connectorAudience && (
              <ConnectorAudience variant={
                connectorAudience === 'B2B' ? 'variant1' : 
                connectorAudience === 'B2A' ? 'variant2' : 'default'
              }>
                {connectorAudience}
              </ConnectorAudience>
            )}
          </div>
        </div>
      </div>
    )
  }
)

ConnectorCard.displayName = 'ConnectorCard'

export { ConnectorCard } 