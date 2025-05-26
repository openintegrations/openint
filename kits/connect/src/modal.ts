import {ConnectProps, createConnectIframe} from './common'

interface ModalInstance {
  open: () => void
  close: (isDestroying?: boolean) => void
  getIsOpen: () => boolean
  destroy: () => void
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

  const {width, height} = connectProps

  // --- Private utility functions ---
  const buildAndAttachModalDOM = () => {
    if (typeof document === 'undefined' || !document.body) {
      console.warn(
        '[createModal] Document or document.body not available for modal DOM creation.',
      )
      return // Cannot proceed without a document/body
    }

    modalOverlayElement = document.createElement('div')
    modalOverlayElement.id = 'openint-connect-embed-modal-overlay'
    Object.assign(modalOverlayElement.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '1000',
      display: 'none', // Initially hidden
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    })

    const modalContentElement = document.createElement('div')
    modalContentElement.id = 'openint-connect-embed-modal'
    Object.assign(modalContentElement.style, {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: width ? `${width}px` : '28rem',
      height: height ? `${height}px` : '700px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    })

    const iframeWrapperElement = createConnectIframe(connectProps)
    // Ensure iframe wrapper grows if modal content has auto height driven by min/max
    iframeWrapperElement.style.flexGrow = '1'
    iframeWrapperElement.style.minHeight = '0' // Prevent flexbox blowout issues with iframe

    modalContentElement.appendChild(iframeWrapperElement)
    modalOverlayElement.appendChild(modalContentElement)
    document.body.appendChild(modalOverlayElement)

    // Event listener for backdrop click
    modalOverlayElement.addEventListener('click', (event) => {
      if (event.target === modalOverlayElement) {
        instance.close() // This will trigger options.onClosed
      }
    })
  }

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      instance.close() // This will trigger options.onClosed
    }
  }

  // --- Initialize modal DOM immediately upon creation ---
  buildAndAttachModalDOM()

  // --- Public methods ---
  const instance: ModalInstance = {
    open: () => {
      if (isOpen || !modalOverlayElement) {
        // If modalOverlayElement is null, it means buildAndAttachModalDOM failed (e.g. no document.body)
        if (!modalOverlayElement) {
          console.error('[createModal] Cannot open modal: DOM not initialized.')
        }
        return
      }
      modalOverlayElement.style.display = 'flex'
      document.addEventListener('keydown', handleEscapeKey)
      isOpen = true
      // Style body to prevent scrolling when modal is open
      document.body.style.overflow = 'hidden'
    },
    close: (isDestroying = false) => {
      if (!isOpen || !modalOverlayElement) {
        return
      }
      modalOverlayElement.style.display = 'none'
      document.removeEventListener('keydown', handleEscapeKey)
      isOpen = false
      // Restore body scrolling
      document.body.style.overflow = 'auto'
      if (!isDestroying && options?.onClosed) {
        options.onClosed()
      }
    },
    getIsOpen: () => isOpen,
    destroy: () => {
      if (modalOverlayElement) {
        instance.close(true) // Pass true to suppress onClosed callback during destruction
        if (modalOverlayElement.parentNode === document.body) {
          document.body.removeChild(modalOverlayElement)
        }
        // createConnectIframe creates its own style tag and spinner, which are children of the wrapper.
        // Removing the wrapper (modalOverlayElement -> modalContentElement -> iframeWrapperElement) is sufficient.
      }
      modalOverlayElement = null // Allow for GC and prevent reuse
      // No need to clear iframeWrapperElement specifically as it's part of modalOverlayElement's children
    },
  }

  return instance
}
