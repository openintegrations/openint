'use client'

import {createContext, useContext, useState} from 'react'

const ConnectContext = createContext<{
  isConnecting: boolean
  setIsConnecting: (val: boolean) => void
}>({
  isConnecting: false,
  setIsConnecting: () => {},
})

export const useConnectContext = () => useContext(ConnectContext)

export const ConnectContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  return (
    <ConnectContext.Provider
      value={{
        isConnecting,
        setIsConnecting,
      }}>
      {children}
    </ConnectContext.Provider>
  )
}
