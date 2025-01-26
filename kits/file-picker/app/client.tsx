'use client'

import {UnifiedFilePicker} from '../src/UnifiedFilePicker'

interface FilePickerProps {
  magicLink: string
}

export function Client({magicLink}: FilePickerProps) {
  return (
    <UnifiedFilePicker
      auth={{
        openIntFilePickerMagicLink: magicLink,
      }}
      options={{
        isOpen: true,
        onClose: () => console.log('File picker closed'),
        onSelect: (files) => console.log('Selected files:', files),
        theme: 'light',
        multiselect: true,
        folderSelect: false,
      }}
    />
  )
}
