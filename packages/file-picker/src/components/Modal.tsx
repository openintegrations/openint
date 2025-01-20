import {Transition} from '@headlessui/react'
import React, {CSSProperties, useEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import Logo from './Logo'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  isOpen: boolean
  className?: string
  style?: CSSProperties
  showAttribution?: boolean
}

export const Modal = React.forwardRef<HTMLDivElement, Props>(
  function Modal(props, ref) {
    const {
      children,
      onClose,
      isOpen,
      showAttribution,
      className = '',
      style = {},
      ...other
    } = props

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    const modalComponent = (
      <Transition show={isOpen}>
        <Transition.Child
          enter="transition ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div
            className="fixed inset-0 z-40 flex items-end bg-gray-400 bg-opacity-75 dark:bg-gray-600 sm:items-center sm:justify-center"
            data-testid="backdrop"
            onClick={onClose}>
            {showAttribution ? (
              <a
                className="absolute bottom-5 flex text-center text-sm text-gray-100 lg:left-5 xl:bottom-6 xl:left-6"
                href="https://openint.dev"
                target="_blank"
                rel="noopener noreferrer">
                Powered by OpenInt
              </a>
            ) : null}
            <Transition.Child
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 transform translate-y-1/4 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0  transform translate-y-1/4 scale-95"
              className={`dark-text-gray-400 no-scrollbar relative w-full overflow-hidden rounded-t-lg bg-white p-5 shadow-lg dark:bg-gray-800 sm:m-4 sm:max-w-xl sm:rounded-lg sm:p-6 ${className}`}
              style={{maxHeight: '90%', ...style}}
              ref={ref}
              role="dialog"
              id="modal-component"
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                e.stopPropagation()
              }
              {...other}>
              {children}
            </Transition.Child>
          </div>
        </Transition.Child>
      </Transition>
    )

    return mounted ? createPortal(modalComponent, document.body) : null
  },
)
