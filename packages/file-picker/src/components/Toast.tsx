import React, { useEffect, useState } from 'react'

import { Toast as Props } from '../types/Toast'
import { Transition } from '@headlessui/react'
import { useToast } from '../utils/useToast'

export const Toast: React.FC<Props> = ({
  title,
  description,
  type = 'info',
  id,
  autoClose,
  closeAfter,
  closeText,
  image
}) => {
  const [shouldShow, setShouldShow] = useState(false)
  const { removeToast } = useToast()

  useEffect(() => {
    if (!shouldShow) setShouldShow(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (autoClose || closeAfter) {
      const timer = setTimeout(() => {
        setShouldShow(false)
        setTimeout(() => {
          removeToast(id)
        }, 300)
      }, closeAfter || 3500)
      return () => {
        clearTimeout(timer)
      }
    }
    return
  }, [id, removeToast, autoClose])

  const icon = {
    info: (
      <svg
        className="w-6 h-6 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        data-testid="icon"
      >
        <path
          d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-6 h-6 text-green-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        data-testid="icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-6 h-6 text-yellow-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        data-testid="icon"
      >
        <path
          d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-6 h-6 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        data-testid="icon"
      >
        <path
          d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const borderStyle = {
    success: 'border-green-400',
    warning: 'border-yellow-500',
    error: 'border-red-400',
    info: 'border-indigo-400'
  }

  return (
    <div
      className="flex items-end justify-end w-full px-4 pointer-events-none top-3 right-3"
      key={id}
    >
      <Transition
        show={shouldShow}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className={`w-full bg-white dark:bg-gray-800 border-l-2 rounded-md shadow-lg pointer-events-auto ${borderStyle[type]}`}
        style={{ width: 'calc(100% - 120px)', left: 60 }}
        data-testid="toast"
      >
        <div className="flex overflow-hidden rounded-lg shadow-xs">
          <div className="flex flex-col justify-center w-full p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">{icon[type]}</div>
              <div className="ml-2 w-0 flex-1 pt-0.5 overflow-hidden">
                <p className="text-sm font-medium leading-5 text-gray-900 dark:text-white">
                  {title}
                </p>
                {description ? (
                  <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-300">
                    {description}
                  </p>
                ) : null}
                {image ? <img src={image} className="mt-2 rounded-md" /> : null}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 group">
            <button
              className="flex items-center justify-center w-full p-3 text-sm font-medium text-gray-600 border border-transparent rounded-none rounded-r-lg hover:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300"
              onClick={() => removeToast(id)}
              data-testid="remove"
            >
              {closeText ? (
                <span>{closeText}</span>
              ) : (
                <svg
                  className="text-gray-400 fill-current w-7 h-7 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-100"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                >
                  <path d="M16.24 14.83a1 1 0 0 1-1.41 1.41L12 13.41l-2.83 2.83a1 1 0 0 1-1.41-1.41L10.59 12 7.76 9.17a1 1 0 0 1 1.41-1.41L12 10.59l2.83-2.83a1 1 0 0 1 1.41 1.41L13.41 12l2.83 2.83z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  )
}
