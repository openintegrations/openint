import React, { Fragment } from 'react'

import { File } from '../types/File'
import { Transition } from '@headlessui/react'

interface Props {
  folders: File[]
  handleClick: (file?: File) => void
}

const Breadcrumbs = ({ folders, handleClick }: Props) => {
  return (
    <Fragment>
      <div className="flex items-center text-sm">
        <button className="text-gray-600 hover:text-gray-900" onClick={() => handleClick()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block w-5 h-5 text-yellow-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          </svg>
        </button>
        {folders.map((folder, i) => {
          return (
            <Transition
              show={true}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-60"
              enterTo="transform opacity-100"
              leave="transition ease-in duration-200"
              leaveFrom="transform opacity-100"
              leaveTo="transform opacity-0"
              key={i}
            >
              <Transition.Child
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-60 translate-x-1"
                enterTo="transform opacity-100"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
                className="flex items-center"
                as="div"
                key={folder.id}
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {i === folders.length - 1 ? (
                  <span className="font-medium text-gray-900">{folder.name}</span>
                ) : (
                  <button
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => handleClick(folder)}
                  >
                    {folder.name}
                  </button>
                )}
              </Transition.Child>
            </Transition>
          )
        })}
      </div>
    </Fragment>
  )
}

export default Breadcrumbs
