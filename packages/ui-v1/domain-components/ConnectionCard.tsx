/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import {Settings} from 'lucide-react'
import Image from 'next/image'
import {useState} from 'react'
import type {ConnectionExpanded} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent} from '@openint/shadcn/ui'

export interface ConnectionCardProps {
  connection: ConnectionExpanded<'integration' | 'connector'>
  onPress?: () => void
  className?: string
}

export function ConnectionCard({
  connection,
  onPress,
  className,
}: ConnectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const logoUrl =
    connection.integration?.logo_url || connection.connector?.logo_url

  const displayName =
    connection.integration?.name || connection.connector?.display_name

  return (
    <Card
      className={cn(
        'border-card-border bg-card hover:border-button hover:bg-button-light relative h-[150px] w-[150px] cursor-pointer rounded-lg border p-0 transition-colors duration-300 ease-in-out',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <CardContent
        className="flex h-full flex-col items-center justify-center p-4 py-2"
        onClick={onPress}>
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          {isHovered ? (
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
              <p className="m-0 max-w-[100px] truncate text-center text-sm font-semibold">
                {displayName}
              </p>
              {/*

              {conn.status !== 'healthy' && (
                <p
                  className={`text-center text-sm ${
                    reconnectId ? 'text-button' : 'text-red-500'
                  }`}>
                  {reconnectId ? 'Processing...' : 'Reconnect Required'}
                </p>
              )} */}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
