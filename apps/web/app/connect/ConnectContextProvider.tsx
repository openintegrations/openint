'use client'

import {useQueryClient} from '@tanstack/react-query'
import {createContext, useContext, useEffect, useRef, useState} from 'react'
import {useTRPC} from '@/lib-client/TRPCApp'

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
  const queryClient = useQueryClient()
  const trpc = useTRPC()
  const isFirstRender = useRef(true)

  useEffect(() => {
    console.log('isConnecting change to', isConnecting)
    // this is done so that the first render doesn't trigger the refetch
    if (isFirstRender.current) {
      console.log(
        'skipping invalidation of queries on first render on first render',
      )
      isFirstRender.current = false
      return
    }

    if (!isConnecting) {
      console.log('invalidating queries in ConnectContextProvider')
      // Need to invalidate listConnections regardless of params. operating on a prefix basis
      // back up in case refetchQueries doesn't work, query is still marked as stale
      void queryClient.invalidateQueries({
        queryKey: trpc.listConnections.queryKey({}),
      })
      // We also invalidate listCustomers here to ensure that the customer list connection count is updated
      void queryClient.invalidateQueries({
        queryKey: trpc.listCustomers.queryKey(),
      })
      // Immediately trigger refetch to not need to wait until refetchOnMount
      void queryClient.refetchQueries({
        // stale: true, // This is another option
        queryKey: trpc.listConnections.queryKey({}),
      })
    }
  }, [isConnecting])

  console.log('ConnectContextProvider render', isConnecting)
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
