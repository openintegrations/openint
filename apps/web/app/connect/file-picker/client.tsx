'use client'

import {useCallback, useEffect, useState} from 'react'
import {UnifiedFilePicker} from '@openint/open-file-picker'

export function FilePickerClient() {
  const [magicLink, setMagicLink] = useState<string>('')

  useEffect(() => {
    setMagicLink(window.location.href)
  }, [])

  const onSelect = useCallback((files: any[]) => {
    window.parent.postMessage({type: 'onFilePickerSelect', files}, '*')
  }, [])

  const onClose = useCallback(() => {
    window.parent.postMessage({type: 'onFilePickerClose'}, '*')
  }, [])

  if (!magicLink) {
    return null
  }

  return (
    <UnifiedFilePicker
      auth={{
        openIntFilePickerMagicLink: magicLink,
      }}
      options={{
        // do we need this in the magic link renderer?
        // isOpen: true,
        onClose,
        onSelect,
      }}
    />
  )
}
