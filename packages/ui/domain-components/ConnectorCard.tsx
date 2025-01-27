import React, {useState} from 'react'
import type {Id} from '@openint/cdk'
import type {RouterOutput} from '@openint/engine-backend'
import {R} from '@openint/util'
import {Badge, Card} from '../shadcn'
import {cn} from '../utils'

/** Can be img or next/image component */
export type ImageComponent = React.FC<
  Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    'loading' | 'ref'
  >
>

export interface UIPropsNoChildren {
  className?: string
  Image?: ImageComponent
}

export interface UIProps extends UIPropsNoChildren {
  children?: React.ReactNode
}

export type ConnectorMeta = RouterOutput['listConnectorMetas'][string]

export const ConnectorConfigCard = ({
  connectorConfig: ccfg,
  ...props
}: React.ComponentProps<typeof ConnectorCard> & {
  connectorConfig: {
    id: Id['ccfg']
    connectorName: string
    config?: Record<string, unknown> | null
    envName?: string | null
    disabled?: boolean
  }
}) => (
  <ConnectorCard
    {...props}
    showName={false}
    labels={R.compact([ccfg.envName, ccfg.disabled && 'disabled'])}
  />
)

// Utility function to capitalize the first letter
const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const ConnectorCard = ({
  connector,
  showStageBadge = false,
  showName = true,
  labels = [],
  className,
  children,
  ...uiProps
}: UIProps & {
  connector: ConnectorMeta
  showStageBadge?: boolean
  labels?: string[]
  showName?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        'relative m-3 flex h-[150px] w-[150px] flex-col items-center justify-center p-2',
        'border-card-border border',
        'transition duration-300 ease-in-out',
        isHovered ? 'border-button bg-button-light' : '',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {showStageBadge && (
        <Badge
          variant="secondary"
          className={cn(
            'absolute right-2 top-2',
            connector.stage === 'ga' && 'bg-green-200',
            connector.stage === 'beta' && 'bg-blue-200',
            connector.stage === 'alpha' && 'bg-pink-50',
          )}>
          {connector.stage}
        </Badge>
      )}
      {!isHovered && (
        <div className="flex flex-col items-center">
          <ConnectorLogo
            {...uiProps}
            connector={connector}
            className="min-h-0 grow"
          />
          {showName && (
            <span className="text-center text-sm font-semibold text-muted-foreground">
              {capitalizeFirstLetter(connector.name)}
            </span>
          )}
        </div>
      )}
      {isHovered && children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </Card>
  )
}

export const ConnectorLogo = ({
  connector,
  className,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  Image = (props) => <img {...props} />,
}: UIPropsNoChildren & {
  connector: ConnectorMeta
}) =>
  connector.logo_url ? (
    <Image
      width={48}
      height={48}
      src={connector.logo_url}
      alt={`"${connector.display_name}" logo`}
      className={cn('h-12 w-12 rounded-xl object-contain', className)}
      style={{marginBottom: '10px', objectFit: 'contain'}}
    />
  ) : (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <span>{connector.display_name}</span>
    </div>
  )
