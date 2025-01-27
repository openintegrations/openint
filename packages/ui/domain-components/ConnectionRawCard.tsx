import {formatDistanceToNowStrict} from 'date-fns'
import {Landmark} from 'lucide-react'
import type {ZStandard} from '@openint/cdk'
import type {RouterOutput} from '@openint/engine-backend'
import {titleCase} from '@openint/util'
import {LoadingText} from '../components/LoadingText'
import {Badge, Card} from '../shadcn'
import {cn} from '../utils'
import type {ConnectorMeta, UIProps, UIPropsNoChildren} from './ConnectorCard'
import {ConnectorLogo} from './ConnectorCard'

type Connection = RouterOutput['listConnections'][number]

export const ConnectionRawCard = ({
  connection,
  connector,
  children,
  className,
  ...uiProps
}: UIProps & {
  connection: Connection
  connector: ConnectorMeta
}) => (
  <Card
    className={cn(
      'flex flex-row items-center justify-between p-6 shadow-[0_0_8px_rgba(0,0,0,0.03)]',
      className,
    )}>
    <div className="flex flex-row items-center space-x-4">
      <div className="inline-flex h-12 w-12 min-w-[48px] items-center justify-center rounded-xl border border-[#cbcbcb] bg-transparent">
        {connection.integration_id ? (
          <IntegrationLogo
            {...uiProps}
            integration={connection.integration}
            className="h-8 w-8"
          />
        ) : (
          <ConnectorLogo
            {...uiProps}
            connector={connector}
            className="h-8 w-8"
          />
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex h-6 items-center space-x-2 self-stretch">
          <h4 className="text-sm font-semibold tracking-[-0.01em] text-black antialiased">
            {connection.display_name ||
              connection.integration?.name ||
              titleCase(connection.connector_name) ||
              connection.connector_config_id ||
              '<TODO>'}
          </h4>
          <span className="rounded-full bg-gray-300 px-2 py-1 text-xs font-medium text-white">
            Primary
          </span>
          {(connection.sync_in_progress || connection.status) && (
            <Badge
              variant="secondary"
              className={cn(
                connection.status === 'healthy' && 'bg-green-200',
                connection.status === 'manual' && 'bg-blue-200',
                (connection.status === 'error' ||
                  connection.status === 'disconnected') &&
                  'bg-pink-200',
              )}>
              {
                connection.sync_in_progress ? 'Syncing' : connection.status
                // TODO: Implement the concept of a primary connection
                // || 'Primary'
              }
            </Badge>
          )}
        </div>
        <div className="text-black-mid truncate text-sm tracking-[-0.01em] antialiased">
          {connection.sync_in_progress ? (
            <LoadingText text="Syncing" />
          ) : connection.last_sync_completed_at ? (
            `Synced ${formatDistanceToNowStrict(
              new Date(connection.last_sync_completed_at),
              {addSuffix: true},
            )}`
          ) : (
            'No sync information'
          )}
        </div>
      </div>
    </div>
    {children}
  </Card>
)

export function IntegrationLogo({
  integration,
  className,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  Image = (props) => <img {...props} />,
}: UIPropsNoChildren & {
  integration?: ZStandard['integration'] | null | undefined
}) {
  return integration?.logo_url ? (
    <Image
      src={integration.logo_url}
      alt={`"${integration.name}" logo`}
      className={cn(
        'h-12 w-12 shrink-0 overflow-hidden object-contain',
        className,
      )}
    />
  ) : (
    <div
      className={cn(
        'flex h-12 shrink-0 items-center justify-center rounded-lg',
        className,
      )}>
      <Landmark />
    </div>
  )
}
