import {zFrameMessage, type FrameMessage} from './common'

// TODO: import {SelectedFile} from '@openint/open-file-picker'
export type SelectedFile = {
  id: string
  name: string
  type: 'file' | 'folder'
  driveId: string | null
  driveGroupId: string | null
}

export const OpenIntFrontend = {
  // TODO: import {Event as OpenIntEvent, zEvent} from '@openint/events'
  listenConnectEvents: (callback: (event: any) => void) => {
    // Try to find specific iframe first
    const targetFrame =
      (window.frames as unknown as Record<string, Window>)[
        'openint-connect-frame'
      ] ||
      // @ts-expect-error
      window.document.getElementById('openint-connect-frame')?.contentWindow ||
      window.frames[0] // Fallback to first iframe if specific frame not found

    if (targetFrame) {
      // Send to specific iframe if found
      targetFrame.postMessage('openIntListen', '*')
    } else {
      // Fall back to sending to all windows
      window.postMessage('openIntListen', '*')
    }

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'openIntEvent') {
        callback(event.data.event)
        return
      }

      callback(event.data)
    })
  },
  openMagicLink: async ({url}: {url: string}) => {
    const features = {
      ...popupLayout(500, 600),
      scrollbars: 'yes',
      resizable: 'yes',
      status: 'no',
      toolbar: 'no',
      location: 'no',
      copyhistory: 'no',
      menubar: 'no',
      directories: 'no',
      popup: 'true',
    }
    const popup = window.open(url, '_blank', featuresToString(features))

    return new Promise<Extract<FrameMessage, {type: 'SUCCESS'}>['data']>(
      (resolve, reject) => {
        const listener: Parameters<
          typeof window.addEventListener<'message'>
        >[1] = (event) => {
          const res = zFrameMessage.safeParse(event.data)
          if (!res.success) {
            console.warn('Ignoring invalid message from popup', event.data)
            return
          }
          window.removeEventListener('message', listener)
          popup?.close()
          if (res.data.type === 'SUCCESS') {
            resolve(res.data.data)
          } else {
            reject(new Error(`${res.data.data.code}: ${res.data.data.message}`))
          }
        }
        window.addEventListener('message', listener)
      },
    )
  },
  openFilePicker: async ({
    url,
    onSelect,
    onClose,
    container,
  }: {
    url: string
    onSelect?: (files: SelectedFile[]) => void
    onClose?: () => void
    container?: HTMLElement
  }) => {
    let popup: Window | null = null
    let iframe: HTMLIFrameElement | null = null

    if (container) {
      // Create and insert iframe if container is provided
      iframe = document.createElement('iframe')
      iframe.src = url
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = 'none'
      container.appendChild(iframe)
    } else {
      // Use popup if no container provided
      const features = {
        ...popupLayout(500, 600),
        scrollbars: 'yes',
        resizable: 'yes',
        status: 'no',
        toolbar: 'no',
        location: 'no',
        copyhistory: 'no',
        menubar: 'no',
        directories: 'no',
        popup: 'true',
      }
      popup = window.open(url, '_blank', featuresToString(features))
    }

    return new Promise<void>((resolve) => {
      const listener: Parameters<
        typeof window.addEventListener<'message'>
      >[1] = (event) => {
        if (event.data.type === 'onFilePickerSelect') {
          if (onSelect) {
            onSelect(event.data.files)
          }
          return
        }

        if (event.data.type === 'onFilePickerClose') {
          if (onClose) {
            onClose()
            popup?.close()
            if (iframe) {
              iframe.remove()
            }
            window.removeEventListener('message', listener)
            resolve()
          }
          return
        }
      }
      window.addEventListener('message', listener)
    })
  },
  listenFilePicker: ({
    onSelect,
    onClose,
  }: {
    onSelect?: (files: SelectedFile[]) => void
    onClose?: () => void
  }) => {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'onFilePickerSelect') {
        onSelect?.(event.data.files)
      }
      if (event.data.type === 'onFilePickerClose') {
        onClose?.()
      }
    })
  },
}

function popupLayout(expectedWidth: number, expectedHeight: number) {
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const left = screenWidth / 2 - expectedWidth / 2
  const top = screenHeight / 2 - expectedHeight / 2

  const width = Math.min(expectedWidth, screenWidth)
  const height = Math.min(expectedHeight, screenHeight)

  return {
    left: Math.max(left, 0),
    top: Math.max(top, 0),
    width,
    height,
  }
}

/** Helper for window.open() */
function featuresToString(features: Record<string, string | number>) {
  return Object.entries(features)
    .map(([key, value]) => `${key}=${value}`)
    .join(',')
}
