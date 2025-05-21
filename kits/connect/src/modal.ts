import {ConnectProps, createConnectIframe} from './common'

interface ModalInstance {
  open: () => void
  close: () => void
  getIsOpen: () => boolean
}

interface CreateModalOptions {
  onClosed?: () => void // Callback when modal is closed by user action (ESC, backdrop)
}

export function createModal(
  connectProps: ConnectProps,
  options?: CreateModalOptions,
): ModalInstance {
  let isOpen = false
  let modalOverlayElement: HTMLDivElement | null = null
  let modalContentElement: HTMLDivElement | null = null
  let iframeContainerElement: HTMLDivElement | null = null
  let iframeWrapperElement: HTMLDivElement | null = null // To hold the output of createConnectIframe

  const {width, height} = connectProps // Use these for modal sizing if provided

  // --- Private utility functions ---
  const buildModalDOM = () => {
    modalOverlayElement = document.createElement('div')
    Object.assign(modalOverlayElement.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '1000', // High z-index
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Backdrop color
    })

    modalContentElement = document.createElement('div')
    Object.assign(modalContentElement.style, {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: width ? `${width}px` : '28rem', // Use connectProps.width if available
      height: height ? `${height}px` : '50vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    })

    iframeContainerElement = document.createElement('div')
    Object.assign(iframeContainerElement.style, {
      width: '100%',
      height: height ? `${height}px` : '100%', // If height is specified, use it, else take full content height
      minHeight: '50vh',
      overflow: 'auto',
      flexGrow: '1',
    })

    modalContentElement.appendChild(iframeContainerElement)
    modalOverlayElement.appendChild(modalContentElement)

    // Event listener for backdrop click
    modalOverlayElement.addEventListener('click', (event) => {
      if (event.target === modalOverlayElement) {
        // Make sure click is on backdrop, not content
        instance.close()
        options?.onClosed?.()
      }
    })
  }

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      instance.close()
      options?.onClosed?.()
    }
  }

  // --- Public methods ---
  const instance: ModalInstance = {
    open: () => {
      if (isOpen || !document.body) {
        return
      }
      if (!modalOverlayElement) {
        buildModalDOM() // Create DOM elements if they don't exist
      }
      if (modalOverlayElement && iframeContainerElement) {
        // Clear previous iframe if any (e.g., if open() is called multiple times without close)
        iframeContainerElement.innerHTML = ''
        iframeWrapperElement = createConnectIframe(connectProps)
        iframeContainerElement.appendChild(iframeWrapperElement)

        document.body.appendChild(modalOverlayElement)
        document.addEventListener('keydown', handleEscapeKey)
        isOpen = true
        // Style body to prevent scrolling when modal is open
        document.body.style.overflow = 'hidden'
      } else {
        console.error('[createModal] Modal DOM elements not found.')
      }
    },
    close: () => {
      if (!isOpen || !modalOverlayElement || !document.body) {
        return
      }
      if (modalOverlayElement.parentNode === document.body) {
        document.body.removeChild(modalOverlayElement)
      }
      // Clean up iframe resources if necessary (createConnectIframe might add its own listeners)
      // For now, simply removing it from DOM. If createConnectIframe adds global listeners,
      // it would need its own cleanup function that could be called here.
      if (iframeContainerElement) {
        iframeContainerElement.innerHTML = '' // Clear iframe
      }
      iframeWrapperElement = null

      document.removeEventListener('keydown', handleEscapeKey)
      isOpen = false
      // Restore body scrolling
      document.body.style.overflow = 'auto'
    },
    getIsOpen: () => isOpen,
  }

  return instance
}
