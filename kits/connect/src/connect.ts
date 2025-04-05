import React from 'react'
import {createRoot} from 'react-dom/client'
import {ConnectEmbed, ConnectEmbedProps} from './ConnectEmbed'
import {createConnectModal} from './dialog'

export const Connect = {
  embed: (
    props: ConnectEmbedProps & {containerRef: React.RefObject<HTMLDivElement>},
  ) => {
    if (props.containerRef.current) {
      const embedElement = React.createElement(ConnectEmbed, props)
      const root = createRoot(props.containerRef.current)
      root.render(embedElement)
    } else {
      console.error(
        `Connect embed: containerRef is not found for ${props.containerRef}`,
      )
    }
  },
  modal: (props: ConnectEmbedProps) => {
    const controller = createConnectModal(props)
    return controller.setOpen
  },
}
