'use client'

import type {ConnectorName} from '@openint/all-connectors/name'

import Image from 'next/image'
import {useState} from 'react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {getConnectorModel} from '@openint/api-v1/models'

export function ConnectorLogo({
  connectorName,
  className,
  width,
  height,
  forceFallback,
  skipFallbackText,
}: {
  connectorName: ConnectorName
  className?: string
  width?: number
  height?: number
  forceFallback?: boolean
  skipFallbackText?: boolean
}) {
  const def = defConnectors[connectorName]
  if (!def) {
    throw new Error('Connector ' + connectorName + ' not found')
  }
  const connector = getConnectorModel(def, {
    includeSchemas: true,
  })

  const fallbackLogoUrl = `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/openint-icon.svg`
  const [useFallbackImage, setUseFallbackImage] = useState(false)

  const fallbackText = skipFallbackText
    ? ''
    : (connectorName.split('-').length > 1
        ? connectorName
            .split('-')
            .map((word) => word[0])
            .join('')
        : connectorName
      )
        .substring(0, 2)
        .toUpperCase()
  return useFallbackImage || forceFallback ? (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
      <Image
        src={fallbackLogoUrl}
        alt={connectorName + ' logo'}
        width={(width ?? 48) - 20}
        height={(height ?? 48) - 20}
        className={className}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement!.innerHTML = `<span class="text-primary text-xs font-medium">${fallbackText}</span>`
        }}
      />
      <span className="text-muted-foreground text-xs">{fallbackText}</span>
    </div>
  ) : (
    <Image
      src={
        useFallbackImage
          ? fallbackLogoUrl
          : (connector.logo_url ?? fallbackLogoUrl)
      }
      alt={connectorName + ' logo'}
      width={width ?? 48}
      height={height ?? 48}
      className={className}
      onError={() => {
        if (!useFallbackImage) {
          setUseFallbackImage(true)
        }
      }}
    />
  )
}
