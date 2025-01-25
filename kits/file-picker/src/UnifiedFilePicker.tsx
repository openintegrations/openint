'use client'

import type React from 'react'
import {useEffect, useState} from 'react'
import {PickerWrapper} from './components/PickerWrapper'
import {Spinner} from './components/Spinner'
import {fetchConnectionDetails} from './config'
import {GoogleDrivePicker, SharePointPicker} from './pickers'
import {
  defaultThemeColors,
  type AuthObject,
  type ConnectionDetails,
  type FilePickerOptions,
  type ThemeColors,
} from './types'

type PickerHandlers = {
  onClose?: () => void
  onSelect?: (files: any[]) => void
  setIsOpen?: (isOpen: boolean) => void
}

const usePostMessagePickerHandlers = () => {
  const [handlers, setPickerHandlers] = useState<PickerHandlers>({})

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SET_PICKER_HANDLERS') {
        setPickerHandlers((currentHandlers) => ({
          ...currentHandlers,
          ...event.data.handlers,
        }))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return handlers
}

export const UnifiedFilePicker: React.FC<{
  auth: AuthObject
  options: FilePickerOptions
}> = ({auth, options}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null)
  const [isLocalOpen, setIsLocalOpen] = useState(options.isOpen)

  // Get the latest handlers from postMessage
  const pickerHandlers = usePostMessagePickerHandlers()

  // Use the event handlers if they exist, otherwise fall back to props
  const handlers = {
    onClose: pickerHandlers.onClose || options.onClose,
    onSelect: pickerHandlers.onSelect || options.onSelect,
    setIsOpen: pickerHandlers.setIsOpen || setIsLocalOpen,
  }

  useEffect(() => {
    if (handlers.setIsOpen) {
      handlers.setIsOpen(options.isOpen ?? true)
    }
  }, [options.isOpen, handlers.setIsOpen])

  const handleClose = () => {
    handlers.setIsOpen(false)
    handlers.onClose?.()
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        const details = await fetchConnectionDetails(auth)
        setConnectionDetails(details)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize file picker:', error)
      }
    }

    initialize()
  }, [auth])

  // const themeColors =
  //   options.theme === "light" ? defaultThemeColors : defaultDarkThemeColors;
  const mergedColors = {
    ...defaultThemeColors,
    ...options.colors,
  } as ThemeColors

  if (!isInitialized && isLocalOpen) {
    return (
      <PickerWrapper
        isOpen={isLocalOpen}
        theme={options.theme}
        colors={mergedColors}>
        <div className="flex h-full items-center justify-center">
          <Spinner color={mergedColors.accent} />
        </div>
      </PickerWrapper>
    )
  }

  if (!isLocalOpen || !connectionDetails) {
    return null
  }

  return (
    <PickerWrapper
      isOpen={isLocalOpen}
      theme={options.theme}
      colors={mergedColors}>
      {connectionDetails.type === 'sharepoint' ? (
        <SharePointPicker
          connectionDetails={connectionDetails}
          options={options}
          themeColors={mergedColors}
          onClose={handleClose}
        />
      ) : (
        <GoogleDrivePicker
          connectionDetails={connectionDetails}
          options={options}
          themeColors={mergedColors}
          onClose={handleClose}
        />
      )}
    </PickerWrapper>
  )
}
