'use client'

import React from 'react'
import {ConnectProps} from './common'
import {createModal} from './modal'

interface ButtonStyleProps {
  backgroundColor?: string
  hoverBackgroundColor?: string
  textColor?: string
  fontSize?: string | number
  padding?: string
  borderRadius?: string
  fontWeight?: number | string
  boxShadow?: string
}

interface ConnectButtonProps extends ConnectProps {
  text?: string
  buttonStyle?: ButtonStyleProps
  dismissOnConnectionConnected?: boolean
}

export function ConnectButton({
  text = 'Manage Integrations',
  dismissOnConnectionConnected = true,
  buttonStyle = {},

  ...connectProps
}: ConnectButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const modalInstanceRef = React.useRef<ReturnType<typeof createModal> | null>(
    null,
  )

  // Effect to manage the modal instance lifecycle based on isOpen and props
  React.useEffect(() => {
    // Initialize modal instance when props are available or change significantly
    // The connectProps object itself might be recreated on each render by the parent,
    // so we stringify it or list its key dependencies if stability is an issue.
    // For now, we assume connectProps are stable or change when iframe needs to be different.
    if (typeof document !== 'undefined') {
      // Ensure this only runs client-side
      modalInstanceRef.current = createModal(
        {
          ...connectProps,
          onEvent: (event, unsubscribe) => {
            connectProps.onEvent?.(event, unsubscribe)
            if (
              dismissOnConnectionConnected &&
              event.name === 'connect.connection-connected'
            ) {
              modalInstanceRef.current?.close()
              setIsOpen(false)
            }
          },
        },
        {
          onClosed: () => {
            console.log(
              '[ConnectButton ModalEffect]: Modal closed by user action (ESC/backdrop).',
            )
            setIsOpen(false)
          },
        },
      )
    }

    // Cleanup function to close the modal if the component unmounts while modal is open
    return () => {
      if (modalInstanceRef.current) {
        console.log(
          '[ConnectButton Cleanup]: Component unmounting or props changed, destroying modal.',
        )
        modalInstanceRef.current.destroy()
        modalInstanceRef.current = null // Clear the ref
      }
    }
    // Re-create modal if connectProps change. A more granular dependency array might be needed
    // depending on how connectProps are managed by the parent component.
    // Using JSON.stringify is a common way to react to deep changes in an object prop.
  }, [JSON.stringify(connectProps)]) // Re-run if connectProps change

  // Effect to open/close modal based on React's isOpen state
  React.useEffect(() => {
    if (isOpen) {
      console.log(
        '[ConnectButton ModalEffect]: isOpen is true, attempting to open modal.',
      )
      modalInstanceRef.current?.open()
    } else {
      // This handles cases where isOpen is set to false by React (e.g. parent component)
      // or after being closed by onClosed callback and state is synced.
      if (modalInstanceRef.current?.getIsOpen()) {
        console.log(
          '[ConnectButton ModalEffect]: isOpen is false, attempting to close modal.',
        )
        modalInstanceRef.current.close()
      }
    }
  }, [isOpen]) // Only depends on isOpen for opening/closing actions

  // Default styles
  const defaultButtonStyles = {
    backgroundColor: 'hsl(var(--secondary, 215 20% 65%))',
    color: 'hsl(var(--secondary-foreground, 215 20% 15%))',
    hoverBackgroundColor: 'hsl(var(--secondary-hover, 215 20% 55%))',
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    boxShadow:
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  }

  const mergedButtonStyle = {
    ...defaultButtonStyles,
    ...buttonStyle,
  }

  const styles = {
    button: {
      backgroundColor: mergedButtonStyle.backgroundColor,
      color: mergedButtonStyle.textColor || mergedButtonStyle.color,
      borderRadius: mergedButtonStyle.borderRadius,
      padding: mergedButtonStyle.padding,
      fontSize: mergedButtonStyle.fontSize,
      lineHeight: '1.25rem',
      fontWeight: mergedButtonStyle.fontWeight,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease-in-out',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: mergedButtonStyle.boxShadow,
      '&:hover': {
        backgroundColor: mergedButtonStyle.hoverBackgroundColor,
      },
      '&:focus-visible': {
        outline: `2px solid ${mergedButtonStyle.backgroundColor}`,
        outlineOffset: '2px',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    } as React.CSSProperties,
  }

  return (
    <button
      onClick={() => {
        console.log(
          '[ConnectButton Click]: Button clicked, setting isOpen to true.',
        )
        setIsOpen(true)
      }}
      style={styles.button}
      className={connectProps.className}>
      {text}
    </button>
  )
}

ConnectButton.displayName = 'ConnectButton'
