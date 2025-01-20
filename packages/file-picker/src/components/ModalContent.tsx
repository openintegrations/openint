import React, { FC, useState } from 'react'

import useSWR from 'swr'
import { Connection } from '../types/Connection'
import { File } from '../types/File'
import { ToastProvider } from '../utils/useToast'
import FilesContainer from './FilesContainer'
import { initOpenIntSDK } from '@opensdks/sdk-openint'
import SelectConnection from './SelectConnection'
export interface Props {
  /**
   * The JSON Web Token to authorize the Connect session
   */
  connectToken: string
  /**
   * The function that gets called when a file is selected
   */
  onSelect: (files: File[]) => any

  /**
   * Title shown in the modal
   */
  title?: string
  /**
   * Subtitle shown in the modal
   */
  subTitle?: string
}

const whitelistedIntegrations = ['int_google_drive', 'int_microsoft_sharepoint']

export const ModalContent: FC<Props> = ({ connectToken, onSelect, title }) => {
  const [connection, setConnection] = useState<Connection | undefined>(undefined)
  const getConnections = async () => {
    const openInt = await initOpenIntSDK({
      token: connectToken,
      headers: {
        'x-apikey': 'foo'
      }

      // auth: {
      //   openInt: {
      //     token: connectToken
      //   }
      // },
      // headers: {
      //   'x-apikey': 'foo'
      // }
    })
    try {
      const connections = await openInt.GET('/core/connection')

      const fsConnections = connections?.data?.filter((connection: any) =>
        whitelistedIntegrations.includes(connection.integration_id)
      ) as Connection[]

      return {
        data: fsConnections,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error
      }
    }
  }
  const { data: connections, error } = useSWR(``, getConnections, {
    shouldRetryOnError: false
  })
  const isLoading = !connections?.data && !error

  const modalHeight = document.getElementById('modal-component')?.clientHeight

  return (
    <div className="relative -m-6 bg-white sm:rounded-lg h-modal" style={{ height: '34rem' }}>
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
          <p className="max-w-2xl mt-1 text-sm text-gray-500">
            {error && <span className="mb-2 text-red-600">{error}</span>}
          </p>
        </div>
        <SelectConnection
          connections={connections?.data || []}
          connection={connection}
          setConnection={setConnection}
          isLoading={isLoading}
        />
      </div>
      <div
        className="px-4 py-5 overflow-y-auto border-t border-gray-200 sm:px-6"
        style={{
          height:
            typeof window !== 'undefined' && modalHeight ? modalHeight - 70 : 'calc(100% - 70px)'
        }}
      >
        {connection ? (
          <ToastProvider>
            <FilesContainer onSelect={onSelect} connection={connection} />
          </ToastProvider>
        ) : !connections && !isLoading ? (
          <div className="flex items-center justify-center border-2 border-gray-200 border-dashed rounded-lg h-96 empty">
            <div className="text-center">
              {error && <p className="text-gray-700 text-sm">Your session is invalid</p>}
              {isLoading && 'Loading...'}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
