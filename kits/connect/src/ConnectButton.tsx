'use client'

import React from 'react'
import {ConnectProps, createConnectIframe} from './common'

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
}

export function ConnectButton({
  text = 'Manage Integrations',
  buttonStyle = {},
  ...props
}: ConnectButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const modalRef = React.useRef<HTMLDivElement>(null)
  const {token, baseURL, height, width, onEvent, className} = props

  React.useEffect(() => {
    if (!containerRef.current || !isOpen) return
    const iframeWrapper = createConnectIframe(props)
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(iframeWrapper)
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [token, baseURL, className, width, height, onEvent, props, isOpen])

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleEscapeKey)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen])

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

  const modalStyle = {
    backdropColor: 'rgba(0, 0, 0, 0.7)',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '28rem',
    minHeight: '50vh',
  }

  // Merge default styles with user provided styles
  const mergedButtonStyle = {
    ...defaultButtonStyles,
    ...buttonStyle,
  }

  // Generate final styles
  const styles = {
    button: {
      backgroundColor: mergedButtonStyle.backgroundColor,
      color: mergedButtonStyle.color || mergedButtonStyle.textColor,
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
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties,
    backdrop: {
      position: 'absolute',
      inset: 0,
      backgroundColor: modalStyle.backdropColor,
    } as React.CSSProperties,
    modalContent: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: modalStyle.width,
      maxHeight: '90vh',
      overflow: 'hidden',
      borderRadius: modalStyle.borderRadius,
      backgroundColor: modalStyle.backgroundColor,
      boxShadow: modalStyle.boxShadow,
    } as React.CSSProperties,
    iframeContainer: {
      width: '100%',
      minHeight: '50vh',
      overflow: 'auto',
    } as React.CSSProperties,
    closeButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      backgroundColor: 'transparent',
      color: '#4b5563',
      border: 'none',
      borderRadius: '0.25rem',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
      zIndex: 20,
      '&:hover': {
        backgroundColor: '#f3f4f6',
        color: '#111827',
      },
    } as React.CSSProperties,
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          ...styles.button,
        }}
        className={className}>
        {text}
      </button>

      {isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.backdrop} />
          <div ref={modalRef} style={styles.modalContent}>
            <div
              ref={containerRef}
              style={{
                ...styles.iframeContainer,
                height: height || 500,
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

ConnectButton.displayName = 'ConnectButton'
