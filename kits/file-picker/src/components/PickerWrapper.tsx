import type React from 'react'
import type {ThemeColors} from '../types'

interface PickerWrapperProps {
  isOpen: boolean
  theme?: 'light' | 'dark'
  colors: ThemeColors
  children: React.ReactNode
}

export const PickerWrapper: React.FC<PickerWrapperProps> = ({
  isOpen,
  colors,
  children,
}) => {
  if (!isOpen) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }

  const contentStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    borderRadius: '8px',
    padding: '20px',
    position: 'relative',
    overflow: 'auto',
    color: colors.foreground,
  }

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        {children}
        {/* <img
          src="https://framerusercontent.com/images/aeaeDMT8rKTx1MFh1uUiKiM8M.svg?scale-down-to=512"
          alt="Powered by OpenInt"
          style={logoStyle}
        /> */}
      </div>
    </div>
  )
}
