import React from 'react'
import {createRoot} from 'react-dom/client'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@openint/shadcn/ui/dialog'
import {ConnectEmbed, ConnectEmbedProps} from './ConnectEmbed'

export interface ModalController {
  setOpen: (open: boolean) => void
  destroy: () => void
}

export function createConnectModal(props: ConnectEmbedProps): ModalController {
  const containerDiv = document.createElement('div')
  document.body.appendChild(containerDiv)
  const root = createRoot(containerDiv)

  let setIsOpen: (open: boolean) => void

  const ModalWrapper = () => {
    const [isOpen, setIsOpenState] = React.useState(false)
    setIsOpen = setIsOpenState

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/30" />
          <DialogContent
            className={cn(
              'fixed inset-0 flex items-center justify-center p-4',
            )}>
            <DialogClose className="absolute right-4 top-4 text-white hover:opacity-70">
              ✕
            </DialogClose>
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <ConnectEmbed {...props} />
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    )
  }

  root.render(<ModalWrapper />)

  return {
    setOpen: (open: boolean) => setIsOpen(open),
    destroy: () => {
      root.unmount()
      containerDiv.remove()
    },
  }
}
