import { Transition } from '@headlessui/react'
import React, { Fragment, ReactNode } from 'react'

interface Props {
  open: boolean
  children: ReactNode
}

const SlideOver = ({ open, children }: Props) => {
  const desktopStyles = { width: 'calc(100% - 3rem)', left: '1.5rem' }
  const mobileStyles = { width: 'calc(100% - 2rem)', left: '1rem' }

  return (
    <Transition show={open} as={Fragment}>
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl"
        style={window?.innerWidth > 768 ? desktopStyles : mobileStyles}
      >
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-y-full"
          enterTo="translate-y-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-y-0"
          leaveTo="translate-y-full"
        >
          <div className="relative w-full rounded-t-2xl">
            <div className="flex flex-col h-full py-6 overflow-y-auto border border-gray-200 rounded-t-lg shadow-sm bg-gray-50">
              <div className="relative flex-1 px-4 sm:px-6">{children}</div>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  )
}

export default SlideOver
