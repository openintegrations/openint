import {type SelectedFile} from '@openint/open-file-picker/dist/types'
import {zFrameMessage, type FrameMessage} from './common'

export const OpenIntFrontend = {
  // TODO: import {Event as OpenIntEvent, zEvent} from '@openint/events'
  listen: (callback: (event: any) => void) => {
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
  }: {
    url: string
    onSelect?: (files: SelectedFile[]) => void
    onClose?: () => void
  }) => {
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
          if (event.data.type === 'onFilePickerSelect') {
            // Call user-provided onSelect callback if it exists
            if (onSelect) {
              onSelect(event.data.files)
            }
            return
          }

          if (event.data.type === 'onFilePickerClose') {
            // Call user-provided onClose callback if it exists
            if (onClose) {
              onClose()
            }
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
