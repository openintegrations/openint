import {Transition} from '@headlessui/react'
import React, {Dispatch, SetStateAction} from 'react'
import {Connection} from '../types/Connection'
import Spinner from './Spinner'

interface Props {
  connections: Connection[]
  connection?: Connection
  setConnection: Dispatch<SetStateAction<Connection | undefined>>
  isLoading: boolean
}

const SelectConnection = ({
  connections,
  connection,
  setConnection,
  isLoading,
}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const statusColor = (connection: Connection) => {
    if (connection.disabled) return 'bg-gray-300'
    if (connection.standard?.status === 'healthy') return 'bg-green-400'
    return 'bg-yellow-400'
  }

  const handleClick = (connection: Connection) => {
    setConnection(connection)
    setIsMenuOpen(false)
  }

  const displayName =
    connection?.displayName ||
    connection?.integration?.name ||
    connection?.connector?.name ||
    undefined
  const logoUrl =
    connection?.integration?.logoUrl ||
    connection?.connector?.logoUrl ||
    undefined
  return (
    <div className="relative z-10 inline-block">
      <button
        className="hover:bg-cool-gray-200 focus:ring-offset-cool-gray-100 group flex w-full items-center justify-between rounded-md border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        style={{minWidth: 180}}
        data-testid="select-connection-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div>
          {/* TODO: replace with logo url */}
          {!isLoading && logoUrl && (
            <img
              className={`mr-2 inline-block h-6 w-6 rounded-full ${
                isLoading ? 'animate-spin opacity-20' : ''
              }`}
              src={!isLoading && logoUrl ? logoUrl : '/img/logo.png'}
              alt=""
            />
          )}
          {isLoading && <Spinner className="h-5 w-5" />}
          {!isLoading && <span>{displayName || 'No integrations'}</span>}
        </div>
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <Transition
        show={isMenuOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className="min-w-sm">
        <div className="border-cool-gray-200 divide-cool-gray-100 absolute right-0 z-10 mt-2 w-full origin-top-right divide-y rounded-md border bg-white outline-none">
          <div className="py-1">
            {connections?.map((connection: Connection, i: number) => {
              return (
                <div key={i}>
                  <div
                    onClick={() => handleClick(connection)}
                    data-testid={`select-connection-${i}`}
                    className={`${
                      false ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    } mx-2 flex min-w-0 cursor-pointer items-center justify-between overflow-hidden rounded-md py-0.5 ${
                      connection.disabled ? 'opacity-60' : ''
                    }`}>
                    <img
                      className="m-2 h-6 w-6 flex-shrink-0 rounded-full"
                      src={logoUrl}
                      alt=""
                    />
                    <span className="min-w-0 flex-1">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {displayName}
                      </span>
                    </span>

                    <span
                      className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white ${statusColor(
                        connection,
                      )}`}></span>
                  </div>
                </div>
              )
            })}
            <div>
              <div
                // NOTE: this used to be a network call
                // onClick={() => openToVault()}
                className={`${
                  false ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                } mx-2 flex min-w-0 cursor-pointer items-center justify-between overflow-hidden rounded-md py-0.5`}>
                <svg
                  className="m-2 h-6 w-6 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="min-w-0 flex-1">
                  <span className="truncate text-sm font-medium text-gray-900">
                    Add integration
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default SelectConnection
